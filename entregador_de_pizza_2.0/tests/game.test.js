import test from "node:test";
import assert from "node:assert/strict";

import { processarAcao, encerrarPartida, iniciarPartida } from "../src/game.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";

// ---------------------------------------------------------------------------
// Controlar o estado ativo da partida
// ---------------------------------------------------------------------------

test("a partida começa ativa e em andamento", () => {
    const estado = criarEstadoInicial();

    assert.equal(estado.ativo, true);
    assert.equal(estado.resultado, "em_andamento");
});

// ---------------------------------------------------------------------------
// Terminar ao completar todas as entregas (vitória)
// ---------------------------------------------------------------------------

test("a partida termina com vitória ao completar todas as entregas", () => {
    const original = Math.random;

    try {
        // Forçar gasto mínimo (10) para garantir combustível suficiente
        Math.random = () => 0;

        const estado = criarEstadoInicial();

        for (let i = 0; i < CONFIG.TOTAL_ENTREGAS; i++) {
            assert.equal(estado.ativo, true);
            processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
        }

        assert.equal(estado.ativo, false);
        assert.equal(estado.resultado, "vitoria");
        assert.equal(estado.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);
    } finally {
        Math.random = original;
    }
});

// ---------------------------------------------------------------------------
// Permitir sair antes de concluir — e não apresentar como vitória
// ---------------------------------------------------------------------------

test("sair encerra a partida como desistência, não como vitória", () => {
    const estado = criarEstadoInicial();

    processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

    assert.equal(estado.ativo, false);
    assert.equal(estado.resultado, "desistencia");
    assert.notEqual(estado.resultado, "vitoria");
});

test("sair após algumas entregas não é vitória", () => {
    const original = Math.random;

    try {
        Math.random = () => 0;

        const estado = criarEstadoInicial();

        // Fazer 2 entregas e depois sair
        processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
        processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
        processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

        assert.equal(estado.ativo, false);
        assert.equal(estado.resultado, "desistencia");
        assert.equal(estado.entregasRealizadas, 2);
    } finally {
        Math.random = original;
    }
});

// ---------------------------------------------------------------------------
// Impedir novas ações após o fim da partida
// ---------------------------------------------------------------------------

test("processarAcao não executa nada quando a partida já terminou", () => {
    const estado = criarEstadoInicial();
    encerrarPartida(estado);

    assert.equal(estado.ativo, false);

    // Tentar entregar após encerramento
    const resultado = processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
    assert.equal(resultado, null);
    assert.equal(estado.entregasRealizadas, 0);
});

test("abastecer é bloqueado após o fim da partida", () => {
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

    // Segunda tentativa de sair não muda nada
    const resultado = processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);
    assert.equal(resultado, null);
    assert.equal(estado.resultado, "desistencia");
});

// ---------------------------------------------------------------------------
// Opções inválidas não alteram o estado
// ---------------------------------------------------------------------------

test("opção inválida não altera o estado e devolve mensagem de erro", () => {
    const estado = criarEstadoInicial();
    const combustivelAntes = estado.combustivel;
    const entregasAntes = estado.entregasRealizadas;

    const resultado = processarAcao(estado, "xyz");

    assert.equal(resultado.sucesso, false);
    assert.equal(estado.ativo, true);
    assert.equal(estado.combustivel, combustivelAntes);
    assert.equal(estado.entregasRealizadas, entregasAntes);
});

// ---------------------------------------------------------------------------
// O fluxo principal não depende de variáveis globais dispersas
// ---------------------------------------------------------------------------

test("encerrarPartida preserva o resultado de vitória", () => {
    const estado = criarEstadoInicial();
    estado.resultado = "vitoria";

    // Chamar encerrar não deve sobrescrever a vitória com desistência
    encerrarPartida(estado);

    assert.equal(estado.ativo, false);
    assert.equal(estado.resultado, "vitoria");
});

test("múltiplas partidas independentes não interferem entre si", () => {
    const original = Math.random;

    try {
        Math.random = () => 0;

        const estado1 = criarEstadoInicial();
        const estado2 = criarEstadoInicial();

        // Terminar partida 1 por desistência
        processarAcao(estado1, CONFIG.OPCOES_MENU.SAIR);

        // Partida 2 deve continuar ativa e funcional
        assert.equal(estado2.ativo, true);
        processarAcao(estado2, CONFIG.OPCOES_MENU.ENTREGAR);
        assert.equal(estado2.entregasRealizadas, 1);
        assert.equal(estado2.ativo, true);
    } finally {
        Math.random = original;
    }
});

// ---------------------------------------------------------------------------
// Validação e tratamento de espaços e entradas inválidas no fluxo
// ---------------------------------------------------------------------------

test("opções válidas com espaços desnecessários acionam a ação correta", () => {
    const original = Math.random;

    try {
        Math.random = () => 0; // Gasto 10
        const estado = criarEstadoInicial();

        // Testar entrega com espaços
        const resultadoEntrega = processarAcao(estado, "   1   ");
        assert.equal(resultadoEntrega.sucesso, true);
        assert.equal(estado.entregasRealizadas, 1);
        assert.equal(estado.combustivel, 90);

        // Testar abastecimento com espaços
        const resultadoAbastecer = processarAcao(estado, "  2  ");
        assert.equal(resultadoAbastecer.sucesso, true);
        assert.equal(estado.combustivel, 100);
        assert.equal(estado.abastecimentos, 1);

        // Testar sair com espaços
        const resultadoSair = processarAcao(estado, " \t 3 \n ");
        assert.equal(resultadoSair.sucesso, true);
        assert.equal(estado.ativo, false);
        assert.equal(estado.resultado, "desistencia");
    } finally {
        Math.random = original;
    }
});

test("entradas inválidas não encerram a partida nem alteram o estado", () => {
    const estado = criarEstadoInicial();
    const entradasInvalidas = ["", "   ", "xyz", "0", "4", "99", null, undefined];

    for (const entrada of entradasInvalidas) {
        const resultado = processarAcao(estado, entrada);
        assert.equal(resultado.sucesso, false);
        assert.equal(resultado.mensagem, "Opção inválida. Escolhe 1, 2 ou 3.");
        assert.equal(estado.ativo, true);
        assert.equal(estado.entregasRealizadas, 0);
        assert.equal(estado.combustivel, 100);
    }
});

test("iniciarPartida continua em execução após entradas inválidas e só encerra ao solicitar", () => {
    const entradas = ["invalido1", "   ", "99", "3"];
    let indice = 0;
    const mockLeitor = () => entradas[indice++];

    // Redirecionar console.log para não poluir os logs de teste
    const originalLog = console.log;
    try {
        console.log = () => {};
        const estadoFinal = iniciarPartida(mockLeitor);

        assert.equal(estadoFinal.ativo, false);
        assert.equal(estadoFinal.resultado, "desistencia");
        assert.equal(indice, 4); // Garante que passou pelas 3 inválidas e parou na 4ª (sair)
    } finally {
        console.log = originalLog;
    }
});

