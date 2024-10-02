const asyncHandler = require("express-async-handler");
const path = require("path");

const uploadFiles = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    const userId = req.user.id;
    const type = req.query.type;
    const domain = req.hostname;
    const port = process.env.PORT;
    let domainWithPort = port ? domain + ":" + port : domain;
    const fileLinks = [];
    for (const file of files) {
      const filePath = path.join(
        domainWithPort,
        "uploads",
        userId.toString(),
        type,
        file.filename
      );
      fileLinks.push(filePath);
    }
    res.json({ links: fileLinks });
  } catch (error) {
    res.status(500).json("Error uploading files");
  }
});

module.exports = {
  uploadFiles,
};
