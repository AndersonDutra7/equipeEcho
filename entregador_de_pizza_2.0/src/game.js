import { CONFIG } from "./config.js";
import { criarEstadoInicial } from "./gameState.js";
import { entregarPizza } from "./deliveries.js";
import { abastecerMoto } from "./fuel.js";
import {
    mostrarStatus,
    lerOpcao,
    apresentarResultado,
    mostrarResumo,
    sanitizarEntrada,
} from "./menu.js";

// ---------------------------------------------------------------------------
// Coordenação do fluxo da partida
// ---------------------------------------------------------------------------

/**
 * Verifica se todas as entregas foram concluídas e, em caso afirmativo,
 * marca a partida como encerrada com vitória.
 */
function verificarVitoria(estado) {
    if (estado.entregasRealizadas >= CONFIG.TOTAL_ENTREGAS) {
        estado.ativo = false;
        estado.resultado = "vitoria";
    }
}

/**
 * Encerra a partida por desistência do jogador.
 * Só altera o resultado se a partida ainda estiver em andamento.
 */
export function encerrarPartida(estado) {
    estado.ativo = false;

    if (estado.resultado === "em_andamento") {
        estado.resultado = "desistencia";
    }
}

/**
 * Processa uma ação escolhida pelo jogador.
 * Retorna o resultado da operação para apresentação, ou null se a partida
 * já estiver encerrada.
 *
 * Remove espaços desnecessários da opção e trata opções inválidas de forma
 * segura, sem encerrar o programa e sem alterar o estado.
 */
export function processarAcao(estado, opcao) {
    if (!estado.ativo) {
        return null;
    }

    const opcaoTratada = sanitizarEntrada(opcao);

    switch (opcaoTratada) {
        case CONFIG.OPCOES_MENU.ENTREGAR: {
            const resultado = entregarPizza(estado);
            verificarVitoria(estado);
            return resultado;
        }

        case CONFIG.OPCOES_MENU.ABASTECER:
            return abastecerMoto(estado);

        case CONFIG.OPCOES_MENU.SAIR:
            encerrarPartida(estado);
            return { sucesso: true, mensagem: "Jogo encerrado." };

        default:
            return {
                sucesso: false,
                mensagem: "Opção inválida. Escolhe 1, 2 ou 3.",
            };
    }
}

/**
 * Ponto de entrada principal do jogo.
 * Cria o estado inicial, executa o loop da partida e apresenta o resumo.
 *
 * O fluxo inteiro é controlado por esta função — nenhuma variável global
 * dispersa é necessária.
 *
 * Permite a injeção de uma função de leitura para testes automatizados.
 */
export function iniciarPartida(leitor = lerOpcao) {
    const estado = criarEstadoInicial();

    while (estado.ativo) {
        mostrarStatus(estado);

        const opcao = leitor();
        const resultado = processarAcao(estado, opcao);

        if (resultado) {
            apresentarResultado(resultado);
        }
    }

    mostrarResumo(estado);
    return estado;
}
