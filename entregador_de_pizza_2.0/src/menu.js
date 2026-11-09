import rl from "readline-sync";
import { CONFIG } from "./config.js";

// ---------------------------------------------------------------------------
// Interface com o utilizador (apenas I/O — sem lógica de negócio)
// ---------------------------------------------------------------------------

/**
 * Remove espaços desnecessários das extremidades da entrada.
 * Converte valores não-string de forma segura.
 */
export function sanitizarEntrada(entrada) {
    if (entrada === null || entrada === undefined) {
        return "";
    }
    return String(entrada).trim();
}

/**
 * Verifica se uma opção fornecida é válida de acordo com as configurações do menu.
 */
export function validarOpcao(opcao) {
    const opcaoLimpa = sanitizarEntrada(opcao);
    return Object.values(CONFIG.OPCOES_MENU).includes(opcaoLimpa);
}

/**
 * Formata o estado atual da partida e as opções do menu para exibição.
 */
export function formatarStatus(estado) {
    return `
=================================
       ENTREGADOR DE PIZZA
=================================
Entregas: ${estado.entregasRealizadas}/${CONFIG.TOTAL_ENTREGAS}
Combustível: ${estado.combustivel}/${CONFIG.COMBUSTIVEL_MAXIMO}
Combustível gasto: ${estado.combustivelGasto}
Abastecimentos: ${estado.abastecimentos}
=================================
[${CONFIG.OPCOES_MENU.ENTREGAR}] Entregar pizza
[${CONFIG.OPCOES_MENU.ABASTECER}] Abastecer moto
[${CONFIG.OPCOES_MENU.SAIR}] Sair
=================================`;
}

/**
 * Apresenta o estado atual da partida e as opções do menu.
 */
export function mostrarStatus(estado) {
    console.log(formatarStatus(estado));
}

/**
 * Lê a opção do jogador no terminal, removendo espaços desnecessários.
 * Permite a injeção de uma função de prompt customizada para testes.
 */
export function lerOpcao(promptFn) {
    if (typeof promptFn === "function") {
        return sanitizarEntrada(promptFn("Opção: "));
    }
    return sanitizarEntrada(rl.question("Opção: "));
}

/**
 * Formata o resultado de uma ação para apresentação clara ao utilizador.
 */
export function formatarResultado(resultado) {
    if (!resultado) {
        return "";
    }

    const linhas = [];

    if (resultado.mensagem) {
        linhas.push(resultado.mensagem);
    }

    if (resultado.gasto !== undefined) {
        if (resultado.sucesso) {
            linhas.push(`Combustível gasto: ${resultado.gasto}`);
        } else {
            linhas.push(`Combustível necessário: ${resultado.gasto}`);
        }
    }

    if (resultado.recuperado !== undefined && resultado.sucesso) {
        linhas.push(`Combustível recuperado: ${resultado.recuperado}`);
    }

    return linhas.join("\n");
}

/**
 * Apresenta o resultado de uma ação (entrega, abastecimento, etc.).
 */
export function apresentarResultado(resultado) {
    const texto = formatarResultado(resultado);
    if (texto) {
        console.log(`\n${texto}`);
    }
}

export {
    obterEstatisticas,
    calcularEstatisticas,
    formatarResumo,
    mostrarResumo,
} from "./statistics.js";
