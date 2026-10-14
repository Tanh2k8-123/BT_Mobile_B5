#!/usr/bin/env node
/**
 * mock-api-server.mjs
 * Standalone MockAPI clone implemented using Node's built-in http module.
 * Provides identical endpoints, behavior, status codes and JSON formatting as MockAPI.io.
 *
 * Endpoints:
 *   GET, POST /api/v1/categories
 *   GET, PUT, DELETE /api/v1/categories/:id
 *   GET, POST /api/v1/courses
 *   GET, PUT, DELETE /api/v1/courses/:id
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const categoriesSamplePath = path.join(__dirname, '../data/categories.sample.json');
const coursesSamplePath = path.join(__dirname, '../data/courses.sample.json');

let categories = JSON.parse(fs.readFileSync(categoriesSamplePath, 'utf8'));
let courses = JSON.parse(fs.readFileSync(coursesSamplePath, 'utf8'));

let nextCatId = categories.reduce((max, c) => Math.max(max, parseInt(c.id, 10) || 0), 0) + 1;
let nextCourseId = courses.reduce((max, c) => Math.max(max, parseInt(c.id, 10) || 0), 0) + 1;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname.replace(/\/+$/, '');

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

  // Base ping
  if (pathname === '' || pathname === '/api/v1' || pathname === '/') {
    return sendJson(res, 200, {
      message: 'MockAPI Course Management REST Service is running',
      endpoints: [
        '/api/v1/categories',
        '/api/v1/categories/:id',
        '/api/v1/courses',
        '/api/v1/courses/:id',
      ],
      categoriesCount: categories.length,
      coursesCount: courses.length,
    });
  }

  // CATEGORIES
  if (pathname === '/api/v1/categories') {
    if (req.method === 'GET') {
      return sendJson(res, 200, categories);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const newCat = {
          id: String(nextCatId++),
          name: String(body.name || '').trim(),
          description: String(body.description || '').trim(),
        };
        categories.push(newCat);
        return sendJson(res, 201, newCat);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  const catMatch = pathname.match(/^\/api\/v1\/categories\/([^\/]+)$/);
  if (catMatch) {
    const id = catMatch[1];
    const index = categories.findIndex(c => String(c.id) === String(id));

    if (req.method === 'GET') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      return sendJson(res, 200, categories[index]);
    }
    if (req.method === 'PUT') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      try {
        const body = await parseBody(req);
        categories[index] = {
          ...categories[index],
          name: body.name !== undefined ? String(body.name).trim() : categories[index].name,
          description: body.description !== undefined ? String(body.description).trim() : categories[index].description,
        };
        return sendJson(res, 200, categories[index]);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
    if (req.method === 'DELETE') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      const removed = categories.splice(index, 1)[0];
      return sendJson(res, 200, removed);
    }
  }

  // COURSES
  if (pathname === '/api/v1/courses') {
    if (req.method === 'GET') {
      return sendJson(res, 200, courses);
    }
    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const newCourse = {
          id: String(nextCourseId++),
          title: String(body.title || '').trim(),
          description: String(body.description || '').trim(),
          categoryId: String(body.categoryId || ''),
          instructor: String(body.instructor || '').trim(),
          price: Number(body.price) || 0,
          duration: Number(body.duration) || 0,
          thumbnail: String(body.thumbnail || '').trim(),
          trailerUrl: String(body.trailerUrl || '').trim(),
          createdAt: body.createdAt || new Date().toISOString().split('T')[0],
        };
        courses.push(newCourse);
        return sendJson(res, 201, newCourse);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
  }

  const courseMatch = pathname.match(/^\/api\/v1\/courses\/([^\/]+)$/);
  if (courseMatch) {
    const id = courseMatch[1];
    const index = courses.findIndex(c => String(c.id) === String(id));

    if (req.method === 'GET') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      return sendJson(res, 200, courses[index]);
    }
    if (req.method === 'PUT') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      try {
        const body = await parseBody(req);
        courses[index] = {
          ...courses[index],
          title: body.title !== undefined ? String(body.title).trim() : courses[index].title,
          description: body.description !== undefined ? String(body.description).trim() : courses[index].description,
          categoryId: body.categoryId !== undefined ? String(body.categoryId) : courses[index].categoryId,
          instructor: body.instructor !== undefined ? String(body.instructor).trim() : courses[index].instructor,
          price: body.price !== undefined ? Number(body.price) : courses[index].price,
          duration: body.duration !== undefined ? Number(body.duration) : courses[index].duration,
          thumbnail: body.thumbnail !== undefined ? String(body.thumbnail).trim() : courses[index].thumbnail,
          trailerUrl: body.trailerUrl !== undefined ? String(body.trailerUrl).trim() : courses[index].trailerUrl,
          createdAt: body.createdAt || courses[index].createdAt,
        };
        return sendJson(res, 200, courses[index]);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }
    if (req.method === 'DELETE') {
      if (index === -1) return sendJson(res, 404, 'Not found');
      const removed = courses.splice(index, 1)[0];
      return sendJson(res, 200, removed);
    }
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` MockAPI Local Server is running!`);
  console.log(` Endpoint: http://localhost:${PORT}/api/v1`);
  console.log(` - Categories: http://localhost:${PORT}/api/v1/categories (${categories.length} items)`);
  console.log(` - Courses:    http://localhost:${PORT}/api/v1/courses (${courses.length} items)`);
  console.log(`======================================================\n`);
});
