import rl from 'readline-sync';

let combustivel = 100;
let entregasRealizadas = 0;
let totalEntregas = 5;

function sorteia() {
    let num = Math.floor(Math.random() * 3 + 1) * 10;
    return num;
}

function entregarPizza() {
    let gasto = sorteia();

    if (combustivel >= gasto) {
        combustivel -= gasto;
        entregasRealizadas++;

        console.log(`\nPizza entregue!`);
        console.log(`Combustível gasto: ${gasto}`);
    } else {
        console.log("\nCombustível insuficiente para realizar a entrega!");
    }
}

function abastecerMoto() {
    combustivel += 20;

    if (combustivel > 100) {
        combustivel = 100;
    }

    console.log("\nMoto abastecida!");
}

function mostrarStatus() {
    console.log(
        `\n\n=================================
Objetivo: fazer todas as entregas
=================================`
    );

    console.log(
        `Total de entregas: ${entregasRealizadas}/${totalEntregas}`
    );

    console.log(`Combustível atual: ${combustivel}`);

    console.log(
        `\n=================================
[1] - Entregar Pizza
[2] - Abastecer Moto
[3] - Sair
=================================`
    );
}

function exibir() {
    let opcao = "";

    while (opcao !== "3") {
        mostrarStatus();

        opcao = rl.question("Opção: ");

        switch (opcao) {
            case "1":
                entregarPizza();
                break;

            case "2":
                abastecerMoto();
                break;

            case "3":
                console.log("\nSaindo...");
                break;

            default:
                console.log("\nOpção inválida!");
        }

        if (entregasRealizadas === totalEntregas) {
            console.log("\nTodas as entregas foram realizadas!");
            break;
        }
    }
}

exibir();