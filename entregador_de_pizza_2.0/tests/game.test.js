import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { processarAcao, encerrarPartida, iniciarPartida } from "../src/game.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";

/**
 * Função utilitária para executar um callback com Math.random mockado,
 * garantindo restauração ao estado original.
 */
function comRandomMockado(valor, callback) {
    const original = Math.random;
    try {
        Math.random = typeof valor === "function" ? valor : () => valor;
        return callback();
    } finally {
        Math.random = original;
    }
}

describe("Testes do Fluxo de Jogo e Condições de Encerramento", () => {
    // Tarefa 1: Testar opção inválida
    describe("Opção inválida", () => {
        test("opção inválida retorna mensagem de erro sem alterar o estado", () => {
            const estado = criarEstadoInicial();
            const combustivelAntes = estado.combustivel;
            const entregasAntes = estado.entregasRealizadas;

            const resultado = processarAcao(estado, "xyz");

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.mensagem, "Opção inválida. Escolhe 1, 2 ou 3.");
            assert.equal(estado.ativo, true);
            assert.equal(estado.combustivel, combustivelAntes);
            assert.equal(estado.entregasRealizadas, entregasAntes);
        });

        test("entradas vazias, nulas e indefinidas são tratadas como opção inválida", () => {
            const estado = criarEstadoInicial();
            const entradasInvalidas = ["", "   ", null, undefined, "0", "4", "99"];

            for (const entrada of entradasInvalidas) {
                const resultado = processarAcao(estado, entrada);

                assert.equal(resultado.sucesso, false);
                assert.equal(resultado.mensagem, "Opção inválida. Escolhe 1, 2 ou 3.");
                assert.equal(estado.ativo, true);
                assert.equal(estado.entregasRealizadas, 0);
                assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_INICIAL);
            }
        });

        test("opções válidas com espaços são aceitas corretamente", () => {
            comRandomMockado(0.0, () => {
                const estado = criarEstadoInicial();

                const resultado = processarAcao(estado, "   1   ");

                assert.equal(resultado.sucesso, true);
                assert.equal(estado.entregasRealizadas, 1);
            });
        });
    });

    // Tarefa 2: Testar saída antecipada
    describe("Saída antecipada", () => {
        test("sair encerra a partida como desistência", () => {
            const estado = criarEstadoInicial();

            processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

            assert.equal(estado.ativo, false);
            assert.equal(estado.resultado, "desistencia");
            assert.notEqual(estado.resultado, "vitoria");
        });

        test("sair após algumas entregas não é considerado vitória", () => {
            comRandomMockado(0.0, () => {
                const estado = criarEstadoInicial();

                processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
                processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
                processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

                assert.equal(estado.ativo, false);
                assert.equal(estado.resultado, "desistencia");
                assert.equal(estado.entregasRealizadas, 2);
            });
        });

        test("encerrarPartida preserva o resultado de vitória e não sobrescreve com desistência", () => {
            const estado = criarEstadoInicial();
            estado.resultado = "vitoria";

            encerrarPartida(estado);

            assert.equal(estado.ativo, false);
            assert.equal(estado.resultado, "vitoria");
        });
    });

    // Tarefa 3: Testar vitória
    describe("Vitória", () => {
        test("a partida começa ativa e em andamento", () => {
            const estado = criarEstadoInicial();

            assert.equal(estado.ativo, true);
            assert.equal(estado.resultado, "em_andamento");
        });

        test("a partida termina com vitória ao completar todas as 5 entregas", () => {
            comRandomMockado(0.0, () => {
                const estado = criarEstadoInicial();

                for (let i = 0; i < CONFIG.TOTAL_ENTREGAS; i++) {
                    assert.equal(estado.ativo, true);
                    processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
                }

                assert.equal(estado.ativo, false);
                assert.equal(estado.resultado, "vitoria");
                assert.equal(estado.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);
            });
        });

        test("iniciarPartida executa o fluxo completo até a vitória via leitor injetado", () => {
            const original = Math.random;
            const originalLog = console.log;
            try {
                Math.random = () => 0; // Gasto mínimo de 10

                // Simula 5 entregas (opção "1") seguidas
                const entradas = Array(CONFIG.TOTAL_ENTREGAS).fill(CONFIG.OPCOES_MENU.ENTREGAR);
                let indice = 0;
                const mockLeitor = () => entradas[indice++];

                console.log = () => {};
                const estadoFinal = iniciarPartida(mockLeitor);

                assert.equal(estadoFinal.ativo, false);
                assert.equal(estadoFinal.resultado, "vitoria");
                assert.equal(estadoFinal.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);
            } finally {
                Math.random = original;
                console.log = originalLog;
            }
        });
    });

    // Tarefa 4: Verificar que não existem ações após o encerramento
    describe("Sem ações após encerramento", () => {
        test("processarAcao retorna null para qualquer ação após encerramento por desistência", () => {
            const estado = criarEstadoInicial();
            encerrarPartida(estado);

            const resultadoEntrega = processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
            const resultadoAbastecer = processarAcao(estado, CONFIG.OPCOES_MENU.ABASTECER);
            const resultadoSair = processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

            assert.equal(resultadoEntrega, null);
            assert.equal(resultadoAbastecer, null);
            assert.equal(resultadoSair, null);
            assert.equal(estado.entregasRealizadas, 0);
        });

        test("abastecer é bloqueado e o combustível não muda após o fim da partida", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 50;
            encerrarPartida(estado);

            const resultado = processarAcao(estado, CONFIG.OPCOES_MENU.ABASTECER);

            assert.equal(resultado, null);
            assert.equal(estado.combustivel, 50);
        });

        test("não é possível sair duas vezes", () => {
            const estado = criarEstadoInicial();

            processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);
            assert.equal(estado.resultado, "desistencia");

            const resultado = processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);
            assert.equal(resultado, null);
            assert.equal(estado.resultado, "desistencia");
        });

        test("múltiplas partidas independentes não interferem entre si", () => {
            comRandomMockado(0.0, () => {
                const estado1 = criarEstadoInicial();
                const estado2 = criarEstadoInicial();

                processarAcao(estado1, CONFIG.OPCOES_MENU.SAIR);

                assert.equal(estado2.ativo, true);
                processarAcao(estado2, CONFIG.OPCOES_MENU.ENTREGAR);
                assert.equal(estado2.entregasRealizadas, 1);
                assert.equal(estado2.ativo, true);
            });
        });

        test("iniciarPartida continua ativa após entradas inválidas e só encerra ao solicitar saída", () => {
            const entradas = ["invalido", "   ", "99", CONFIG.OPCOES_MENU.SAIR];
            let indice = 0;
            const mockLeitor = () => entradas[indice++];

            const originalLog = console.log;
            try {
                console.log = () => {};
                const estadoFinal = iniciarPartida(mockLeitor);

                assert.equal(estadoFinal.ativo, false);
                assert.equal(estadoFinal.resultado, "desistencia");
                assert.equal(indice, 4);
            } finally {
                console.log = originalLog;
            }
        });
    });
});
