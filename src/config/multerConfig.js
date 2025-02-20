const multer = require('multer');

const storage = multer.memoryStorage();
const prdUpload = multer({ storage });

module.exports = prdUpload;