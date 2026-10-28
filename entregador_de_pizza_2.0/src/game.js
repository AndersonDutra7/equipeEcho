import { CONFIG } from "./config.js";

export function sortearGasto() {
    const intervalo =
        CONFIG.GASTO_MAXIMO - CONFIG.GASTO_MINIMO + 1;

    return (
        Math.floor(Math.random() * intervalo) +
        CONFIG.GASTO_MINIMO
    );
}

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

    if (estado.entregasRealizadas === CONFIG.TOTAL_ENTREGAS) {
        estado.ativo = false;
        estado.resultado = "vitoria";
    }

    return {
        sucesso: true,
        mensagem: "Pizza entregue com sucesso!",
        gasto,
    };
}

export function abastecerMoto(estado) {
    if (!estado.ativo) {
        return { sucesso: false, mensagem: "A partida terminou." };
    }

    const anterior = estado.combustivel;

    estado.combustivel = Math.min(
        anterior + CONFIG.COMBUSTIVEL_POR_ABASTECIMENTO,
        CONFIG.COMBUSTIVEL_MAXIMO
    );

    const recuperado = estado.combustivel - anterior;

    if (recuperado === 0) {
        return {
            sucesso: false,
            mensagem: "O depósito já está cheio.",
            recuperado: 0,
        };
    }

    estado.abastecimentos++;

    return {
        sucesso: true,
        mensagem: "Moto abastecida!",
        recuperado,
    };
}

export function encerrarPartida(estado) {
    estado.ativo = false;

    if (estado.resultado === "em_andamento") {
        estado.resultado = "desistencia";
    }
}