import test from "node:test";
import assert from "node:assert/strict";

import {
    sanitizarEntrada,
    validarOpcao,
    formatarStatus,
    mostrarStatus,
    lerOpcao,
    formatarResultado,
    apresentarResultado,
    formatarResumo,
    mostrarResumo,
} from "../src/menu.js";
import { criarEstadoInicial } from "../src/gameState.js";
import { CONFIG } from "../src/config.js";

// ---------------------------------------------------------------------------
// 1. Remover espaços desnecessários das entradas
// ---------------------------------------------------------------------------

test("sanitizarEntrada remove espaços no início e no final", () => {
    assert.equal(sanitizarEntrada("  1  "), "1");
    assert.equal(sanitizarEntrada(" 2 "), "2");
    assert.equal(sanitizarEntrada("\t3\n"), "3");
});

test("sanitizarEntrada lida com valores vazios, nulos e indefinidos", () => {
    assert.equal(sanitizarEntrada(""), "");
    assert.equal(sanitizarEntrada("   "), "");
    assert.equal(sanitizarEntrada(null), "");
    assert.equal(sanitizarEntrada(undefined), "");
});

test("sanitizarEntrada converte números para string limpa", () => {
    assert.equal(sanitizarEntrada(1), "1");
    assert.equal(sanitizarEntrada(2), "2");
});

test("lerOpcao remove espaços utilizando a função de leitura fornecida", () => {
    const mockPrompt = () => "   1   ";
    const opcao = lerOpcao(mockPrompt);
    assert.equal(opcao, "1");
});

// ---------------------------------------------------------------------------
// 2. Apresentar opções de forma consistente e refletir estado atualizado
// ---------------------------------------------------------------------------

test("formatarStatus apresenta todas as opções configuradas de forma consistente", () => {
    const estado = criarEstadoInicial();
    const texto = formatarStatus(estado);

    assert.ok(texto.includes(`[${CONFIG.OPCOES_MENU.ENTREGAR}] Entregar pizza`));
    assert.ok(texto.includes(`[${CONFIG.OPCOES_MENU.ABASTECER}] Abastecer moto`));
    assert.ok(texto.includes(`[${CONFIG.OPCOES_MENU.SAIR}] Sair`));
});

test("formatarStatus reflete o estado atualizado da partida", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 3;
    estado.combustivel = 60;
    estado.combustivelGasto = 40;
    estado.abastecimentos = 1;

    const texto = formatarStatus(estado);

    assert.ok(texto.includes(`Entregas: 3/${CONFIG.TOTAL_ENTREGAS}`));
    assert.ok(texto.includes(`Combustível: 60/${CONFIG.COMBUSTIVEL_MAXIMO}`));
    assert.ok(texto.includes("Combustível gasto: 40"));
    assert.ok(texto.includes("Abastecimentos: 1"));
});

test("mostrarStatus exibe no terminal sem lançar erros", () => {
    const logs = [];
    const logOriginal = console.log;
    try {
        console.log = (msg) => logs.push(msg);
        const estado = criarEstadoInicial();
        mostrarStatus(estado);
        assert.equal(logs.length, 1);
        assert.ok(logs[0].includes("ENTREGADOR DE PIZZA"));
    } finally {
        console.log = logOriginal;
    }
});

// ---------------------------------------------------------------------------
// 3. Tratar e validar opções
// ---------------------------------------------------------------------------

test("validarOpcao aceita opções válidas mesmo com espaços", () => {
    assert.equal(validarOpcao("1"), true);
    assert.equal(validarOpcao("  1  "), true);
    assert.equal(validarOpcao("2"), true);
    assert.equal(validarOpcao(" 2 "), true);
    assert.equal(validarOpcao("3"), true);
    assert.equal(validarOpcao("   3"), true);
});

test("validarOpcao rejeita opções inválidas", () => {
    assert.equal(validarOpcao("0"), false);
    assert.equal(validarOpcao("4"), false);
    assert.equal(validarOpcao("xyz"), false);
    assert.equal(validarOpcao(""), false);
    assert.equal(validarOpcao("   "), false);
    assert.equal(validarOpcao(null), false);
    assert.equal(validarOpcao(undefined), false);
});

// ---------------------------------------------------------------------------
// 4. Apresentar mensagens claras após cada ação
// ---------------------------------------------------------------------------

test("formatarResultado apresenta mensagem e combustível gasto em entrega bem-sucedida", () => {
    const resultado = {
        sucesso: true,
        mensagem: "Pizza entregue com sucesso!",
        gasto: 20,
    };
    const texto = formatarResultado(resultado);

    assert.ok(texto.includes("Pizza entregue com sucesso!"));
    assert.ok(texto.includes("Combustível gasto: 20"));
});

test("formatarResultado indica combustível necessário e não gasto quando a entrega falha", () => {
    const resultado = {
        sucesso: false,
        mensagem: "Combustível insuficiente.",
        gasto: 30,
    };
    const texto = formatarResultado(resultado);

    assert.ok(texto.includes("Combustível insuficiente."));
    assert.ok(texto.includes("Combustível necessário: 30"));
    assert.ok(!texto.includes("Combustível gasto:"));
});

test("formatarResultado apresenta combustível recuperado em abastecimento bem-sucedido", () => {
    const resultado = {
        sucesso: true,
        mensagem: "Moto abastecida!",
        recuperado: 20,
    };
    const texto = formatarResultado(resultado);

    assert.ok(texto.includes("Moto abastecida!"));
    assert.ok(texto.includes("Combustível recuperado: 20"));
});

test("formatarResultado apresenta mensagem clara para depósito cheio", () => {
    const resultado = {
        sucesso: false,
        mensagem: "O depósito já está cheio.",
        recuperado: 0,
    };
    const texto = formatarResultado(resultado);

    assert.ok(texto.includes("O depósito já está cheio."));
    assert.ok(!texto.includes("Combustível recuperado:"));
});

test("formatarResultado apresenta mensagem clara para opções inválidas", () => {
    const resultado = {
        sucesso: false,
        mensagem: "Opção inválida. Escolhe 1, 2 ou 3.",
    };
    const texto = formatarResultado(resultado);

    assert.equal(texto, "Opção inválida. Escolhe 1, 2 ou 3.");
});

test("apresentarResultado exibe o resultado formatado no terminal", () => {
    const logs = [];
    const logOriginal = console.log;
    try {
        console.log = (msg) => logs.push(msg);
        apresentarResultado({
            sucesso: true,
            mensagem: "Moto abastecida!",
            recuperado: 20,
            custo: 20,
            saldo: 5,
        });
        assert.equal(logs.length, 1);
        assert.ok(logs[0].includes("Moto abastecida!"));
        assert.ok(logs[0].includes("Combustível recuperado: 20"));
        assert.ok(logs[0].includes("Custo do abastecimento: R$ 20.00"));
        assert.ok(logs[0].includes("Saldo restante: R$ 5.00"));
    } finally {
        console.log = logOriginal;
    }
});

// ---------------------------------------------------------------------------
// 5. Resumo final
// ---------------------------------------------------------------------------

test("formatarResumo apresenta informações de vitória", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 5;
    estado.combustivelGasto = 80;
    estado.abastecimentos = 2;
    estado.resultado = "vitoria";

    const texto = formatarResumo(estado);

    assert.ok(texto.includes("RESUMO FINAL"));
    assert.ok(texto.includes(`Entregas: 5/${CONFIG.TOTAL_ENTREGAS}`));
    assert.ok(texto.includes("Combustível gasto: 80"));
    assert.ok(texto.includes("Abastecimentos: 2"));
    assert.ok(texto.includes("Parabéns! Concluíste todas as entregas!"));
});

test("formatarResumo apresenta informações de desistência", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 2;
    estado.combustivelGasto = 30;
    estado.abastecimentos = 0;
    estado.resultado = "desistencia";

    const texto = formatarResumo(estado);

    assert.ok(texto.includes("Partida terminada sem concluir o objetivo."));
});

test("mostrarResumo exibe o resumo no console sem erros", () => {
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
