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
Saldo: R$ ${(Number(estado.dinheiro) || 0).toFixed(2)}
Preço do combustível: R$ ${CONFIG.PRECO_COMBUSTIVEL_POR_UNIDADE.toFixed(2)} por unidade
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

    if (resultado.recompensa !== undefined && resultado.sucesso) {
        linhas.push(`Recompensa recebida: R$ ${resultado.recompensa.toFixed(2)}`);
        linhas.push(`Saldo atual: R$ ${resultado.saldo.toFixed(2)}`);
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

    if (resultado.custo !== undefined && resultado.sucesso) {
        linhas.push(`Custo do abastecimento: R$ ${resultado.custo.toFixed(2)}`);
        linhas.push(`Saldo restante: R$ ${resultado.saldo.toFixed(2)}`);
    }

    if (resultado.custoNecessario !== undefined) {
        linhas.push(`Valor necessário: R$ ${resultado.custoNecessario.toFixed(2)}`);
        linhas.push(`Saldo disponível: R$ ${(resultado.saldo || 0).toFixed(2)}`);
    }

    return linhas.join("\n");
}

/**
 * Apresenta o resultado de uma ação (entrega, abastecimento, etc.).
 */
export function apresentarResultado(resultado) {
    const texto = formatarResultado(resultado);
    if (texto) {
        console.log(`
${texto}`);
    }
}

/**
 * Formata o menu final com as opções disponíveis após o término da partida.
 */
export function formatarMenuFinal() {
    return `
=================================
          MENU FINAL
=================================
[${CONFIG.OPCOES_MENU_FINAL.REINICIAR}] Jogar novamente
[${CONFIG.OPCOES_MENU_FINAL.SAIR}] Sair
=================================`;
}

/**
 * Apresenta o menu final no console.
 */
export function mostrarMenuFinal() {
    console.log(formatarMenuFinal());
}

/**
 * Solicita ao jogador a confirmação ou a opção no menu final para reiniciar a partida.
 * Aceita as opções numéricas configuradas ("1" para reiniciar, "2" para sair)
 * bem como respostas afirmativas ("s", "sim", "y", "yes") ou negativas ("n", "nao", "não", "no").
 *
 * Retorna true para reiniciar a partida ou false para encerrar.
 *
 * @param {Function} [leitor=lerOpcao] Função de leitura customizada para testes.
 * @returns {boolean}
 */
export function solicitarConfirmacaoReiniciar(leitor = lerOpcao) {
    while (true) {
        mostrarMenuFinal();
        const entrada = typeof leitor === "function" ? leitor() : "";
        const opcao = sanitizarEntrada(entrada).toLowerCase();

        // Encerramento seguro para EOF ou entradas vazias (null, undefined, string vazia ou apenas espaços)
        if (!opcao) {
            return false;
        }

        if (
            opcao === CONFIG.OPCOES_MENU_FINAL.REINICIAR ||
            opcao === "s" ||
            opcao === "sim" ||
            opcao === "y" ||
            opcao === "yes"
        ) {
            return true;
        }

        if (
            opcao === CONFIG.OPCOES_MENU_FINAL.SAIR ||
            opcao === "n" ||
            opcao === "nao" ||
            opcao === "não" ||
            opcao === "no"
        ) {
            return false;
        }

        console.log("\nOpção inválida. Escolhe 1 (Jogar novamente) ou 2 (Sair).");
    }
}

export const perguntarReiniciar = solicitarConfirmacaoReiniciar;

export {
    obterEstatisticas,
    calcularEstatisticas,
    formatarResumo,
    mostrarResumo,
} from "./statistics.js";
