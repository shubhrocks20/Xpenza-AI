import multer from 'multer'
import path from 'path';
const storage = multer.memoryStorage()
const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || `.${file.mimetype.split("/")[1]}`;
        const filename = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, filename);
    },
});
const upload = multer({storage})
export const uploadLocal = multer({storage: storage2})
export default upload;
