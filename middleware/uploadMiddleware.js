import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary-config.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    console.log("Saving file to:", tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    console.log("Generated file name:", sanitizedName);
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
