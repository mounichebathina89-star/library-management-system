import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirCandidates = [
  path.resolve(process.cwd(), 'uploads'),
  path.resolve(process.cwd(), 'server', 'uploads'),
  '/tmp/uploads',
];

const uploadDir = uploadDirCandidates.find((candidate) => {
  try {
    fs.mkdirSync(candidate, { recursive: true });
    return true;
  } catch {
    return false;
  }
}) || '/tmp/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.epub', '.txt', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, EPUB, TXT, and Image files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter,
});

export default upload;
