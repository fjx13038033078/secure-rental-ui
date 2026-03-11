export interface CustomerVO {
  customerId: number | string;
  customerName: string;
  /** 脱敏展示，如 138****5678 */
  phone: string;
  /** 脱敏展示，如 110101********1234 */
  idCard: string;
  accountStatus: string;
  createTime: string;
}

export interface CustomerForm {
  customerId?: number | string;
  customerName: string;
  phone: string;
  idCard: string;
  accountStatus?: string;
}

export interface CustomerQuery extends PageQuery {
  customerName?: string;
  phone?: string;
  accountStatus?: string;
}
