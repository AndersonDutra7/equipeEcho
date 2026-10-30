
import test from "node:test";
import assert from "node:assert/strict";
import { abastecerMoto } from "../src/fuel.js";
import { criarEstadoInicial } from "../src/gameState.js";

test("abastecer com 80 recupera 20 unidades", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = 80;

    const resultado = abastecerMoto(estado);

    assert.equal(resultado.sucesso, true);
    assert.equal(resultado.recuperado, 20);
    assert.equal(estado.combustivel, 100);
});

test("abastecer com 90 recupera somente 10 unidades", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = 90;

    const resultado = abastecerMoto(estado);

    assert.equal(resultado.sucesso, true);
    assert.equal(resultado.recuperado, 10);
    assert.equal(estado.combustivel, 100);
});

test("abastecer com tanque cheio não altera o estado", () => {
    const estado = criarEstadoInicial();
    const abastecimentosAntes = estado.abastecimentos;

    const resultado = abastecerMoto(estado);

    assert.equal(resultado.sucesso, false);
    assert.equal(resultado.recuperado, 0);
    assert.equal(estado.combustivel, 100);
    assert.equal(estado.abastecimentos, abastecimentosAntes);
});

test("abastecer com zero recupera 20 unidades", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = 0;

    const resultado = abastecerMoto(estado);

    assert.equal(resultado.sucesso, true);
    assert.equal(estado.combustivel, 20);
});

test("não abastece quando a partida terminou", () => {
    const estado = criarEstadoInicial();
    estado.ativo = false;

    const resultado = abastecerMoto(estado);

    assert.equal(resultado.sucesso, false);
    assert.equal(estado.combustivel, 100);
    assert.equal(estado.abastecimentos, 0);
});

test("não permite combustível acima de 100", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = 110;

    abastecerMoto(estado);

    assert.equal(estado.combustivel, 100);
});

test("corrige combustível negativo antes de abastecer", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = -5;

    abastecerMoto(estado);

    assert.equal(estado.combustivel, 20);
});