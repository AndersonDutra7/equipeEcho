import { criarEstadoInicial } from "./gameState.js";
import { executarMenu } from "./menu.js";

const estado = criarEstadoInicial();

executarMenu(estado);