import { CONFIG } from "./config.js";

export function sortearGasto() {
    const gastos = CONFIG.GASTOS_POR_ENTREGA;

    const indice = Math.floor(Math.random() * gastos.length);

    return gastos[indice];
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

export function encerrarPartida(estado) {
    estado.ativo = false;

    if (estado.resultado === "em_andamento") {
        estado.resultado = "desistencia";
    }
}