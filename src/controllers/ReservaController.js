const ReservaService = require("../services/ReservaService");

module.exports = {
    removerReservasExpiradas: async (req, res) => {
        try {
            // Busca as reservas que já expiraram
            const reservasExpiradas = await ReservaService.buscarReservasExpiradas();

            if (reservasExpiradas.length === 0) {
                return;
            }

            // Restaura o estoque dos produtos reservados
            for (const reserva of reservasExpiradas) {
                await ReservaService.restaurarEstoque(reserva.id_produto, reserva.qtd_reserva);
            }

            // Remove as reservas expiradas do banco de dados
            await ReservaService.removerReservasExpiradas();

        } catch (error) {
            console.error("❌ Erro ao remover reservas expiradas:", error);
        }
    }
}
