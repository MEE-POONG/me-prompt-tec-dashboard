# Cloudflare Images Integration - คู่มือการติดตั้งและใช้งาน

## 📋 สิ่งที่เปลี่ยนแปลง

เปลี่ยนจากการเก็บรูปภาพเป็น base64 ในฐานข้อมูลโดยตรง มาเป็นการอัพโหลดรูปภาพไปยัง **Cloudflare Images** และเก็บเฉพาะ URL และ metadata ในฐานข้อมูล

### ✨ ข้อดี
- ลดขนาดฐานข้อมูล (MongoDB)
- เร็วกว่าในการโหลดรูปภาพ
- Cloudflare Images มี CDN และ automatic optimization
- รองรับ variants (thumbnail, medium, large) อัตโนมัติ
- จัดการรูปภาพได้ง่ายขึ้น

---

## 🔧 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install formidable @types/formidable
```

### 2. ตั้งค่า Cloudflare Account

1. ไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com)
2. เลือก **Images** จากเมนูด้านซ้าย
3. เปิดใช้งาน Cloudflare Images (อาจต้องใส่ข้อมูลบัตรเครดิต)
4. คัดลอก **Account ID** และสร้าง **API Token**

#### สร้าง API Token:
- ไปที่ **My Profile** > **API Tokens**
- คลิก **Create Token**
- เลือก Template: **Cloudflare Images Read and Write**
- คัดลอก Token ที่ได้

### 3. ตั้งค่า Environment Variables

เพิ่มค่าต่อไปนี้ใน `.env`:

```bash
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 📁 ไฟล์ที่เพิ่มเข้ามา

### 1. **Prisma Schema** - `prisma/schema.prisma`
เพิ่ม Model ใหม่: `CloudflareImage`

```prisma
model CloudflareImage {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  cloudflareId     String   @unique
  filename         String
  publicUrl        String
  variants         String[]
  relatedType      String?
  relatedId        String?  @db.ObjectId
  fieldName        String?
  tags             String[]
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### 2. **API Routes**

#### `/api/cloudflare-image/upload.ts`
- อัพโหลดรูปภาพไปยัง Cloudflare Images
- บันทึกข้อมูลลง Database

#### `/api/cloudflare-image/index.ts`
- GET: ดึงรายการรูปภาพทั้งหมด (รองรับ pagination, filtering)

#### `/api/cloudflare-image/[id].ts`
- GET: ดึงข้อมูลรูปภาพตาม ID
- DELETE: ลบรูปภาพ (ทั้งจาก Cloudflare และ Database)

### 3. **Helper Functions** - `src/lib/cloudflareImage.ts`
```typescript
uploadImage(options: UploadImageOptions)
deleteImage(imageId: string)
getImage(imageId: string)
getImages(options: GetImagesOptions)
fileToBase64(file: File)
```

### 4. **Custom Hook** - `src/hooks/useImageUpload.ts`
```typescript
const { upload, remove, uploading, progress, error } = useImageUpload({
  relatedType: "project",
  relatedId: projectId,
  fieldName: "cover",
  onSuccess: (imageData) => { ... }
});
```

### 5. **UI Component** - `src/components/ImageUpload.tsx`
Component สำหรับอัพโหลดรูปภาพแบบ Drag & Drop พร้อม Preview

---

## 🎯 วิธีใช้งาน

### ตัวอย่าง: ใช้ใน Form

```tsx
import ImageUpload from "@/components/ImageUpload";
import { CloudflareImageData } from "@/lib/cloudflareImage";

function MyForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState<CloudflareImageData | null>(null);

  return (
    <ImageUpload
      value={imageUrl}
      onChange={(url, data) => {
        setImageUrl(url);
        if (data) setImageData(data);
      }}
      relatedType="project"
      relatedId={projectId}
      fieldName="cover"
      label="รูปภาพปก"
      maxSize={10}
    />
  );
}
```

### ตัวอย่าง: ใช้ Hook โดยตรง

```tsx
import { useImageUpload } from "@/hooks/useImageUpload";

function MyComponent() {
  const { upload, uploading, progress, error, uploadedImage } = useImageUpload({
    relatedType: "project",
    relatedId: projectId,
    fieldName: "cover",
    onSuccess: (imageData) => {
      console.log("Upload success!", imageData.publicUrl);
    },
  });

  const handleFileSelect = async (file: File) => {
    await upload(file);
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileSelect(e.target.files[0])} />
      {uploading && <p>กำลังอัพโหลด... {progress}%</p>}
      {error && <p>Error: {error.message}</p>}
      {uploadedImage && <img src={uploadedImage.publicUrl} alt="Uploaded" />}
    </div>
  );
}
```

---

## 🔍 API Endpoints

### 1. Upload Image
```
POST /api/cloudflare-image/upload
Content-Type: multipart/form-data

Body:
- file: File
- relatedType: string (optional)
- relatedId: string (optional)
- fieldName: string (optional)
- tags: string[] (optional, as JSON string)
```

### 2. Get Images
```
GET /api/cloudflare-image?page=1&limit=20&relatedType=project&relatedId=xxx
```

### 3. Get Image by ID
```
GET /api/cloudflare-image/{imageId}
```

### 4. Delete Image
```
DELETE /api/cloudflare-image/{imageId}
```

---

## 📊 Database Schema

```javascript
{
  _id: ObjectId,
  cloudflareId: "abc123",
  filename: "my-image.jpg",
  publicUrl: "https://imagedelivery.net/...",
  variants: [
    "https://imagedelivery.net/.../public",
    "https://imagedelivery.net/.../thumbnail",
    "https://imagedelivery.net/.../medium"
  ],
  relatedType: "project",
  relatedId: "project_id_here",
  fieldName: "cover",
  tags: ["project", "cover"],
  size: 1024000,
  format: "jpeg",
  isActive: true,
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

---

## 🧪 การทดสอบ

### ทดสอบ Upload API ด้วย curl:

```bash
curl -X POST http://localhost:3000/api/cloudflare-image/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg" \
  -F "relatedType=project" \
  -F "relatedId=abc123" \
  -F "fieldName=cover"
```

---

## 🚨 Troubleshooting

### 1. Error: "Cloudflare credentials not configured"
- ตรวจสอบว่าตั้งค่า `CLOUDFLARE_ACCOUNT_ID` และ `CLOUDFLARE_API_TOKEN` ใน `.env` แล้ว
- Restart development server

### 2. Error: "Failed to upload to Cloudflare"
- ตรวจสอบ API Token ว่ามี permissions ที่ถูกต้อง
- ตรวจสอบว่าเปิดใช้งาน Cloudflare Images แล้ว
- ตรวจสอบ Account ID ว่าถูกต้อง

### 3. รูปภาพไม่แสดง
- ตรวจสอบ URL ที่ได้รับจาก Cloudflare
- ตรวจสอบว่า Cloudflare Images ไม่ได้ตั้งค่าเป็น "Signed URLs only"

### 4. ขนาดไฟล์ใหญ่เกินไป
- ปรับค่า `maxSize` ใน `ImageUpload` component
- Cloudflare Images รองรับไฟล์สูงสุด 10MB (Free plan)

---

## 💰 ราคา Cloudflare Images

- **$5/month** สำหรับ 100,000 images stored
- **$1** per 100,000 images served
- ราคาอาจเปลี่ยนแปลง ตรวจสอบที่: https://www.cloudflare.com/products/cloudflare-images/

---

## 🔄 Migration: ย้ายรูปภาพเดิมจาก base64 ไปยัง Cloudflare Images

หากคุณมีรูปภาพเดิมที่เก็บเป็น base64 ในฐานข้อมูลอยู่แล้ว คุณสามารถ migrate ไปยัง Cloudflare Images ได้โดยใช้ script ที่เตรียมไว้ให้:

### วิธีใช้ Migration Script:

1. **ติดตั้ง tsx** (ถ้ายังไม่มี):
```bash
npm install -D tsx
```

2. **เพิ่ม script ใน package.json**:
```json
{
  "scripts": {
    "migrate:images": "tsx scripts/migrate-images-to-cloudflare.ts"
  }
}
```

3. **รัน Migration**:
```bash
npm run migrate:images
```

Script จะทำการ:
- ✅ ค้นหา Projects ทั้งหมดที่มี `cover` เป็น base64
- ✅ อัพโหลดรูปภาพไปยัง Cloudflare Images
- ✅ บันทึกข้อมูลลง `CloudflareImage` model
- ✅ อัพเดท `cover` field ให้เป็น Cloudflare URL
- ✅ แสดงผลลัพธ์การ migrate

### Output ตัวอย่าง:
```
🚀 เริ่มต้น Migrate รูปภาพ Projects...

📊 พบ 5 projects ที่ต้อง migrate

📦 กำลัง migrate: My Awesome Project (ID: 123abc)
   ✅ สำเร็จ: https://imagedelivery.net/xxx/yyy/public

📦 กำลัง migrate: Another Project (ID: 456def)
   ✅ สำเร็จ: https://imagedelivery.net/xxx/zzz/public

🎉 เสร็จสิ้นการ Migrate!
✅ สำเร็จ: 5 projects
❌ ล้มเหลว: 0 projects
```

### ⚠️ คำเตือน:
- **สำรองข้อมูลก่อน** migration เพื่อความปลอดภัย
- Migration script จะ**ไม่ลบ** base64 เดิมออกจากฐานข้อมูลทันที
- ถ้า migration ล้มเหลว รูปภาพเดิม (base64) จะยังใช้งานได้ปกติ
- แนะนำให้ทดสอบกับข้อมูลจำนวนน้อยก่อน

---

## 📝 หมายเหตุ

- รูปภาพเดิมที่เป็น base64 จะยังคงทำงานได้ปกติ
- ระบบสามารถรองรับทั้ง base64 และ Cloudflare URLs ได้พร้อมกัน
- ใช้ Migration script เพื่อย้ายรูปภาพเดิมไปยัง Cloudflare Images
- รูปภาพใหม่ทั้งหมดจะถูกอัพโหลดไปยัง Cloudflare โดยอัตโนมัติ

---

## 🎓 เอกสารเพิ่มเติม

- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Cloudflare Images API](https://developers.cloudflare.com/api/operations/cloudflare-images-upload-an-image-via-url)
- [Migration Script](scripts/migrate-images-to-cloudflare.ts)
