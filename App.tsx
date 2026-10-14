import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootStackParamList } from './src/types/navigation';
import { Colors, Fonts } from './src/theme/colors';

// 4 Screens according to Section 4 of PDF
import { CourseListScreen } from './src/screens/CourseListScreen';
import { CourseDetailScreen } from './src/screens/CourseDetailScreen';
import { CourseFormScreen } from './src/screens/CourseFormScreen';
import { CategoryManagementScreen } from './src/screens/CategoryManagementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="CourseList"
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.paper,
            },
            headerTintColor: Colors.evergreen,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
              color: Colors.evergreen,
              fontFamily: Fonts.serif,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: Colors.paper,
            },
          }}
        >
          {/* Màn hình 1: Danh sách khóa học */}
          <Stack.Screen
            name="CourseList"
            component={CourseListScreen}
            options={{
              title: 'Thư viện khóa học',
              headerShown: false,
            }}
          />

          {/* Màn hình 2: Chi tiết khóa học */}
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{
              title: 'Chi tiết khóa học',
              headerBackTitle: 'Thư viện',
            }}
          />

          {/* Màn hình 3: Form thêm / sửa khóa học */}
          <Stack.Screen
            name="CourseForm"
            component={CourseFormScreen}
            options={({ route }) => ({
              title: route.params?.courseId ? 'Hiệu đính khóa học' : 'Biên soạn khóa học',
              headerBackTitle: 'Quay lại',
            })}
          />

          {/* Màn hình 4: Quản lý danh mục */}
          <Stack.Screen
            name="CategoryManagement"
            component={CategoryManagementScreen}
            options={{
              title: 'Quản lý danh mục',
              headerBackTitle: 'Thư viện',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
