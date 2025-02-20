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

            if (!img_banner) {
                return res.status(400).json({ error: 'Imagem do banner não encontrada' });
            }

            // Extrai o public_id corretamente
            const urlParts = img_banner.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1]; // Último segmento da URL
            const publicId = publicIdWithExtension.split('.')[0]; // Remove a extensão

            // Exclui a imagem do Cloudinary
            const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);

            if (cloudinaryResponse.result !== "ok") {
                return res.status(500).json({ error: 'Erro ao excluir imagem do Cloudinary' });
            }

            // Remove o banner do banco de dados
            const deleted = await BannerService.excluirBanner(id_banner);

            if (!deleted) {
                return res.status(500).json({ error: 'Erro ao excluir banner do banco de dados' });
            }

            res.json({ result: 'Banner excluído com sucesso' });

        } catch (error) {
            console.error("Erro ao excluir banner:", error);
            res.status(500).json({ error: 'Erro ao excluir banner' });
        }
    },
}