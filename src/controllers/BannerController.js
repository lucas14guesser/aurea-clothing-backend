const BannerService = require('../services/BannerService');
const cloudinary = require('../config/bannerMulterConfig').cloudinary;

module.exports = {
    inserirBanner: async (req, res) => {
        let json = { error: '', result: {} };

        let { nome_banner } = req.body;
        let img_banner = req.file ? req.file.path : null; // Antes pegava o caminho local

        if (req.file && req.file.path) {
            try {
                // Pega a URL da imagem salva no Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, { folder: 'banners' });
                img_banner = result.secure_url; // Pega a URL segura da imagem

                // Salva no banco de dados
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

                    // Obtém o `public_id` da URL do Cloudinary
                    const publicId = bannerData.img_banner.split('/').pop().split('.')[0];

                    // Exclui do Cloudinary
                    const resultado = await cloudinary.uploader.destroy(`banners/${publicId}`);

                    if (resultado.result === 'ok') {
                        await BannerService.excluirBanner(id_banner);
                        json.result = 'Banner excluído com sucesso.';
                    } else {
                        json.error = 'Erro ao excluir a imagem no Cloudinary.';
                    }
                } else {
                    json.error = 'Banner não encontrado.';
                }
            } catch (error) {
                json.error = 'Erro ao excluir banner: ' + error.message;
            }
        } else {
            json.error = 'ID do banner não fornecido';
        }
        res.json(json);
    }
};
