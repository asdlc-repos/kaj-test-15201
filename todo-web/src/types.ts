export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  dueDate?: string | null;
  categoryId?: string | null;
  completed?: boolean;
}

export interface CategoryInput {
  name: string;
}
