const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurar o Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, // Substitua pelo seu Cloud Name
    api_key: process.env.CLOUD_API_KEY,       // Substitua pela sua API Key
    api_secret: process.env.CLOUD_API_SECRET,  // Substitua pelo seu API Secret
});

// Configuração do armazenamento do Multer com Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners', // Pasta onde as imagens serão armazenadas no Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Formatos permitidos
    },
});

// Criar o middleware de upload
const bannerUpload = multer({ storage: storage });

module.exports = bannerUpload, cloudinary;
