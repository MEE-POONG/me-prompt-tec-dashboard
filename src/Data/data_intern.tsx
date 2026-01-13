// data/profiles.ts

// 🚨 1. (สำคัญ) Interface ต้องใช้ string สำหรับ imageSrc
export interface Dataintern {
    id: number;
    name: string;
    title: string;
    bio: string;
    imageSrc: string;
    instagram?: string;
    github?: string;
    portfolio?: string; // ⬅️ (แก้ไข) เปลี่ยนจาก linkedin
}

// 2. 🚨 (สำคัญ) เพิ่มข้อมูล social links ให้กับ Array
export const Intern: Dataintern[] = [
    {
        id: 1,
        name: "ธนภัทร โพธิ์ศรี",
        title: "นักศึกษาฝึกงาน (Intern)",
        bio: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน สาขาระบบสารสนเทศ",
        imageSrc: "/img/pat2.jpg", // ⬅️ ใช้ Path String
        instagram: "https://www.instagram.com/tanaaa_pattt/", // ⬅️ เพิ่ม Link
        github: "https://github.com/Ggg-tanapatt",
        portfolio: "https://wondrous-tulumba-da430d.netlify.app/",
    },
    {
        id: 2,
        name: "สุพรรษา ดีดวงแก้ว",
        title: "นักศึกษาฝึกงาน (Intern)",
        bio: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน สาขาระบบสารสนเทศ",
        imageSrc: "/img/pic1.jpg",
        instagram: "https://www.instagram.com/nx_sxpan?igsh=MWo0cDBuZGV1cTIwaA%3D%3D&utm_source=qr",
        github: "https://github.com/Supansa09",
        portfolio: " https://cute-daffodil-356357.netlify.app/",

    },
    {
        id: 3,
        name: "ศิวกร พล่ำแก้ว",
        title: "นักศึกษาฝึกงาน (Intern)",
        bio: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน สาขาวิทยาการคอมพิวเตอร์",
        imageSrc: "/img/pic2.jpg",
        instagram: "https://instagram.com",
        github: "https://github.com",
        portfolio: "https://superb-cat-e3792e.netlify.app/",
    },
    {
        id: 4,
        name: "ธาวิน กาฬสินธุ์",
        title: "นักศึกษาฝึกงาน (Intern)",
        bio: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน สาขาเทคโนโลยีมัลติมีเดีย",
        imageSrc: "/img/pic3.jpg", // (รูปเปล่า)
        instagram: "https://instagram.com",
        github: "https://github.com",
        portfolio: "https://curious-blancmange-c833fb.netlify.app/",
    },
];
