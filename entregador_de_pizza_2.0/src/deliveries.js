import { CONFIG } from "./config.js";

/**
 * Sorteia aleatoriamente o custo de combustível de uma entrega.
 * Devolve um dos valores definidos em CONFIG.GASTOS_POR_ENTREGA.
 */
export function sortearGasto() {
    const gastos = CONFIG.GASTOS_POR_ENTREGA;
    const indice = Math.floor(Math.random() * gastos.length);
    return gastos[indice];
}

/**
 * Tenta realizar uma entrega de pizza.
 *
 * Regras:
 * - A partida deve estar ativa.
 * - O objetivo não pode ter sido atingido.
 * - Deve haver combustível suficiente para o gasto sorteado.
 *
 * Devolve { sucesso, mensagem, gasto? }.
 * Nota: esta função NÃO verifica a condição de vitória — essa
 * responsabilidade é do módulo game.js (coordenador do fluxo).
 */
export function entregarPizza(estado) {
    if (!estado.ativo) {
        return { sucesso: false, mensagem: "A partida terminou." };
    }

    if (estado.entregasRealizadas >= CONFIG.TOTAL_ENTREGAS) {
        return { sucesso: false, mensagem: "Todas as entregas foram concluídas." };
    }

    const gasto = sortearGasto();

    if (estado.combustivel < gasto) {
        return {
            sucesso: false,
            mensagem: "Combustível insuficiente.",
            gasto,
        };
    }

    estado.combustivel -= gasto;
    estado.combustivelGasto += gasto;
    estado.entregasRealizadas++;

    return {
        sucesso: true,
        mensagem: "Pizza entregue com sucesso!",
        gasto,
    };
}
