<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['rental:order:add']" type="primary" plain icon="Plus" @click="handleCreateOrder">新建租车单</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="orderList">
        <el-table-column label="订单号" align="center" prop="orderNo" width="180" />
        <el-table-column label="客户ID" align="center" prop="customerId" width="90" />
        <el-table-column label="车辆ID" align="center" prop="carId" width="90" />
        <el-table-column label="起租日期" align="center" prop="rentStartDate" width="120" />
        <el-table-column label="预计还车日期" align="center" prop="rentEndDate" width="120" />
        <el-table-column label="总金额(元)" align="center" prop="totalAmount" width="100" />
        <el-table-column label="订单状态" align="center" prop="orderStatus" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.orderStatus === '0'" type="warning">租用中</el-tag>
            <el-tag v-else-if="scope.row.orderStatus === '1'" type="success">已还车</el-tag>
            <el-tag v-else-if="scope.row.orderStatus === '2'" type="info">已取消</el-tag>
            <span v-else>{{ scope.row.orderStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" width="100" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip v-if="scope.row.orderStatus === '0'" content="还车" placement="top">
              <el-button v-hasPermi="['rental:order:edit']" link type="primary" icon="CircleCheck" @click="handleReturnCar(scope.row)">还车</el-button>
            </el-tooltip>
            <span v-else class="text-gray-400">—</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 新建租车单弹窗 -->
    <el-dialog v-model="createDialog.visible" title="新建租车单" width="480px" append-to-body>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="createForm.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="item in customerOptions" :key="item.customerId" :label="`${item.customerName} (ID:${item.customerId})`" :value="item.customerId" />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆" prop="carId">
          <el-select v-model="createForm.carId" placeholder="请选择待租车辆" filterable style="width: 100%">
            <el-option v-for="item in carOptions" :key="item.carId" :label="`${item.plateNumber} - ${item.brandModel}`" :value="item.carId" />
          </el-select>
        </el-form-item>
        <el-form-item label="起租日期" prop="rentStartDate">
          <el-date-picker v-model="createForm.rentStartDate" type="date" placeholder="选择起租日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计还车日期" prop="rentEndDate">
          <el-date-picker v-model="createForm.rentEndDate" type="date" placeholder="选择预计还车日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitCreateOrder">确 定</el-button>
          <el-button @click="createDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RentalOrder" lang="ts">
import { listOrder, createOrder, returnCar } from '@/api/rental/order';
import type { CreateOrderForm, OrderQuery, RentalOrderVO } from '@/api/rental/order/types';
import { listCustomer } from '@/api/rental/customer';
import { listCar } from '@/api/rental/car';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const orderList = ref<RentalOrderVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const customerOptions = ref<Array<{ customerId: number | string; customerName: string }>>([]);
const carOptions = ref<Array<{ carId: number | string; plateNumber: string; brandModel: string }>>([]);

const createDialog = reactive({ visible: false });
const createFormRef = ref<ElFormInstance>();

const queryParams = ref<OrderQuery>({
  pageNum: 1,
  pageSize: 10
});

const initCreateForm: CreateOrderForm = {
  customerId: '',
  carId: '',
  rentStartDate: '',
  rentEndDate: ''
};

const createForm = ref<CreateOrderForm>({ ...initCreateForm });

const createRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  carId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  rentStartDate: [{ required: true, message: '请选择起租日期', trigger: 'change' }],
  rentEndDate: [
    { required: true, message: '请选择预计还车日期', trigger: 'change' },
    {
      validator: (_: unknown, value: string, cb: (e?: Error) => void) => {
        if (!value || !createForm.value.rentStartDate) return cb();
        if (value < createForm.value.rentStartDate) return cb(new Error('还车日期不能早于起租日期'));
        cb();
      },
      trigger: 'change'
    }
  ]
};

/** 查询订单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOrder(queryParams.value);
  orderList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 加载客户选项（新建租车单时） */
const loadCustomerOptions = async () => {
  const res = await listCustomer({ pageNum: 1, pageSize: 500 });
  customerOptions.value = res.rows;
};

/** 加载待租车辆选项（carStatus=0） */
const loadCarOptions = async () => {
  const res = await listCar({ pageNum: 1, pageSize: 500, carStatus: '0' });
  carOptions.value = res.rows;
};

/** 新建租车单 */
const handleCreateOrder = async () => {
  createForm.value = { ...initCreateForm };
  createFormRef.value?.resetFields();
  await Promise.all([loadCustomerOptions(), loadCarOptions()]);
  createDialog.visible = true;
};

/** 提交新建租车单 */
const submitCreateOrder = async () => {
  await createFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    await createOrder(createForm.value);
    proxy?.$modal.msgSuccess('租车单创建成功');
    createDialog.visible = false;
    await getList();
  });
};

/** 还车 */
const handleReturnCar = async (row: RentalOrderVO) => {
  try {
    await proxy?.$modal.confirm('确认该订单已完成还车？');
  } catch {
    return;
  }
  await returnCar(row.orderId);
  proxy?.$modal.msgSuccess('还车成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
