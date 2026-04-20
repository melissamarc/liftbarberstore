const fs = require("fs");
const path = require("path");

function ensureUploadDirs() {
  const dirs = [
    path.resolve(__dirname, "../../uploads"),
    path.resolve(__dirname, "../../uploads/perfis"),
    path.resolve(__dirname, "../../uploads/produtos"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

module.exports = ensureUploadDirs;