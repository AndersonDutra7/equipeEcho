import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { abastecerMoto } from "../src/fuel.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";

describe("Testes do Sistema de Combustível e Abastecimento", () => {
    // Tarefa 1: Testar depósito vazio
    describe("Depósito vazio", () => {
        test("abastecer com depósito vazio (0 unidades) recupera 20 unidades e atualiza o estado", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 0;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, CONFIG.COMBUSTIVEL_POR_ABASTECIMENTO);
            assert.equal(resultado.mensagem, "Moto abastecida!");
            assert.equal(estado.combustivel, 20);
            assert.equal(estado.abastecimentos, 1);
        });
    });

    // Tarefa 2: Testar depósito cheio
    describe("Depósito cheio", () => {
        test("abastecer com depósito cheio (100 unidades) não altera o combustível nem o contador de abastecimentos", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = CONFIG.COMBUSTIVEL_MAXIMO;
            const abastecimentosAntes = estado.abastecimentos;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.recuperado, 0);
            assert.equal(resultado.mensagem, "O depósito já está cheio.");
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
            assert.equal(estado.abastecimentos, abastecimentosAntes);
        });
    });

    // Tarefa 3: Testar abastecimento parcial
    describe("Abastecimento parcial", () => {
        test("abastecer com nível intermediário (ex: 50 unidades) recupera a recarga padrão completa (20 unidades)", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 50;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, 20);
            assert.equal(estado.combustivel, 70);
            assert.equal(estado.abastecimentos, 1);
        });

        test("abastecer com 85 unidades recupera apenas o parcial necessário (15 unidades) para atingir 100", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 85;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, 15);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
            assert.equal(estado.abastecimentos, 1);
        });
    });

    // Tarefa 4: Testar abastecimento próximo do limite máximo
    describe("Abastecimento próximo do limite máximo", () => {
        test("abastecer com 80 unidades recupera exatamente 20 unidades e atinge o teto", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 80;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, 20);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
        });

        test("abastecer com 90 unidades recupera somente 10 unidades e não ultrapassa 100", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 90;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, 10);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
        });

        test("abastecer com 99 unidades recupera somente 1 unidade e crava em 100", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 99;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(resultado.recuperado, 1);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
        });
    });

    // Validações de limites e regras de segurança adicionais
    describe("Limites e validações de segurança", () => {
        test("não permite abastecer quando a partida já estiver encerrada", () => {
            const estado = criarEstadoInicial();
            estado.ativo = false;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.recuperado, 0);
            assert.equal(resultado.mensagem, "A partida terminou.");
            assert.equal(estado.abastecimentos, 0);
        });

        test("não permite combustível acima de 100, corrigindo o limite defensivamente", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = 110;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, false);
            assert.equal(resultado.recuperado, 0);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_MAXIMO);
        });

        test("corrige combustível negativo defensivamente antes de abastecer", () => {
            const estado = criarEstadoInicial();
            estado.combustivel = -5;

            const resultado = abastecerMoto(estado);

            assert.equal(resultado.sucesso, true);
            assert.equal(estado.combustivel, CONFIG.COMBUSTIVEL_POR_ABASTECIMENTO);
        });
    });
});
