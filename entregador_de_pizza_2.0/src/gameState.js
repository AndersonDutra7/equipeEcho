import { CONFIG } from "./config.js";

export function criarEstadoInicial() {
    return {
        combustivel: CONFIG.COMBUSTIVEL_INICIAL,
        entregasRealizadas: 0,
        combustivelGasto: 0,
        abastecimentos: 0,
        ativo: true,
        resultado: "em_andamento",
    };
}