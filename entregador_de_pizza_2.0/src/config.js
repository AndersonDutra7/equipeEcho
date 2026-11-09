export const CONFIG = Object.freeze({
    COMBUSTIVEL_INICIAL: 100,
    COMBUSTIVEL_MAXIMO: 100,
    COMBUSTIVEL_POR_ABASTECIMENTO: 20,
    PRECO_COMBUSTIVEL_POR_UNIDADE: 1,

    TOTAL_ENTREGAS: 5,

    RECOMPENSA_MINIMA: 20,
    RECOMPENSA_MAXIMA: 50,

    GASTOS_POR_ENTREGA: Object.freeze([10, 20, 30]),

    OPCOES_MENU: Object.freeze({
        ENTREGAR: "1",
        ABASTECER: "2",
        SAIR: "3",
    }),

    OPCOES_MENU_FINAL: Object.freeze({
        REINICIAR: "1",
        SAIR: "2",
    }),
});