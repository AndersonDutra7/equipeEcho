import { CONFIG } from "./config.js";

// ---------------------------------------------------------------------------
// Estatísticas e resumo da partida
// ---------------------------------------------------------------------------

/**
 * Extrai e calcula os dados estatísticos da partida sem alterar o estado do jogo.
 *
 * @param {Object} estado Estado atual da partida.
 * @returns {Object} Objeto contendo as estatísticas calculadas.
 */
export function obterEstatisticas(estado = {}) {
    const seguro = estado || {};

    const entregasRealizadas = Number(seguro.entregasRealizadas) || 0;
    const totalEntregas = CONFIG.TOTAL_ENTREGAS;
    const combustivelGasto = Number(seguro.combustivelGasto) || 0;
    const abastecimentos = Number(seguro.abastecimentos) || 0;
    const combustivelRestante = seguro.combustivel !== undefined ? seguro.combustivel : CONFIG.COMBUSTIVEL_INICIAL;
    const resultado = seguro.resultado || "em_andamento";

    return {
        entregasRealizadas,
        totalEntregas,
        combustivelGasto,
        abastecimentos,
        combustivelRestante,
        resultado,
        vitoria: resultado === "vitoria",
        desistencia: resultado === "desistencia",
    };
}

export const calcularEstatisticas = obterEstatisticas;

/**
 * Formata o resumo final da partida para exibição.
 * Diferencia a mensagem final entre vitória e saída antecipada/desistência.
 *
 * @param {Object} estado Estado da partida ou objeto de estatísticas.
 * @returns {string} Texto formatado com o resumo final.
 */
export function formatarResumo(estado) {
    const stats = obterEstatisticas(estado);

    const linhas = [
        "========== RESUMO FINAL ==========",
        `Entregas: ${stats.entregasRealizadas}/${stats.totalEntregas}`,
        `Combustível gasto: ${stats.combustivelGasto}`,
        `Abastecimentos: ${stats.abastecimentos}`,
    ];

    if (stats.vitoria) {
        linhas.push("Parabéns! Concluíste todas as entregas!");
    } else {
        linhas.push("Partida terminada sem concluir o objetivo.");
    }

    return linhas.join("\n");
}

/**
 * Apresenta o resumo final da partida.
 * Permite a injeção de uma função de escrita para testes.
 *
 * @param {Object} estado Estado da partida.
 * @param {Function} escritor Função utilizada para exibir a saída (padrão: console.log).
 */
export function mostrarResumo(estado, escritor = console.log) {
    escritor(`\n${formatarResumo(estado)}`);
}
