const db = require('../db');

module.exports = {
    inserirBanner: async (img_banner, nome_banner, public_id) => {
        try {
            const [results] = await db.query('INSERT INTO banners (img_banner, nome_banner, public_id) VALUES (?, ?, ?)', [img_banner, nome_banner, public_id]);
            return {
                id_banner: results.insertId, // Retorna o ID inserido
                img_banner: img_banner, // Retorna a URL da imagem
                nome_banner: nome_banner, // Retorna o nome do banner
                public_id: public_id // Retorna o public_id
            };
        } catch (error) {
            throw error;
        }
    },

    listarTodosBanners: async () => {
        try {
            const [results] = await db.query('SELECT * FROM banners');
            return results;
        } catch (error) {
            throw error;
        }
    },

    listarBannerPorId: async (id_banner) => {
        try {
            const [results] = await db.query('SELECT * FROM banners WHERE id_banner = ?', [id_banner]);
            return results;
        } catch (error) {
            throw error;
        }
    },

    excluirBanner: async (id_banner) => {
        try {
            const [results] = await db.query('DELETE FROM banners WHERE id_banner = ?', [id_banner]);
            if (results.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    }
}