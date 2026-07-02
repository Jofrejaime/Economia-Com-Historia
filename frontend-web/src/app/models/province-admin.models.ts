export interface Province {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProvinceStats {
  id: string;
  name: string;
  code: string;
  total_users: number;
}
