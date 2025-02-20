const BannerService = require('../services/BannerService');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'banners' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

module.exports = {
    inserirBanner: async (req, res) => {
        let json = { error: '', result: {} };

        try {
            const { nome_banner } = req.body;
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem enviada' });
            }

            // Faz o upload da imagem para o Cloudinary
            const uploadResult = await uploadToCloudinary(req.file.buffer);

            // Salvar no banco de dados
            await BannerService.inserirBanner(uploadResult.secure_url, nome_banner, uploadResult.public_id);

            json.result = { id: uploadResult.public_id, nome_banner, imageUrl: uploadResult.secure_url };
            res.json(json);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno no servidor' });
        }
    },

    listarTodosBanners: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            const banners = await BannerService.listarTodosBanners();

            if (banners.length > 0) {
                json.result = banners;
            } else {
                json.error = 'Erro ao listar os banners.';
            }
        } catch (error) {
            json.error = 'Não existem banners.' + error.message;
        }
        res.json(json);
    },

    listarBannerPorId: async (req, res) => {
        let json = { error: '', result: [] };

        let id_banner = req.params.id_banner;

        if (id_banner) {
            try {
                const banner = await BannerService.listarBannerPorId(id_banner);
                if (banner.length > 0) {
                    json.result = banner;
                } else {
                    json.error = 'Não existe banner com este ID.';
                }
            } catch (error) {
                json.error = 'Erro ao listar banner por ID.' + error.message;
            }
        } else {
            json.error = 'Não existe banner com este ID.';
        }
        res.json(json);
    },

    excluirBanner: async (req, res) => {
        try {
            const { id_banner } = req.params;
            const banner = await BannerService.listarBannerPorId(id_banner);

            if (!banner || banner.length === 0) {
                return res.status(404).json({ error: 'Banner não encontrado' });
            }

            const { img_banner } = banner[0];

            // Extrai corretamente o `public_id` da URL do Cloudinary
            const urlParts = img_banner.split('/');
            const publicIdWithExtension = urlParts.slice(-2).join('/'); // Ex: "banners/nuaykjmc1y4uvxnzqdfo.jpg"
            const publicId = publicIdWithExtension.split('.')[0]; // Ex: "banners/nuaykjmc1y4uvxnzqdfo"

            if (!publicId) {
                return res.status(500).json({ error: 'Public ID inválido' });
            }

            // Exclui a imagem do Cloudinary
            await cloudinary.uploader.destroy(publicId);

            // Remove do banco de dados
            await BannerService.excluirBanner(id_banner);
            res.json({ result: 'Banner excluído com sucesso' });

        } catch (error) {
            console.error('Erro ao excluir banner:', error);
            res.status(500).json({ error: 'Erro ao excluir imagem do Cloudinary' });
        }
    },
}