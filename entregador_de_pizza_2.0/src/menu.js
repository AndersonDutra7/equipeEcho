import rl from "readline-sync";
import { CONFIG } from "./config.js";

// ---------------------------------------------------------------------------
// Interface com o utilizador (apenas I/O — sem lógica de negócio)
// ---------------------------------------------------------------------------

/**
 * Apresenta o estado atual da partida e as opções do menu.
 */
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

/**
 * Lê a opção do jogador no terminal.
 */
export function lerOpcao() {
    return rl.question("Opção: ").trim();
}

/**
 * Apresenta o resultado de uma ação (entrega, abastecimento, etc.).
 */
export function apresentarResultado(resultado) {
    console.log(`\n${resultado.mensagem}`);

    if (resultado.gasto !== undefined) {
        console.log(`Combustível gasto: ${resultado.gasto}`);
    }

    if (resultado.recuperado !== undefined && resultado.sucesso) {
        console.log(`Combustível recuperado: ${resultado.recuperado}`);
    }
}

/**
 * Apresenta o resumo final da partida.
 */
export function mostrarResumo(estado) {
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
