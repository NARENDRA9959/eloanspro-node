const asyncHandler = require("express-async-handler");
const path = require('path');

const uploadFiles = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    const fileLinks = [];
    for (const file of files) {
      const filePath = path.join(file.filename);
      fileLinks.push(filePath);
    }
    res.json({ links: fileLinks });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading files.' });
  }
});

module.exports = {
  uploadFiles
};
