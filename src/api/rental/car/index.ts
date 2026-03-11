import request from '@/utils/request';
import type { CarForm, CarQuery, CarVO } from './types';
import type { AxiosPromise } from 'axios';

/** 分页查询车辆列表 */
export function listCar(query: CarQuery): AxiosPromise<{ rows: CarVO[]; total: number }> {
  return request({
    url: '/rental/car/list',
    method: 'get',
    params: query
  });
}

/** 查询车辆详情 */
export function getCar(carId: string | number): AxiosPromise<CarVO> {
  return request({
    url: '/rental/car/' + carId,
    method: 'get'
  });
}

/** 新增车辆 */
export function addCar(data: CarForm) {
  return request({
    url: '/rental/car',
    method: 'post',
    data
  });
}

/** 修改车辆 */
export function updateCar(data: CarForm) {
  return request({
    url: '/rental/car',
    method: 'put',
    data
  });
}

/** 删除车辆 */
export function delCar(carIds: string | number | (string | number)[]) {
  return request({
    url: '/rental/car/' + carIds,
    method: 'delete'
  });
}
