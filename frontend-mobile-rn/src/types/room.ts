export interface CategoryOption {
  id: string;
  label: string;
  group: string;
  description?: string;
}

export interface CategoryGroup {
  title: string;
  categories: CategoryOption[];
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUri: string | null;
  role?: string;
}

export interface RoomPayload {
  title: string;
  category: CategoryOption;
  members: UserProfile[];
  description?: string;
}
