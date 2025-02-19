const BannerService = require('../services/BannerService');
const cloudinary = require('../config/bannerMulterConfig').cloudinary;

module.exports = {
    inserirBanner: async (req, res) => {
        let json = { error: '', result: {} };
    
        let { nome_banner } = req.body;
        let img_banner = req.file ? req.file.path : null; // Isso já terá a URL do Cloudinary
    
        if (req.file && req.file.path) {
            try {
                // O resultado já vem do multer-storage-cloudinary, então apenas atualize o `img_banner`
                img_banner = req.file.path; // Agora isso contém a URL do Cloudinary
                const public_id = req.file.filename; // O public_id é o nome do arquivo gerado
    
                await BannerService.inserirBanner(img_banner, nome_banner, public_id);
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
                    const { img_banner, public_id } = banner[0];

                    if (!public_id) {
                        json.error = 'Public ID não encontrado. Impossível excluir no Cloudinary.';
                        return res.json(json);
                    }

                    const resultado = await cloudinary.uploader.destroy(public_id);
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
