
export interface CarVO {
  carId: number | string;
  plateNumber: string;
  brandModel: string;
  carImageUrl: string;
  dailyRate: number;
  carStatus: string;
  createTime: string;
}

export interface CarForm {
  carId?: number | string;
  plateNumber: string;
  brandModel: string;
  carImageUrl?: string;
  dailyRate: number;
  carStatus?: string;
}

export interface CarQuery extends PageQuery {
  plateNumber?: string;
  brandModel?: string;
  carStatus?: string;
}
