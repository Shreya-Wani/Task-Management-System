import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "application/pdf", 
        "text/plain"
    ];

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and TXT files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter
});

export default upload;