export interface RentalOrderVO {
  orderId: number | string;
  orderNo: string;
  customerId: number | string;
  carId: number | string;
  rentStartDate: string;
  rentEndDate: string;
  totalAmount: number;
  orderStatus: string;
  createTime: string;
}

export interface CreateOrderForm {
  customerId: number | string;
  carId: number | string;
  rentStartDate: string;
  rentEndDate: string;
}

export interface OrderQuery extends PageQuery {
  orderNo?: string;
  customerId?: number | string;
  carId?: number | string;
  orderStatus?: string;
}
