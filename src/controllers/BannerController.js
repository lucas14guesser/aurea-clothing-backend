const BannerService = require('../services/BannerService');
const fs = require('fs');
const path = require('path');

module.exports = {
    inserirBanner: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_banner } = req.body;
        let img_banner = req.file ? req.file.filename : null;

        if (img_banner && nome_banner) {
            try {
                await BannerService.inserirBanner(img_banner, nome_banner);
                json.result = 'Banner inserido com sucesso!.';
            } catch (error) {
                json.error = 'Erro ao inserir o banner.';
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
        let json = { error: '', result: {} };

        let id_banner = req.params.id_banner;

        if (id_banner) {
            try {
                const banner = await BannerService.listarBannerPorId(id_banner);

                if (banner && banner.length > 0) {
                    const bannerData = banner[0];

                    if (bannerData.img_banner) {
                        const imagePath = path.join(__dirname, '../..', 'bannerUpload', bannerData.img_banner);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                    } else {
                        json.error = 'banner não possui imagem associada.';
                    }

                    const excluido = await BannerService.excluirBanner(id_banner);

                    if (excluido) {
                        json.result = 'banner excluído.';
                    } else {
                        json.error = 'Erro ao excluir banner no banco de dados.';
                    }
                } else {
                    json.error = 'banner não encontrado.';
                }
            } catch (error) {
                console.error('Erro no controller:', error);
                json.error = 'Erro ao excluir banner';
            }
        } else {
            json.error = 'ID do banner não fornecido';
        }
        res.json(json);
    }
}