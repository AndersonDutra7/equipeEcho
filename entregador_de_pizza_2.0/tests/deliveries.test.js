import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { entregarPizza, sortearGasto, sortearRecompensa } from "../src/deliveries.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";

/**
 * Função utilitária para executar um callback com Math.random mockado,
 * garantindo restauração determinística ao estado original.
 */
function comRandomMockado(valorMockado, callback) {
    const original = Math.random;
    try {
        Math.random = typeof valorMockado === "function" ? valorMockado : () => valorMockado;
        return callback();
    } finally {
        Math.random = original;
    }
}

describe("Testes das Regras de Entrega e Consumo de Combustível", () => {
    describe("Sorteio de consumo", () => {
        test("sorteia somente gastos de 10, 20 ou 30 de forma determinística", () => {
            const casos = [
                { random: 0.0, esperado: 10 },
                { random: 0.4, esperado: 20 },
                { random: 0.99, esperado: 30 },
            ];

            for (const { random, esperado } of casos) {
                comRandomMockado(random, () => {
                    assert.equal(sortearGasto(), esperado);
                });
            }
        });
    });


    describe("Recompensas por entrega", () => {
        test("sorteia recompensas dentro do intervalo documentado de R$ 20 a R$ 50", () => {
            comRandomMockado(0, () => assert.equal(sortearRecompensa(), 20));
            comRandomMockado(0.999999, () => assert.equal(sortearRecompensa(), 50));
        });

        test("adiciona a recompensa ao saldo somente após entrega bem-sucedida", () => {
            const estado = criarEstadoInicial();
            comRandomMockado(0, () => {
                const resultado = entregarPizza(estado);
                assert.equal(resultado.sucesso, true);
                assert.equal(resultado.recompensa, 20);
                assert.equal(resultado.saldo, 20);
                assert.equal(estado.dinheiro, 20);
            });
        });

        test("não concede recompensa nem altera o saldo quando falta combustível", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 5;
            estado.dinheiro = 35;
            comRandomMockado(0, () => {
                const resultado = entregarPizza(estado);
                assert.equal(resultado.sucesso, false);
                assert.equal(resultado.recompensa, undefined);
                assert.equal(estado.dinheiro, 35);
                assert.equal(estado.entregasRealizadas, 0);
            });
        });

        test("não concede recompensa quando a partida terminou ou a meta foi atingida", () => {
            const encerrado = criarEstadoInicial();
            encerrado.ativo = false;
            const saldoInicial = encerrado.dinheiro;
            assert.equal(entregarPizza(encerrado).sucesso, false);
            assert.equal(encerrado.dinheiro, saldoInicial);

            const concluido = criarEstadoInicial();
            concluido.entregasRealizadas = CONFIG.TOTAL_ENTREGAS;
            assert.equal(entregarPizza(concluido).sucesso, false);
            assert.equal(concluido.dinheiro, 0);
        });
    });

    // Tarefa 1: Testar entrega com combustível suficiente
    describe("Entrega com combustível suficiente", () => {
        test("desconta o combustível sorteado, atualiza total gasto e incrementa entregas", () => {
            const estado = criarEstadoInicial();
            // Mock para índice 0 -> gasto 10
            comRandomMockado(0.0, () => {
                const resultado = entregarPizza(estado);

                assert.equal(resultado.sucesso, true);
                assert.equal(resultado.gasto, 10);
                assert.equal(resultado.mensagem, "Pizza entregue com sucesso!");
                assert.equal(estado.combustivel, 90);
                assert.equal(estado.combustivelGasto, 10);
                assert.equal(estado.entregasRealizadas, 1);
            });
        });

        test("realiza entrega com sucesso quando o combustível é exatamente igual ao gasto sorteado", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 20;

            // Mock para índice 1 -> gasto 20
            comRandomMockado(0.4, () => {
                const resultado = entregarPizza(estado);

                assert.equal(resultado.sucesso, true);
                assert.equal(resultado.gasto, 20);
                assert.equal(estado.combustivel, 0);
                assert.equal(estado.combustivelGasto, 20);
                assert.equal(estado.entregasRealizadas, 1);
            });
        });

        test("funciona corretamente com o gasto máximo de 30 unidades", () => {
            const estado = criarEstadoInicial();
            // Mock para índice 2 -> gasto 30
            comRandomMockado(0.9, () => {
                const resultado = entregarPizza(estado);

                assert.equal(resultado.sucesso, true);
                assert.equal(resultado.gasto, 30);
                assert.equal(estado.combustivel, 70);
                assert.equal(estado.combustivelGasto, 30);
                assert.equal(estado.entregasRealizadas, 1);
            });
        });
    });

    // Tarefa 2: Testar combustível insuficiente
    describe("Combustível insuficiente", () => {
        test("recusa entrega quando o combustível é inferior ao gasto sorteado", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 15;

            // Mock para gasto 20 (índice 1)
            comRandomMockado(0.4, () => {
                const resultado = entregarPizza(estado);

                assert.equal(resultado.sucesso, false);
                assert.equal(resultado.mensagem, "Combustível insuficiente.");
                assert.equal(resultado.gasto, 20);
            });
        });

        test("critério de aceitação: o contador não aumenta numa entrega falhada", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 5;
            estado.entregasRealizadas = 2;

            comRandomMockado(0.0, () => { // Gasto 10 > 5
                entregarPizza(estado);
                assert.equal(estado.entregasRealizadas, 2);
            });
        });

        test("critério de aceitação: o combustível não é descontado indevidamente em falha", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 8;
            estado.combustivelGasto = 20;

            comRandomMockado(0.9, () => { // Gasto 30 > 8
                entregarPizza(estado);
                assert.equal(estado.combustivel, 8);
                assert.equal(estado.combustivelGasto, 20);
            });
        });
    });

    // Tarefa 3: Testar progressão do contador
    describe("Progressão do contador", () => {
        test("contador avança de 1 em 1 a cada entrega bem-sucedida até a meta", () => {
            const estado = criarEstadoInicial();
            // Gasto de 10 por entrega -> 5 entregas consom 50, restam 50
            comRandomMockado(0.0, () => {
                for (let i = 1; i <= CONFIG.TOTAL_ENTREGAS; i++) {
                    const resultado = entregarPizza(estado);
                    assert.equal(resultado.sucesso, true);
                    assert.equal(estado.entregasRealizadas, i);
                    assert.equal(estado.combustivel, 100 - i * 10);
                    assert.equal(estado.combustivelGasto, i * 10);
                }
            });
        });

        test("entrega falhada intercalada não afeta a progressão das entregas subsequentes", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 25;

            // 1ª entrega: gasto 10 (sucesso) -> combustivel = 15, entregas = 1
            comRandomMockado(0.0, () => {
                assert.equal(entregarPizza(estado).sucesso, true);
                assert.equal(estado.entregasRealizadas, 1);
                assert.equal(estado.combustivel, 15);
            });

            // 2ª tentativa: gasto 20 (falha, 15 < 20) -> contador e combustivel mantidos
            comRandomMockado(0.4, () => {
                assert.equal(entregarPizza(estado).sucesso, false);
                assert.equal(estado.entregasRealizadas, 1);
                assert.equal(estado.combustivel, 15);
            });

            // 3ª tentativa: gasto 10 (sucesso, 15 >= 10) -> combustivel = 5, entregas = 2
            comRandomMockado(0.0, () => {
                assert.equal(entregarPizza(estado).sucesso, true);
                assert.equal(estado.entregasRealizadas, 2);
                assert.equal(estado.combustivel, 5);
            });
        });
    });

    // Tarefa 4: Testar bloqueio após completar o objetivo
    describe("Bloqueio após completar o objetivo", () => {
        test("impede novas entregas após atingir a meta total de 5 entregas", () => {
            const estado = criarEstadoInicial();
            estado.entregasRealizadas = CONFIG.TOTAL_ENTREGAS;
            const combustivelAntes = estado.combustivel;

            const resultado = entregarPizza(estado);

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.mensagem, "Todas as entregas foram concluídas.");
            assert.equal(estado.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);
            assert.equal(estado.combustivel, combustivelAntes);
        });

        test("critério de aceitação: o limite de entregas é respeitado e nunca ultrapassa 5", () => {
            const estado = criarEstadoInicial();
            estado.entregasRealizadas = CONFIG.TOTAL_ENTREGAS;

            // Tenta entregar múltiplas vezes após a meta
            for (let i = 0; i < 3; i++) {
                const resultado = entregarPizza(estado);
                assert.equal(resultado.sucesso, false);
                assert.equal(estado.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);
            }
        });

        test("impede entregas se a partida já tiver sido encerrada (ativo: false)", () => {
            const estado = criarEstadoInicial();
            estado.ativo = false;

            const resultado = entregarPizza(estado);

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.mensagem, "A partida terminou.");
            assert.equal(estado.entregasRealizadas, 0);
        });
    });
});
