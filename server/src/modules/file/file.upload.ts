import multer from "multer";
import { MAX_FILE_BYTES } from "../../shared/constants/index.js";

export const receiveUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
}).single("file");
