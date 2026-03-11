import request from '@/utils/request';
import type { CustomerForm, CustomerQuery, CustomerVO } from './types';
import type { AxiosPromise } from 'axios';

/** 分页查询客户列表 */
export function listCustomer(query: CustomerQuery): AxiosPromise<{ rows: CustomerVO[]; total: number }> {
  return request({
    url: '/rental/customer/list',
    method: 'get',
    params: query
  });
}

/** 查询客户详情 */
export function getCustomer(customerId: string | number): AxiosPromise<CustomerVO> {
  return request({
    url: '/rental/customer/' + customerId,
    method: 'get'
  });
}

/** 新增客户 */
export function addCustomer(data: CustomerForm) {
  return request({
    url: '/rental/customer',
    method: 'post',
    data
  });
}

/** 修改客户 */
export function updateCustomer(data: CustomerForm) {
  return request({
    url: '/rental/customer',
    method: 'put',
    data
  });
}

/** 删除客户 */
export function delCustomer(customerIds: string | number | (string | number)[]) {
  return request({
    url: '/rental/customer/' + customerIds,
    method: 'delete'
  });
}
