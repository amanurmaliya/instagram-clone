// This is used to save the photos to the cloudinary and many other applications
import multer from "multer";

// This is used to upload the documents
const upload = multer({
  storage: multer.memoryStorage(),
});

export default upload;
