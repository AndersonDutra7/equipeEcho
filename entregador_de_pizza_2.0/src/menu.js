import rl from "readline-sync";
import { CONFIG } from "./config.js";
import {
    entregarPizza,
    encerrarPartida,
} from "./game.js";
import { abastecerMoto } from "./fuel.js";

export function mostrarStatus(estado) {
    console.log(`
=================================
       ENTREGADOR DE PIZZA
=================================
Entregas: ${estado.entregasRealizadas}/${CONFIG.TOTAL_ENTREGAS}
Combustível: ${estado.combustivel}/${CONFIG.COMBUSTIVEL_MAXIMO}
Combustível gasto: ${estado.combustivelGasto}
Abastecimentos: ${estado.abastecimentos}
=================================
[1] Entregar pizza
[2] Abastecer moto
[3] Sair
=================================`);
}

function apresentarResultado(resultado) {
    console.log(`\n${resultado.mensagem}`);

    if (resultado.gasto !== undefined) {
        console.log(`Combustível gasto: ${resultado.gasto}`);
    }

    if (resultado.recuperado !== undefined && resultado.sucesso) {
        console.log(`Combustível recuperado: ${resultado.recuperado}`);
    }
}

export function executarMenu(estado) {
    while (estado.ativo) {
        mostrarStatus(estado);

        const opcao = rl.question("Opção: ").trim();

        switch (opcao) {
            case CONFIG.OPCOES_MENU.ENTREGAR:
                apresentarResultado(entregarPizza(estado));
                break;

            case CONFIG.OPCOES_MENU.ABASTECER:
                apresentarResultado(abastecerMoto(estado));
                break;

            case CONFIG.OPCOES_MENU.SAIR:
                encerrarPartida(estado);
                console.log("\nJogo encerrado.");
                break;

            default:
                console.log("\nOpção inválida. Escolhe 1, 2 ou 3.");
        }
    }

    console.log("\n========== RESUMO FINAL ==========");
    console.log(
        `Entregas: ${estado.entregasRealizadas}/${CONFIG.TOTAL_ENTREGAS}`
    );
    console.log(`Combustível gasto: ${estado.combustivelGasto}`);
    console.log(`Abastecimentos: ${estado.abastecimentos}`);

    if (estado.resultado === "vitoria") {
        console.log("Parabéns! Concluíste todas as entregas!");
    } else {
        console.log("Partida terminada sem concluir o objetivo.");
    }
}