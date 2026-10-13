// URL ของ Backend (Render) — ตัวเดียวกับที่เว็บใช้
// เปลี่ยนได้ผ่านไฟล์ .env: EXPO_PUBLIC_API_BASE=http://192.168.x.x:8000
export const API_BASE: string =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://smart-rights-viewer.onrender.com';
