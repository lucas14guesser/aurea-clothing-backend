const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurar o Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Configuração do armazenamento do Multer para banners no Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners', // Pasta no Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Formatos permitidos
        format: async () => 'jpg', // Salva sempre como JPG
        public_id: (req, file) => `banner-${Date.now()}-${file.originalname}`, // Gera um nome único
    },
});

// Middleware de upload
const bannerUpload = multer({ storage });

module.exports = bannerUpload, cloudinary;
