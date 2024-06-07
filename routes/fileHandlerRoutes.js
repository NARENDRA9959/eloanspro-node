const express = require("express");
const { uploadFiles } = require("../controllers/fileHandlerController");
const validateToken = require("../middleware/validateTokenHandler");
const upload = require("../middleware/multerFileHandler");
const router = express.Router();

router.route("/upload").post(validateToken, upload.array("files"), uploadFiles);

module.exports = router;
