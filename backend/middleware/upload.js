const multer = require("multer");

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit (matches frontend)
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and Word documents are allowed."), false);
        }
    },
});

module.exports = upload;
