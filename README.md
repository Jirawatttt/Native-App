# Smart Rights Viewer — Native App (React Native / Expo)

แอปมือถือจริง (Android / iOS) ของระบบแสดงสิทธิประโยชน์ภาครัฐเบื้องต้น
หน้าตาและขั้นตอนเหมือนเว็บเดิม แต่ render ด้วย React Native และเรียก **Backend (Render) กับ DB (Neon) ตัวเดิม** 

## โครงสร้าง

```
src/
├── app/                 # หน้าจอ (Expo Router)
│   ├── _layout.tsx      # โหลดฟอนต์ Sarabun + Stack
│   ├── index.tsx        # หน้าแรก
│   ├── input.tsx        # กรอกข้อมูล + AI แนะนำ + แดชบอร์ดสถิติ
│   └── result.tsx       # ผลการตรวจสอบสิทธิ
├── components/          # AppHeader, Buttons, Charts, BenefitCard ฯลฯ
└── lib/
    ├── config.ts        # API_BASE (URL ของ Backend)
    ├── api.ts           # เรียก /analyze-rights, /analyze-more-rights, /suggest-input, /stats
    ├── session.tsx      # เก็บข้อความ/ผลวิเคราะห์ (แทน sessionStorage)
    ├── theme.ts         # สีและฟอนต์ชุดเดียวกับเว็บ
    └── labels.ts        # ชื่อย่อสิทธิ / หมวดหมู่ / ป้ายสถานะ
```

## รันครั้งแรก

```bash
npm install
npx expo start
```

แล้วสแกน QR ด้วยแอป **Expo Go** บนมือถือ (มือถือกับคอมต้องอยู่ Wi-Fi เดียวกัน)

## สร้างไฟล์ APK (ทดสอบ / แจกให้คนลอง)

ใช้ EAS Build (สร้างบนคลาวด์ ไม่ต้องลง Android Studio):

```bash
npm install -g eas-cli
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build:configure          # ครั้งแรกครั้งเดียว
npx eas-cli@latest build -p android --profile preview
```

เสร็จแล้วจะได้ลิงก์ดาวน์โหลดไฟล์ `.apk` (ใช้เวลาประมาณ 10-20 นาที) ส่งเข้ามือถือแล้วติดตั้งได้เลย

## ขึ้น Google Play

```bash
eas build -p android --profile production    # ได้ไฟล์ .aab
eas submit -p android
```

ต้องมีบัญชี Google Play Developer (ค่าสมัครครั้งเดียว ประมาณ 25 ดอลลาร์)
ส่วน iPhone ต้องมี Apple Developer (ประมาณ 99 ดอลลาร์/ปี) แล้วใช้ `eas build -p ios`

## ตัวตนของแอป

- Android package / iOS bundle id: `th.smartrights.app` (แก้ใน `app.json` **ก่อน** build ครั้งแรกสำหรับสโตร์ เพราะเปลี่ยนทีหลังไม่ได้)
- ชื่อแอป: Smart Rights Viewer

## ความต่างจากเว็บ

| เว็บ | แอป |
|------|-----|
| `sessionStorage` | เก็บในหน่วยความจำของแอป (`session.tsx`) |
| ปุ่ม "พิมพ์ / บันทึก PDF" | ปุ่ม "แชร์ผลลัพธ์" (เมนูแชร์ของมือถือ) |
| Chart.js | กราฟที่วาดเอง (SVG + View) |
| Service Worker / PWA | ไม่ใช้ แอปมีไฟล์ในตัวเอง |
