# فارمیسی پلس - فارمیسی منجنمنٹ سسٹم
## Pharmacy Management System - Complete Setup Guide

---

## 📥 ڈاؤن لوڈ اور چلانے کا مکمل طریقہ

### **آپشن 1: Vercel پر آن لائن چلائیں (سب سے آسان)**

#### مرحلہ 1: GitHub پر اپ لوڈ کریں

```bash
# 1. GitHub پر نیا ریپازٹری بنائیں
# https://github.com/new پر جائیں
# نیا ریپازٹری بنائیں (نام: pharmacy-system یا کوئی اور)

# 2. پھر یہ کمانڈز چلائیں:
cd /home/z/my-project
git init
git add .
git commit -m "فارمیسی منجنمنٹ سسٹم - Pharmacy Management System"

# 3. GitHub سے لنک کریں (اپنا URL ڈالیں)
git remote add origin https://github.com/آپ-کا-یوزرنیم/pharmacy-system.git

# 4. پش کریں
git branch -M main
git push -u origin main
```

#### مرحلہ 2: Vercel پر ڈپلائی کریں

**طریقہ A - براؤزر سے (بہت آسان):**
1. [vercel.com](https://vercel.com) پر جائیں
2. GitHub سے لاگ ان کریں
3. "Add New Project" پر کلک کریں
4. `pharmacy-system` ریپازٹری سلیکٹ کریں
5. "Deploy" پر کلک کریں
6. **1-2 منٹ میں آپ کا ایپ لائیو ہو جائے گا!**

**طریقہ B - کمانڈ لائن سے:**
```bash
# 1. Vercel انسٹال کریں
npm install -g vercel

# 2. پروجیکٹ ڈپلائی کریں
vercel

# 3. سوالوں کے جوابات:
#   - Set up and deploy? Y
#   - Link to existing project? N
#   - Project name: pharmacy-system
#   - In which directory? . (Enter)
#   - Override settings? N
```

✅ **مکمل ہونے پر آپ کو ایک URL ملے گا:**
```
https://pharmacy-system-xxx.vercel.app
```

---

### **آپشن 2: لوکل کمپیوٹر پر ڈاؤن لوڈ کریں**

#### مرحلہ 1: فائلیں ڈاؤن لوڈ کریں

1. GitHub ریپازٹری کا URL کاپی کریں
2. اپنے کمپیوٹر پر کمانڈ چلائیں:

```bash
# فائلز ڈاؤن لوڈ کریں
git clone https://github.com/آپ-کا-یوزرنیم/pharmacy-system.git
cd pharmacy-system
```

#### مرحلہ 2: انسٹال کریں

```bash
# Node.js انسٹال ہے؟
node --version

# اگر نہیں، تو https://nodejs.org سے ڈاؤن لوڈ کریں

# ڈیپینڈینسیز انسٹال کریں
npm install

# یا Bun استعمال کریں (تیز تر)
npm install -g bun
bun install
```

#### مرحلہ 3: ڈیٹا بیس سیٹ اپ کریں

```bash
# ڈیٹا بیس اسکیمہ بھیجیں
npx prisma db push

# یا
npm run db:push
```

#### مرحلہ 4: چلائیں

```bash
# ڈیولپمنٹ سرور
npm run dev

# یا
bun run dev
```

#### مرحلہ 5: براؤزر میں کھولیں

```
http://localhost:3000
```

---

### **آپشن 3: کلاؤڈ ہوسٹنگ سروسز**

| سروس | لنک | مفت پلان | آسان |
|-------|------|---------|-----|
| **Vercel** | vercel.com | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | netlify.com | ✅ | ⭐⭐⭐⭐ |
| **Render** | render.com | ✅ | ⭐⭐⭐⭐ |
| **Railway** | railway.app | ✅ | ⭐⭐⭐ |

---

## 🎯 کسٹمر کو کیسے دیں؟

### **طریقہ 1: آن لائن لنک (بہترین)**

```bash
# Vercel پر ڈپلائی کریں
vercel

# کسٹمر کو یہ لنک دیں:
https://pharmacy-system-xxx.vercel.app
```

**فائدے:**
- ✅ کوئی انسٹالیشن نہیں
- ✅ محفوظ (HTTPS)
- ✅ کسی بھی ڈیوائس پر چلے گا
- ✅ مکمل سسٹم رہے گا

---

### **طریقہ 2: ZIP فائل (براہ راست)**

#### اسکرپٹ بنا کر ZIP:

```bash
cd /home/z/my-project

# node_modules اور .next کو چھوڑ کر ZIP
zip -r pharmacy-system.zip . -x "node_modules/*" ".next/*" ".git/*" "*.log"
```

پھر اسے ڈاؤن لوڈ کریں اور کسٹمر کو دیں۔

**انسٹالیشن گائیڈ (کسٹمر کے لیے):**
```bash
1. pharmacy-system.zip ڈاؤن لوڈ کریں
2. ایکسٹریکٹ کریں
3. pharmacy-system فولڈر میں جائیں
4. چلائیں:
   npm install
   npm run db:push
   npm run dev
5. براؤزر میں: http://localhost:3000
```

---

## 🔧 عام مسائل

### **مسلہ: Port 3000 بند ہے**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### **مسلہ: ڈیٹا بیس ایرر**
```bash
npx prisma generate
npx prisma db push
```

---

## 📞 مدد چاہیے؟

اگر کوئی مسئلہ ہو، تو:
1. کنسول ایرر دیکھیں
2. یہ بٹھائیں: `npm run dev`
3. اور بتائیں کونسا ایرر آرہا ہے

---

## ✅ چیک لسٹ

- [ ] Node.js انسٹال
- [ ] پروجیکٹ ڈاؤن لوڈ
- [ ] `npm install`
- [ ] `npm run db:push`
- [ ] `npm run dev`
- [ ] براؤزر میں کھولیں
- [ ] 🔥 سسٹم چل رہا ہے!

---

**شکریہ! آپ کا فارمیسی سسٹم تیار ہے! 🎉**