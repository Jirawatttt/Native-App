import type { Status } from './api';

// ชื่อย่อสิทธิ ใช้บนแกนกราฟแท่ง
export const SHORT_NAME: Record<string, string> = {
  'เบี้ยยังชีพผู้สูงอายุ': 'เบี้ยผู้สูงอายุ',
  'เบี้ยความพิการ': 'เบี้ยผู้พิการ',
  'สวัสดิการแห่งรัฐ (บัตรคนจน)': 'บัตรคนจน',
  'ประกันสังคม มาตรา 33': 'ม.33',
  'ประกันสังคม มาตรา 39': 'ม.39',
  'ประกันสังคม มาตรา 40': 'ม.40',
  'เงินอุดหนุนเด็กแรกเกิด': 'เด็กแรกเกิด',
  'สิทธิหลักประกันสุขภาพถ้วนหน้า (บัตรทอง)': 'บัตรทอง',
};

// ชื่อหมวดหมู่สิทธิ ใช้ในกราฟวงกลม
export const CATEGORY_NAME: Record<string, string> = {
  elderly: 'ผู้สูงอายุ',
  disability: 'ผู้พิการ',
  income_support: 'สวัสดิการรายได้',
  social_security: 'ประกันสังคม',
  family: 'ครอบครัว/เด็กแรกเกิด',
  healthcare: 'สุขภาพ',
};

export const STATUS_LABEL: Record<Status, string> = {
  likely_eligible: 'อาจมีสิทธิ',
  needs_verification: 'อาจมีสิทธิ แต่ต้องตรวจสอบเพิ่ม',
  not_eligible: 'ยังไม่น่ามีสิทธิจากข้อมูลที่ระบุ',
};

export const STATUS_ORDER: Status[] = ['likely_eligible', 'needs_verification', 'not_eligible'];
