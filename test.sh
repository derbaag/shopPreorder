#!/bin/bash
echo "🔍 กำลัง Test Build..."
echo ""
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "================================"
  echo "✅ Build ผ่าน! พร้อม Deploy"
  echo "================================"
  echo "ตอนนี้ค่อย git push ได้ ไม่เปลืองเครดิต"
else
  echo ""
  echo "================================"
  echo "❌ Build พัง! ห้าม Push เด็ดขาด"
  echo "================================"
  echo "แก้โค้ดก่อน แล้วรัน npm run build ใหม่"
fi
