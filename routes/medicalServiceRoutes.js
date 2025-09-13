import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import {
  createMedicalService,
  getAllMedicalServices,
  updateMedicalService,
  deleteMedicalService,
} from '../controllers/medicalServiceController.js';

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medical_reports',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

router.post('/create', upload.single('report'), createMedicalService);
router.get('/getAll', getAllMedicalServices);
router.put('/update/:id', upload.single('report'), updateMedicalService);
router.delete('/delete/:id', deleteMedicalService);

export default router;
