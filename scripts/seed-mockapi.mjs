#!/usr/bin/env node
/**
 * seed-mockapi.mjs
 * Script to automatically populate any MockAPI.io project URL with 3 categories and 10 courses.
 *
 * Usage:
 *   node scripts/seed-mockapi.mjs <BASE_URL>
 * Example:
 *   node scripts/seed-mockapi.mjs https://670b8f057e5a228ebd6bf3ef.mockapi.io/api/v1
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesPath = path.join(__dirname, '../data/categories.sample.json');
const coursesPath = path.join(__dirname, '../data/courses.sample.json');

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

let targetUrl = process.argv[2] || process.env.MOCKAPI_URL || 'http://localhost:3000/api/v1';
targetUrl = targetUrl.replace(/\/+$/, '');

console.log(`\n========================================`);
console.log(`MockAPI Seeding Tool`);
console.log(`Target: ${targetUrl}`);
console.log(`========================================\n`);

async function seed() {
  try {
    console.log(`[1/3] Kiểm tra kết nối tới ${targetUrl}...`);
    try {
      const ping = await fetch(`${targetUrl}/categories`);
      if (!ping.ok && ping.status !== 404) {
        console.warn(`Lưu ý: API phản hồi status ${ping.status}`);
      } else {
        console.log(`-> Kết nối thành công!`);
      }
    } catch (err) {
      console.warn(`Không thể ping trước (${err.message}). Vẫn tiếp tục thử seed...`);
    }

    console.log(`\n[2/3] Bắt đầu thêm ${categories.length} danh mục vào /categories...`);
    const categoryIdMap = new Map();

    for (const cat of categories) {
      try {
        const res = await fetch(`${targetUrl}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cat.name,
            description: cat.description,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          categoryIdMap.set(cat.id, created.id);
          console.log(`  + [OK] Đã tạo danh mục: "${created.name}" (ID cũ: ${cat.id} -> ID mới: ${created.id})`);
        } else {
          console.error(`  - [FAIL] Không tạo được danh mục "${cat.name}": status ${res.status}`);
        }
      } catch (e) {
        console.error(`  - [ERROR] Lỗi khi tạo danh mục "${cat.name}":`, e.message);
      }
    }

    console.log(`\n[3/3] Bắt đầu thêm ${courses.length} khóa học vào /courses...`);
    for (const course of courses) {
      const realCategoryId = categoryIdMap.get(course.categoryId) || course.categoryId;
      const payload = {
        title: course.title,
        description: course.description,
        categoryId: String(realCategoryId),
        instructor: course.instructor,
        price: Number(course.price),
        duration: Number(course.duration),
        thumbnail: course.thumbnail,
        trailerUrl: course.trailerUrl,
        createdAt: course.createdAt || new Date().toISOString().split('T')[0],
      };

      try {
        const res = await fetch(`${targetUrl}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          console.log(`  + [OK] Đã tạo khóa học: "${created.title}" (ID: ${created.id}, CategoryId: ${created.categoryId})`);
        } else {
          console.error(`  - [FAIL] Không tạo được khóa học "${course.title}": status ${res.status}`);
        }
      } catch (e) {
        console.error(`  - [ERROR] Lỗi khi tạo khóa học "${course.title}":`, e.message);
      }
    }

    console.log(`\n========================================`);
    console.log(`HOÀN TẤT SEED DỮ LIỆU!`);
    console.log(`Đã khởi tạo danh mục và khóa học vào API thành công.`);
    console.log(`========================================\n`);
  } catch (globalErr) {
    console.error('Lỗi toàn cục trong quá trình seed:', globalErr);
  }
}

seed();
