export interface Category {
  id: string;
  name: string;
  description: string;
}

export type CreateCategoryInput = Omit<Category, 'id'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
