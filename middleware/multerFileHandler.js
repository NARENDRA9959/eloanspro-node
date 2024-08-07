const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.id;
    const type = req.query.type;
    const userUploadsDir = path.join("uploads", userId.toString(), type);
    createDirectoryIfNotExists(userUploadsDir);
    cb(null, userUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueFilename}${fileExtension}`);
  },
});
const upload = multer({ storage: storage });
module.exports = upload;
