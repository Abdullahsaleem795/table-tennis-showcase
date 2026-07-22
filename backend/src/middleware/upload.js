const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Make sure the uploads folder exists
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("WARNING: Could not create uploads directory (expected on Vercel).");
}

// Storage configuration
const storage = process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif|mp4|mov|avi|webm/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png, webp, gif) and videos (mp4, mov, avi, webm) are allowed!'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size (useful for videos)
  }
});

module.exports = upload;
