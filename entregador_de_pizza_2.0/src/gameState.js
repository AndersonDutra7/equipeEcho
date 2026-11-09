import { CONFIG } from "./config.js";

export function criarEstadoInicial() {
    return {
        combustivel: CONFIG.COMBUSTIVEL_INICIAL,
        entregasRealizadas: 0,
        dinheiro: 0,
        combustivelGasto: 0,
        abastecimentos: 0,
        ativo: true,
        resultado: "em_andamento",
    };
}

/**
 * Reinicia a partida repondo o combustível inicial, zerando contadores de
 * entregas e estatísticas, e limpando o estado de encerramento.
 *
 * Garante que nenhuma estatística ou propriedade da partida anterior seja
 * preservada indevidamente.
 *
 * @param {Object} [estado] Objeto de estado da partida a reiniciar.
 * @returns {Object} Estado reiniciado com os valores iniciais corretos.
 */
export function reiniciarPartida(estado) {
    const estadoInicial = criarEstadoInicial();

    if (estado && typeof estado === "object") {
        for (const chave of Object.keys(estado)) {
            if (!(chave in estadoInicial)) {
                delete estado[chave];
            }
        }
        Object.assign(estado, estadoInicial);
        return estado;
    }

    return estadoInicial;
}
