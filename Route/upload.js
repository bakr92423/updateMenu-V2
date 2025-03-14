const express = require("express");
const router = express.Router();
const multer = require("multer");
const  {CloudinaryStorage}  = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "config.env" });

// ✅ التأكد من تحميل `Cloudinary`
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", 
  function(error, result) {
    if (error) {
      console.error("❌ خطأ في رفع الصورة إلى Cloudinary:", error);
    } else {
      console.log("✅ تم رفع الصورة بنجاح إلى Cloudinary:", result.secure_url);
    }
  }
);

console.log("✅ متصل بـ Cloudinary:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ موجود" : "❌ غير موجود");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ موجود" : "❌ غير موجود");


// ✅ إعداد `Multer` مع `Cloudinary`
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // 🔥 سيتم تخزين الصور في مجلد `uploads` على `Cloudinary`
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 🚀 تحديد الحد الأقصى لحجم الصورة إلى 2MB
});

// ✅ نقطة النهاية لرفع الصور
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "❌ يرجى اختيار صورة!" });
    }

    console.log("✅ الصورة تم رفعها إلى Cloudinary:", req.file);

    const imageUrl = req.file.path || req.file.secure_url;

    res.status(201).json({
      message: "🎉 تم رفع الصورة بنجاح!",
      imageUrl,
    });
  } catch (error) {
    console.error("❌ خطأ أثناء رفع الصورة:", error);

    res.status(500).json({ 
      message: "🚨 خطأ داخلي في السيرفر!",
      error: error.message || JSON.stringify(error, null, 2) 
    });
  }
});

module.exports = router;

