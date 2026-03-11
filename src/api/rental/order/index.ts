import request from '@/utils/request';
import type { CreateOrderForm, OrderQuery, RentalOrderVO } from './types';
import type { AxiosPromise } from 'axios';

/** 分页查询租赁订单列表 */
export function listOrder(query: OrderQuery): AxiosPromise<{ rows: RentalOrderVO[]; total: number }> {
  return request({
    url: '/rental/order/list',
    method: 'get',
    params: query
  });
}

/** 租车：创建订单 */
export function createOrder(data: CreateOrderForm): AxiosPromise<RentalOrderVO> {
  return request({
    url: '/rental/order/create',
    method: 'post',
    data
  });
}

/** 还车：完成订单 */
export function returnCar(orderId: number | string): AxiosPromise<RentalOrderVO> {
  return request({
    url: '/rental/order/return/' + orderId,
    method: 'put'
  });
}
