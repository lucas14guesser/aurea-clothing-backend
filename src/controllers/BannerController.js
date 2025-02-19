const BannerService = require('../services/BannerService');
const path = require('path');
const { cloudinary } = require('../config/bannerMulterConfig');

module.exports = {
    inserirBanner: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_banner } = req.body;
        let img_banner = req.file ? req.file.path : null; // Captura a URL da imagem do Cloudinary

        if (img_banner && nome_banner) {
            try {
                await BannerService.inserirBanner(img_banner, nome_banner);
                json.result = 'Banner inserido com sucesso!';
            } catch (error) {
                json.error = 'Erro ao inserir o banner: ' + error.message;
            }
        } else {
            json.error = 'Imagem não enviada.';
        }
        res.json(json);
    },

    listarTodosBanners: async (req, res) => {
        let json = { error: '', result: [] };

        try {
            const banners = await BannerService.listarTodosBanners();
            json.result = banners.length > 0 ? banners : json.error = 'Erro ao listar os banners.';
        } catch (error) {
            json.error = 'Não existem banners. ' + error.message;
        }
        res.json(json);
    },

    listarBannerPorId: async (req, res) => {
        let json = { error: '', result: [] };
        let id_banner = req.params.id_banner;

        if (id_banner) {
            try {
                const banner = await BannerService.listarBannerPorId(id_banner);
                json.result = banner.length > 0 ? banner : json.error = 'Não existe banner com este ID.';
            } catch (error) {
                json.error = 'Erro ao listar banner por ID: ' + error.message;
            }
        } else {
            json.error = 'ID do banner não fornecido.';
        }
        res.json(json);
    },

    excluirBanner: async (req, res) => {
        let json = { error: '', result: {} };
        let id_banner = req.params.id_banner;

        if (id_banner) {
            try {
                const banner = await BannerService.listarBannerPorId(id_banner);

                if (banner && banner.length > 0) {
                    const bannerData = banner[0];

                    // Extrair o `public_id` da URL da imagem no Cloudinary
                    const publicId = bannerData.img_banner.split('/').pop().split('.')[0];

                    // Deletar a imagem do Cloudinary
                    const resultado = await cloudinary.uploader.destroy(`banners/${publicId}`);

                    if (resultado.result === 'ok') {
                        const excluido = await BannerService.excluirBanner(id_banner);
                        json.result = excluido ? 'Banner excluído com sucesso.' : 'Erro ao excluir banner no banco de dados.';
                    } else {
                        json.error = 'Erro ao excluir a imagem no Cloudinary: ' + JSON.stringify(resultado);
                    }
                } else {
                    json.error = 'Banner não encontrado.';
                }
            } catch (error) {
                console.error('Erro no controller:', error);
                json.error = 'Erro ao excluir banner';
            }
        } else {
            json.error = 'ID do banner não fornecido';
        }
        res.json(json);
    },
};
