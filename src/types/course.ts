export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
}

export type CreateCourseInput = Omit<Course, 'id'>;
export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CourseWithCategory extends Course {
  categoryName?: string;
}
