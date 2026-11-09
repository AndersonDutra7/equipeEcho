import { CONFIG } from "./config.js";

/**
 * Abastece a moto cobrando apenas pelas unidades efetivamente recebidas.
 * Operações inválidas não modificam nenhum dado do estado.
 */
export function abastecerMoto(estado) {
    const falha = (mensagem) => ({
        sucesso: false,
        mensagem,
        recuperado: 0,
        custo: 0,
        saldo: Number.isFinite(estado?.dinheiro) ? estado.dinheiro : 0,
    });

    if (!estado || typeof estado !== "object") {
        return falha("Estado da partida inválido.");
    }

    if (!estado.ativo) {
        return falha("A partida terminou.");
    }

    const combustivelAtual = estado.combustivel;
    const saldoAtual = estado.dinheiro;

    if (!Number.isFinite(combustivelAtual) ||
        combustivelAtual < 0 ||
        combustivelAtual > CONFIG.COMBUSTIVEL_MAXIMO) {
        return falha("Nível de combustível inválido. O abastecimento não foi realizado.");
    }

    if (!Number.isFinite(saldoAtual) || saldoAtual < 0) {
        return falha("Saldo inválido. O abastecimento não foi realizado.");
    }

    const novoCombustivel = Math.min(
        combustivelAtual + CONFIG.COMBUSTIVEL_POR_ABASTECIMENTO,
        CONFIG.COMBUSTIVEL_MAXIMO
    );
    const recuperado = novoCombustivel - combustivelAtual;

    if (recuperado === 0) {
        return falha("O depósito já está cheio.");
    }

    const custo = recuperado * CONFIG.PRECO_COMBUSTIVEL_POR_UNIDADE;

    if (saldoAtual < custo) {
        return {
            ...falha("Saldo insuficiente para abastecer. Conclua entregas para ganhar dinheiro."),
            custoNecessario: custo,
        };
    }

    // Atualiza o estado somente depois de todas as validações.
    estado.combustivel = novoCombustivel;
    estado.dinheiro = Number((saldoAtual - custo).toFixed(2));
    estado.abastecimentos = (Number.isInteger(estado.abastecimentos) && estado.abastecimentos >= 0)
        ? estado.abastecimentos + 1
        : 1;

    return {
        sucesso: true,
        mensagem: "Moto abastecida com sucesso!",
        recuperado,
        custo,
        saldo: estado.dinheiro,
    };
}
