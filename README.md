# 📖 AnyFlip Downloader (Web)

ดาวน์โหลดหนังสือ flipbook จาก [AnyFlip](https://anyflip.com) เป็นไฟล์ **PDF** ง่ายๆ
ในเบราว์เซอร์ — **ไม่ต้องใช้ terminal ไม่ต้องติดตั้งอะไรเลย** แค่วางลิงก์แล้วกดปุ่มเดียว

> Download AnyFlip flipbooks as a PDF straight from your browser — no terminal, no install.

⭐ ถ้าชอบ ฝาก Star ให้หน่อยนะครับ &nbsp;·&nbsp; ☕ [เลี้ยงกาแฟกันได้](https://www.buymeacoffee.com/artty3354s)

---

## ✨ ฟีเจอร์

- วางลิงก์ AnyFlip → ได้ PDF ทันที (รองรับลิงก์หลายรูปแบบ)
- สร้าง PDF **ในเครื่องผู้ใช้เอง** ผ่านเบราว์เซอร์ — ไม่เก็บไฟล์บนเซิร์ฟเวอร์ ความเป็นส่วนตัวสูง
- แถบแสดงความคืบหน้าทีละหน้า
- รองรับทั้งหนังสือที่ตั้งชื่อไฟล์แบบลำดับเลขและแบบ hash โดยอัตโนมัติ
- โอเพนซอร์ส MIT

## 🚀 เริ่มต้นใช้งาน (สำหรับ dev)

```bash
npm install
npm run dev      # เปิด http://localhost:3000
```

Build สำหรับ production:

```bash
npm run build && npm start
```

## ☁️ Deploy

แนะนำ [Vercel](https://vercel.com): push โค้ดขึ้น GitHub แล้ว import repo — เสร็จในคลิกเดียว
(API routes ทำงานเป็น serverless functions ให้อัตโนมัติ)

ตั้งค่าลิงก์ของคุณเองผ่าน environment variables (ไม่บังคับ):

| ตัวแปร | ใช้ทำอะไร |
| --- | --- |
| `NEXT_PUBLIC_GITHUB_URL` | ลิงก์ repo สำหรับปุ่ม Star |
| `NEXT_PUBLIC_COFFEE_URL` | ลิงก์ Buy Me a Coffee / Ko-fi |
| `NEXT_PUBLIC_SITE_URL` | โดเมนเว็บ (ใช้กับ meta tags) |

หรือแก้ค่าเริ่มต้นได้ที่ [`lib/config.ts`](lib/config.ts)

## 🧠 ทำงานยังไง

1. ฝั่งเซิร์ฟเวอร์อ่านไฟล์ config ของหนังสือ เพื่อหา **จำนวนหน้า ชื่อเรื่อง และลิงก์รูปแต่ละหน้า**
2. เบราว์เซอร์โหลดรูปแต่ละหน้าผ่าน proxy ของเราเอง (กันปัญหา cross-origin และ
   ป้องกันการถูกใช้เป็น open proxy ด้วย host allowlist)
3. ถอดรหัสรูป WebP ด้วย `<canvas>` แล้วประกอบเป็น PDF ด้วย
   [jsPDF](https://github.com/parallax/jsPDF) — ทั้งหมดเกิดขึ้นในเครื่องผู้ใช้

> สถาปัตยกรรมโดยรวมอยู่ใน [`lib/anyflip.ts`](lib/anyflip.ts) และ [`lib/pdf.ts`](lib/pdf.ts)

## ⚖️ ข้อกำหนดการใช้งาน

เครื่องมือนี้สร้างขึ้นเพื่อการศึกษาและสำรองเนื้อหา **ที่คุณมีสิทธิ์เข้าถึงโดยชอบด้วยกฎหมายเท่านั้น**
โปรดเคารพลิขสิทธิ์ของเจ้าของผลงาน ผู้พัฒนาไม่มีส่วนเกี่ยวข้องกับ AnyFlip
และไม่รับผิดชอบต่อการนำไปใช้ในทางที่ผิด

## 📄 License

[MIT](LICENSE)
