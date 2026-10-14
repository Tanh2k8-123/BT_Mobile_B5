import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Course } from './course';

export type RootStackParamList = {
  CourseList: undefined;
  CourseDetail: { courseId: string };
  CourseForm: { courseId?: string; initialCourse?: Course };
  CategoryManagement: undefined;
};

export type CourseListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseList'>;
export type CourseDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
export type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
export type CourseFormNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseForm'>;
export type CourseFormRouteProp = RouteProp<RootStackParamList, 'CourseForm'>;
export type CategoryManagementNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryManagement'>;
