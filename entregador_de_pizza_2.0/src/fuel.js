import { CONFIG } from "./config.js";

export function abastecerMoto(estado) {
    if (!estado.ativo) {
        return {
            sucesso: false,
            mensagem: "A partida terminou.",
            recuperado: 0,
        };
    }

    estado.combustivel = Math.min(
    Math.max(estado.combustivel, 0),
    CONFIG.COMBUSTIVEL_MAXIMO
    );

    const combustivelAtual = estado.combustivel;

    const novoCombustivel = Math.min(
        combustivelAtual + CONFIG.COMBUSTIVEL_POR_ABASTECIMENTO,
        CONFIG.COMBUSTIVEL_MAXIMO
    );

    const recuperado = novoCombustivel - combustivelAtual;

    if (recuperado === 0) {
        return {
            sucesso: false,
            mensagem: "O depósito já está cheio.",
            recuperado: 0,
        };
    }

    estado.combustivel = novoCombustivel;
    estado.abastecimentos++;

    return {
        sucesso: true,
        mensagem: "Moto abastecida!",
        recuperado,
    };
}