<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="车牌号" prop="plateNumber">
              <el-input v-model="queryParams.plateNumber" placeholder="请输入车牌号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="品牌车型" prop="brandModel">
              <el-input v-model="queryParams.brandModel" placeholder="请输入品牌车型" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="车辆状态" prop="carStatus">
              <el-select v-model="queryParams.carStatus" placeholder="请选择" clearable>
                <el-option v-for="item in carStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
            <el-button v-hasPermi="['rental:car:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:car:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:car:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:car:export']" type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="carList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="车辆主图" align="center" prop="carImageUrl" width="100">
          <template #default="scope">
            <ImagePreview v-if="scope.row.carImageUrl" :width="80" :height="60" :src="scope.row.carImageUrl" />
            <span v-else class="text-gray-400">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column label="车牌号" align="center" prop="plateNumber" />
        <el-table-column label="品牌车型" align="center" prop="brandModel" :show-overflow-tooltip="true" />
        <el-table-column label="日租金(元)" align="center" prop="dailyRate" width="100" />
        <el-table-column label="车辆状态" align="center" prop="carStatus" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.carStatus === '0'" type="success">待租</el-tag>
            <el-tag v-else-if="scope.row.carStatus === '1'" type="warning">已租出</el-tag>
            <el-tag v-else-if="scope.row.carStatus === '2'" type="info">维护中</el-tag>
            <span v-else>{{ scope.row.carStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="入库时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" width="150" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['rental:car:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['rental:car:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body>
      <el-form ref="carFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="品牌车型" prop="brandModel">
          <el-input v-model="form.brandModel" placeholder="如：丰田卡罗拉" />
        </el-form-item>
        <el-form-item label="车辆主图" prop="carImageUrl">
          <div v-if="form.carImageUrl" class="mb-2">
            <ImagePreview :width="120" :height="90" :src="form.carImageUrl" />
            <el-button type="primary" link size="small" class="ml-2" @click="form.carImageUrl = ''; carImageOssId = ''">更换图片</el-button>
          </div>
          <ImageUpload v-else v-model="carImageOssId" :limit="1" :is-show-tip="true" />
        </el-form-item>
        <el-form-item label="日租金(元)" prop="dailyRate">
          <el-input-number v-model="form.dailyRate" :min="0" :precision="2" controls-position="right" placeholder="请输入日租金" style="width: 100%" />
        </el-form-item>
        <el-form-item label="车辆状态" prop="carStatus">
          <el-radio-group v-model="form.carStatus">
            <el-radio v-for="item in carStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
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

<script setup name="Car" lang="ts">
import { listCar, getCar, addCar, updateCar, delCar } from '@/api/rental/car';
import type { CarForm, CarQuery, CarVO } from '@/api/rental/car/types';
import { listByIds } from '@/api/system/oss';
import ImageUpload from '@/components/ImageUpload/index.vue';
import ImagePreview from '@/components/ImagePreview/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const carList = ref<CarVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const carImageOssId = ref('');

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const carFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const carStatusOptions = [
  { label: '待租', value: '0' },
  { label: '已租出', value: '1' },
  { label: '维护中', value: '2' }
];

const initFormData: CarForm = {
  plateNumber: '',
  brandModel: '',
  carImageUrl: '',
  dailyRate: 0,
  carStatus: '0'
};

const data = reactive<PageData<CarForm, CarQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plateNumber: '',
    brandModel: '',
    carStatus: ''
  },
  rules: {
    plateNumber: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
    brandModel: [{ required: true, message: '品牌车型不能为空', trigger: 'blur' }],
    dailyRate: [{ required: true, message: '日租金不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// ImageUpload 上传后得到 ossId，需转换为 URL 提交
watch(carImageOssId, async (val) => {
  if (val) {
    try {
      const res = await listByIds(val);
      if (res.data?.[0]?.url) {
        form.value.carImageUrl = res.data[0].url;
      }
    } catch {
      // ignore
    }
  }
});

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCar(queryParams.value);
  carList.value = res.rows;
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
const handleSelectionChange = (selection: CarVO[]) => {
  ids.value = selection.map((item) => item.carId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增车辆';
};

/** 修改 */
const handleUpdate = async (row?: CarVO) => {
  reset();
  const carId = row?.carId ?? ids.value[0];
  const res = await getCar(carId);
  Object.assign(form.value, res.data);
  carImageOssId.value = '';
  dialog.visible = true;
  dialog.title = '修改车辆';
};

/** 提交 */
const submitForm = async () => {
  await carFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    // ImageUpload 返回 ossId，提交前转换为 URL
    if (carImageOssId.value && !form.value.carImageUrl) {
      try {
        const res = await listByIds(carImageOssId.value);
        form.value.carImageUrl = res.data?.[0]?.url || '';
      } catch {
        proxy?.$modal.msgError('获取图片地址失败');
        return;
      }
    }
    if (form.value.carId) {
      await updateCar(form.value);
    } else {
      await addCar(form.value);
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
  carImageOssId.value = '';
  carFormRef.value?.resetFields();
};

/** 删除 */
const handleDelete = async (row?: CarVO) => {
  const carIds = row?.carId ?? ids.value;
  await proxy?.$modal.confirm('是否确认删除所选车辆？');
  await delCar(carIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出 */
const handleExport = () => {
  proxy?.download('rental/car/export', { ...queryParams.value }, `car_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
