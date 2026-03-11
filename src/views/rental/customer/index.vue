<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="姓名" prop="customerName">
              <el-input v-model="queryParams.customerName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:customer:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:customer:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:customer:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:customer:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="customerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="客户ID" align="center" prop="customerId" width="90" />
        <el-table-column label="客户姓名" align="center" prop="customerName" />
        <el-table-column label="手机号" align="center" prop="phone" width="130" />
        <el-table-column label="身份证号" align="center" prop="idCard" width="180" :show-overflow-tooltip="true" />
        <el-table-column label="账号状态" align="center" prop="accountStatus" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.accountStatus === '0'" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.accountStatus === '1'" type="danger">冻结</el-tag>
            <span v-else>{{ scope.row.accountStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" width="150" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['rental:customer:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['rental:customer:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="520px" append-to-body>
      <el-form ref="customerFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入11位手机号" maxlength="11" show-word-limit />
          <div v-if="form.customerId && isMasked(form.phone)" class="text-amber-600 text-xs mt-1">
            当前为脱敏数据，修改时请重新输入完整手机号
          </div>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入18位身份证号" maxlength="18" show-word-limit />
          <div v-if="form.customerId && isMasked(form.idCard)" class="text-amber-600 text-xs mt-1">
            当前为脱敏数据，修改时请重新输入完整身份证号
          </div>
        </el-form-item>
        <el-form-item label="账号状态" prop="accountStatus">
          <el-radio-group v-model="form.accountStatus">
            <el-radio v-for="item in accountStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Customer" lang="ts">
import { listCustomer, getCustomer, addCustomer, updateCustomer, delCustomer } from '@/api/rental/customer';
import type { CustomerForm, CustomerQuery, CustomerVO } from '@/api/rental/customer/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const customerList = ref<CustomerVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const customerFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const accountStatusOptions = [
  { label: '正常', value: '0' },
  { label: '冻结', value: '1' }
];

const initFormData: CustomerForm = {
  customerName: '',
  phone: '',
  idCard: '',
  accountStatus: '0'
};

const data = reactive<PageData<CustomerForm, CustomerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: '',
    phone: '',
    accountStatus: ''
  },
  rules: {
    customerName: [{ required: true, message: '客户姓名不能为空', trigger: 'blur' }],
    phone: [
      { required: true, message: '手机号不能为空', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, cb: (e?: Error) => void) => {
          if (!value) return cb();
          if (value.includes('*')) return cb(new Error('当前为脱敏数据，请重新输入完整手机号'));
          if (!/^1[3-9]\d{9}$/.test(value)) return cb(new Error('请输入正确的11位手机号'));
          cb();
        },
        trigger: 'blur'
      }
    ],
    idCard: [
      { required: true, message: '身份证号不能为空', trigger: 'blur' },
      {
        validator: (_: unknown, value: string, cb: (e?: Error) => void) => {
          if (!value) return cb();
          if (value.includes('*')) return cb(new Error('当前为脱敏数据，请重新输入完整身份证号'));
          if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) return cb(new Error('请输入正确的15或18位身份证号'));
          cb();
        },
        trigger: 'blur'
      }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 判断是否为脱敏数据（包含星号） */
const isMasked = (val: string | undefined): boolean => {
  return !!val && val.includes('*');
};

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCustomer(queryParams.value);
  customerList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 搜索 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选 */
const handleSelectionChange = (selection: CustomerVO[]) => {
  ids.value = selection.map((item) => item.customerId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增客户';
};

/** 修改 */
const handleUpdate = async (row?: CustomerVO) => {
  reset();
  const customerId = row?.customerId ?? ids.value[0];
  const res = await getCustomer(customerId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改客户';
};

/** 防傻校验：修改时若手机号/身份证号仍为脱敏数据，禁止提交 */
const validateNoMaskedData = (): boolean => {
  if (!form.value.customerId) return true;
  if (isMasked(form.value.phone)) {
    proxy?.$modal.msgError('手机号为脱敏数据，请重新输入完整手机号后再提交');
    return false;
  }
  if (isMasked(form.value.idCard)) {
    proxy?.$modal.msgError('身份证号为脱敏数据，请重新输入完整身份证号后再提交');
    return false;
  }
  return true;
};

/** 提交 */
const submitForm = async () => {
  await customerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (!validateNoMaskedData()) return;
    if (form.value.customerId) {
      await updateCustomer(form.value);
    } else {
      await addCustomer(form.value);
    }
    proxy?.$modal.msgSuccess('操作成功');
    dialog.visible = false;
    await getList();
  });
};

/** 取消 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 重置表单 */
const reset = () => {
  form.value = { ...initFormData };
  customerFormRef.value?.resetFields();
};

/** 删除 */
const handleDelete = async (row?: CustomerVO) => {
  const customerIds = row?.customerId ?? ids.value;
  await proxy?.$modal.confirm('是否确认删除所选客户？');
  await delCustomer(customerIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出 */
const handleExport = () => {
  proxy?.download('rental/customer/export', { ...queryParams.value }, `customer_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
