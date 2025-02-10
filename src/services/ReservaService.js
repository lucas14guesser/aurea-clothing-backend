const db = require('../db');

module.exports = {
    buscarReservaPorUsuario: async (id_user, id_produto) => {
        try {
            const [results] = await db.query('SELECT qtd_reserva FROM reservas WHERE id_user = ? AND id_produto = ?', [id_user, id_produto]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    },

    atualizarReserva: async (id_user, id_produto, novaQuantidade) => {
        try {
            // Atualiza a quantidade de reserva para o produto e usuário específicos
            const [result] = await db.query(
                'UPDATE reservas SET qtd_reserva = ? WHERE id_user = ? AND id_produto = ?',
                [novaQuantidade, id_user, id_produto]
            );

            // Verifica se a atualização foi bem-sucedida
            if (result.affectedRows === 0) {
                throw new Error('Nenhuma reserva encontrada para atualizar.');
            }

            return result;
        } catch (error) {
            throw error;
        }
    },

    excluirReserva: async (id_user, id_produto) => {
        try {
            await db.query('DELETE FROM reservas WHERE id_user = ? AND id_produto = ?', [id_user, id_produto]);
        } catch (error) {
            throw error;
        }
    },

    buscarReservasExpiradas: async () => {
        const [reservas] = await db.query(`
            SELECT id_produto, qtd_reserva 
            FROM reservas 
            WHERE validade_reserva < NOW()
        `);
        return reservas;
    },

    restaurarEstoque: async (id_produto, qtd_reserva) => {
        await db.query(`
            UPDATE produtos 
            SET qtd_produto = qtd_produto + ? 
            WHERE id_produto = ?
        `, [qtd_reserva, id_produto]);
    },

    removerReservasExpiradas: async () => {
        await db.query(`
            DELETE FROM reservas 
            WHERE validade_reserva < NOW()
        `);
    },

}