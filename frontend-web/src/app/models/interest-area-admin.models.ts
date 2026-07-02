export interface InterestArea {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InterestAreaMetadata {
  users_count: number;
  documents_count: number;
  topics_count: number;
}

export interface CategoryShort {
  id: string;
  name: string;
  slug: string;
}
