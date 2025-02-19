const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurar o Cloudinary com as credenciais do ambiente
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Configuração do armazenamento do Multer com Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners', // Pasta onde as imagens serão armazenadas no Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
        format: 'jpg', // Define um formato padrão
        public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Nome único para cada imagem
    },
});

const bannerUpload = multer({ storage: storage });

module.exports = { bannerUpload, cloudinary };
