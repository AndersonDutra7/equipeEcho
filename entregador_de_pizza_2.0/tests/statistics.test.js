import test from "node:test";
import assert from "node:assert/strict";

import {
    obterEstatisticas,
    calcularEstatisticas,
    formatarResumo,
    mostrarResumo,
} from "../src/statistics.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";
import { processarAcao, iniciarPartida } from "../src/game.js";

// ---------------------------------------------------------------------------
// 1. Extração e cálculo de estatísticas da partida
// ---------------------------------------------------------------------------

test("obterEstatisticas extrai corretamente os contadores do estado", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 3;
    estado.combustivelGasto = 50;
    estado.abastecimentos = 2;
    estado.combustivel = 70;
    estado.resultado = "em_andamento";

    const stats = obterEstatisticas(estado);

    assert.equal(stats.entregasRealizadas, 3);
    assert.equal(stats.totalEntregas, CONFIG.TOTAL_ENTREGAS);
    assert.equal(stats.combustivelGasto, 50);
    assert.equal(stats.abastecimentos, 2);
    assert.equal(stats.combustivelRestante, 70);
    assert.equal(stats.resultado, "em_andamento");
    assert.equal(stats.vitoria, false);
    assert.equal(stats.desistencia, false);
});

test("calcularEstatisticas é um alias para obterEstatisticas", () => {
    assert.equal(calcularEstatisticas, obterEstatisticas);
});

test("obterEstatisticas identifica condição de vitória", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 5;
    estado.resultado = "vitoria";

    const stats = obterEstatisticas(estado);

    assert.equal(stats.vitoria, true);
    assert.equal(stats.desistencia, false);
});

test("obterEstatisticas identifica condição de desistência", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 2;
    estado.resultado = "desistencia";

    const stats = obterEstatisticas(estado);

    assert.equal(stats.vitoria, false);
    assert.equal(stats.desistencia, true);
});

test("obterEstatisticas não altera o estado da partida (imutabilidade)", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 2;
    estado.combustivelGasto = 30;
    estado.abastecimentos = 1;
    estado.resultado = "em_andamento";

    const copiaAntes = JSON.stringify(estado);
    obterEstatisticas(estado);
    const copiaDepois = JSON.stringify(estado);

    assert.equal(copiaAntes, copiaDepois);
});

test("obterEstatisticas lida com valores ausentes ou indefinidos de forma segura", () => {
    const statsNulo = obterEstatisticas(null);
    assert.equal(statsNulo.entregasRealizadas, 0);
    assert.equal(statsNulo.totalEntregas, CONFIG.TOTAL_ENTREGAS);
    assert.equal(statsNulo.combustivelGasto, 0);
    assert.equal(statsNulo.abastecimentos, 0);
    assert.equal(statsNulo.vitoria, false);

    const statsVazio = obterEstatisticas({});
    assert.equal(statsVazio.entregasRealizadas, 0);
    assert.equal(statsVazio.totalEntregas, CONFIG.TOTAL_ENTREGAS);
});

// ---------------------------------------------------------------------------
// 2. Formatação do resumo final
// ---------------------------------------------------------------------------

test("formatarResumo exibe cabeçalho, contadores e mensagem de vitória", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = CONFIG.TOTAL_ENTREGAS;
    estado.combustivelGasto = 70;
    estado.abastecimentos = 1;
    estado.resultado = "vitoria";

    const resumo = formatarResumo(estado);

    assert.ok(resumo.includes("========== RESUMO FINAL =========="));
    assert.ok(resumo.includes(`Entregas: ${CONFIG.TOTAL_ENTREGAS}/${CONFIG.TOTAL_ENTREGAS}`));
    assert.ok(resumo.includes("Combustível gasto: 70"));
    assert.ok(resumo.includes("Abastecimentos: 1"));
    assert.ok(resumo.includes("Parabéns! Concluíste todas as entregas!"));
    assert.ok(!resumo.includes("Partida terminada sem concluir o objetivo."));
});

test("formatarResumo exibe mensagem de encerramento antecipado e não de vitória", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 1;
    estado.combustivelGasto = 20;
    estado.abastecimentos = 0;
    estado.resultado = "desistencia";

    const resumo = formatarResumo(estado);

    assert.ok(resumo.includes("========== RESUMO FINAL =========="));
    assert.ok(resumo.includes(`Entregas: 1/${CONFIG.TOTAL_ENTREGAS}`));
    assert.ok(resumo.includes("Combustível gasto: 20"));
    assert.ok(resumo.includes("Abastecimentos: 0"));
    assert.ok(resumo.includes("Partida terminada sem concluir o objetivo."));
    assert.ok(!resumo.includes("Parabéns!"));
});

test("formatarResumo não altera o estado da partida", () => {
    const estado = criarEstadoInicial();
    const copiaAntes = JSON.stringify(estado);
    formatarResumo(estado);
    const copiaDepois = JSON.stringify(estado);

    assert.equal(copiaAntes, copiaDepois);
});

// ---------------------------------------------------------------------------
// 3. Apresentação do resumo (I/O)
// ---------------------------------------------------------------------------

test("mostrarResumo permite injeção de escritor customizado", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 5;
    estado.resultado = "vitoria";

    let textoExibido = "";
    mostrarResumo(estado, (msg) => {
        textoExibido = msg;
    });

    assert.ok(textoExibido.includes("RESUMO FINAL"));
    assert.ok(textoExibido.includes("Parabéns! Concluíste todas as entregas!"));
});

test("mostrarResumo utiliza console.log por padrão", () => {
    const logs = [];
    const logOriginal = console.log;

    try {
        console.log = (msg) => logs.push(msg);
        const estado = criarEstadoInicial();
        mostrarResumo(estado);

        assert.equal(logs.length, 1);
        assert.ok(logs[0].includes("RESUMO FINAL"));
    } finally {
        console.log = logOriginal;
    }
});

// ---------------------------------------------------------------------------
// 4. Critérios de aceitação da partida completa
// ---------------------------------------------------------------------------

test("o resumo é apresentado uma única vez ao término da partida com vitória", () => {
    const originalRandom = Math.random;
    const originalLog = console.log;

    try {
        Math.random = () => 0; // Gasto fixo de 10
        const logs = [];
        console.log = (msg) => logs.push(msg);

        // 5 entregas consecutivas garantem vitória imediata
        const entradas = ["1", "1", "1", "1", "1"];
        let indice = 0;
        const mockLeitor = () => entradas[indice++];

        const estadoFinal = iniciarPartida(mockLeitor);

        assert.equal(estadoFinal.resultado, "vitoria");
        assert.equal(estadoFinal.entregasRealizadas, CONFIG.TOTAL_ENTREGAS);

        // Contar ocorrências do cabeçalho de resumo
        const ocorrenciasResumo = logs.filter((log) =>
            typeof log === "string" && log.includes("========== RESUMO FINAL ==========")
        );

        assert.equal(ocorrenciasResumo.length, 1);
    } finally {
        Math.random = originalRandom;
        console.log = originalLog;
    }
});

test("o resumo é apresentado uma única vez ao término por saída antecipada", () => {
    const originalRandom = Math.random;
    const originalLog = console.log;

    try {
        Math.random = () => 0;
        const logs = [];
        console.log = (msg) => logs.push(msg);

        // 1 entrega, 1 abastecimento, depois sair
        const entradas = ["1", "2", "3"];
        let indice = 0;
        const mockLeitor = () => entradas[indice++];

        const estadoFinal = iniciarPartida(mockLeitor);

        assert.equal(estadoFinal.resultado, "desistencia");
        assert.equal(estadoFinal.entregasRealizadas, 1);
        assert.equal(estadoFinal.abastecimentos, 1);

        const ocorrenciasResumo = logs.filter((log) =>
            typeof log === "string" && log.includes("========== RESUMO FINAL ==========")
        );

        assert.equal(ocorrenciasResumo.length, 1);
    } finally {
        Math.random = originalRandom;
        console.log = originalLog;
    }
});

test("as estatísticas correspondem com precisão às ações realizadas", () => {
    const originalRandom = Math.random;
    try {
        Math.random = () => 0; // Gasto fixo de 10

        const estado = criarEstadoInicial();

        // 1. Fazer 2 entregas (gasto: 10 + 10 = 20)
        processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);
        processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);

        // 2. Abastecer 1 vez (+20 de combustível, abastecimentos: 1)
        processarAcao(estado, CONFIG.OPCOES_MENU.ABASTECER);

        // 3. Fazer mais 1 entrega (gasto: +10 = 30)
        processarAcao(estado, CONFIG.OPCOES_MENU.ENTREGAR);

        // 4. Sair antecipadamente
        processarAcao(estado, CONFIG.OPCOES_MENU.SAIR);

        const stats = obterEstatisticas(estado);

        assert.equal(stats.entregasRealizadas, 3);
        assert.equal(stats.combustivelGasto, 30);
        assert.equal(stats.abastecimentos, 1);
        assert.equal(stats.resultado, "desistencia");
        assert.equal(stats.vitoria, false);
        assert.equal(stats.desistencia, true);

        const resumo = formatarResumo(estado);
        assert.ok(resumo.includes("Entregas: 3/5"));
        assert.ok(resumo.includes("Combustível gasto: 30"));
        assert.ok(resumo.includes("Abastecimentos: 1"));
        assert.ok(resumo.includes("Partida terminada sem concluir o objetivo."));
    } finally {
        Math.random = originalRandom;
    }
});
