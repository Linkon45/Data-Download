const express = require("express");
const multer = require("multer");
const admzip = require("adm-zip");

const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const maxSize = 10 * 1024 * 1024;
const compressFileUpload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/compress", compressFileUpload.array("file", 100), (req, res) => {
  const zip = new admzip();

  if (req.files) {
    req.files.forEach((file) => {
      zip.addLocalFile(file.path);
    });
  }

  const output = Date.now() + "output.zip";
  fs.writeFileSync(output, zip.toBuffer());
  res.download(output);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
