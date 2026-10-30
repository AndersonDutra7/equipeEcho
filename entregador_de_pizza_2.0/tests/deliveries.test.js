
import test from "node:test";
import assert from "node:assert/strict";

import { entregarPizza, sortearGasto } from "../src/game.js";
import { criarEstadoInicial } from "../src/gameState.js";

test("sorteia somente gastos de 10, 20 ou 30", () => {
    const original = Math.random;

    try {
        for (const [valor, esperado] of [
            [0, 10],
            [0.4, 20],
            [0.99, 30],
        ]) {
            Math.random = () => valor;
            assert.equal(sortearGasto(), esperado);
        }
    } finally {
        Math.random = original;
    }
});

test("entrega válida desconta combustível e aumenta contador", () => {
    const estado = criarEstadoInicial();
    Math.random = () => 0;

    try {
        const resultado = entregarPizza(estado);

        assert.equal(resultado.sucesso, true);
        assert.equal(estado.combustivel, 90);
        assert.equal(estado.entregasRealizadas, 1);
        assert.equal(estado.combustivelGasto, 10);
    } finally {
        Math.random = Math.random;
    }
});

test("não realiza entrega sem combustível suficiente", () => {
    const estado = criarEstadoInicial();
    estado.combustivel = 5;

    const resultado = entregarPizza(estado);

    assert.equal(resultado.sucesso, false);
    assert.equal(estado.combustivel, 5);
    assert.equal(estado.entregasRealizadas, 0);
});

test("impede entregas após completar cinco", () => {
    const estado = criarEstadoInicial();
    estado.entregasRealizadas = 5;

    const resultado = entregarPizza(estado);

    assert.equal(resultado.sucesso, false);
    assert.equal(estado.entregasRealizadas, 5);
});
