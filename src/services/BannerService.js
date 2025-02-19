const db = require('../db');

module.exports = {
    inserirBanner: async (img_banner, nome_banner, public_id) => {
        try {
            const [results] = await db.query('INSERT INTO banners (img_banner, nome_banner, public_id) VALUES (?, ?, ?)', [img_banner, nome_banner, public_id]);
            return results.insertId;
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