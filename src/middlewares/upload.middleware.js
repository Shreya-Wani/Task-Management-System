import multer from "multer";

//Storage config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

//file filter ( PDF + text only)
const fileFilter = (req, file, cb) => {

    const allowedTypes = ["application/pdf", "text/plain"];

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