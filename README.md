# LIFTLAB — Mobile-First Fitness & Progressive Overload Tracker

เว็บแอปพลิเคชันสำหรับบันทึกตารางการฝึกเวทเทรนนิ่งและติดตามพัฒนาการ (Progressive Overload) ออกแบบส่วนติดต่อผู้ใช้แบบ Mobile-First เพื่อความรวดเร็วและใช้งานมือเดียวได้สะดวกขณะฝึกในยิม

🔗 **ทดลองใช้งานจริง (Live Demo):** https://nueame.github.io/LiftLab/

## ฟีเจอร์หลัก (Key Features)
- **Analytics & Calculation:** คำนวณค่าประมาณการน้ำหนักสูงสุดที่ยกได้ใน 1 ครั้ง (Est. 1RM) ด้วยสูตร Epley Formula พร้อมสรุปปริมาณการฝึก (Volume) และประเมินความพร้อมของกล้ามเนื้อ (Muscle Readiness)
- **Smart Workout Flow:** ระบบจับเวลาพักอัตโนมัติ (Auto Rest Timer) ปรับตามโหมดพลังงาน และคลังท่าฝึกกว่า 40 ท่าพร้อมคำอธิบายสำหรับผู้เริ่มต้น
- **Local-First Architecture:** จัดเก็บและประมวลผลข้อมูลบน LocalStorage ของเบราว์เซอร์โดยตรง ทำงานได้รวดเร็วแม้ในพื้นที่อับสัญญาณอินเทอร์เน็ต พร้อมระบบ Export/Import ไฟล์ JSON

## เทคโนโลยีที่ใช้ (Tech Stack)
- React, TypeScript, Tailwind CSS, Vite
- LocalStorage & GitHub Pages

## วิธีติดตั้งและรันโปรเจกต์บนเครื่อง (Run Locally)
1. ติดตั้งแพ็กเกจที่จำเป็น: `npm install --legacy-peer-deps`
2. รันเซิร์ฟเวอร์จำลอง: `npm run dev`
