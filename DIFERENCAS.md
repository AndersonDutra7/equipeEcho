# 🍕 Comparativo: Versão Legada (1.0) vs. Versão Expandida (2.0)

Este documento detalha todas as diferenças arquiteturais, funcionais, conceituais e de qualidade entre a versão original (**Código Legado 1.0**) e a versão atual (**Entregador de Pizza 2.0**).

---

## 📊 1. Resumo Comparativo Rápido

| Característica / Dimensão | Versão Legada (1.0) | Versão Expandida (2.0) |
| :--- | :--- | :--- |
| **Estrutura de Arquivos** | Monolítico (1 arquivo de 90 linhas) | Modular desacoplado (8 módulos especializados) |
| **Padrão Arquitetural** | Script procedural imperativo | Separação de Responsabilidades (SRP) / Camadas |
| **Gerenciamento de Estado** | Variáveis globais mutáveis dispersas | Objeto de estado imutável/centralizado (`gameState.js`) |
| **Configurações do Jogo** | Valores mágicos (*magic numbers*) no código | Módulo centralizado e imutável (`config.js`) |
| **Sistema Financeiro** | ❌ Inexistente (sem saldo/moeda) | ✅ Saldo em Reais (R$), recompensas e custos |
| **Recompensas por Entrega** | ❌ Nenhuma (apenas incrementa contador) | ✅ R$ 20,00 a R$ 50,00 por entrega válida |
| **Custo de Abastecimento** | ❌ Gratuito e infinito | ✅ R$ 1,00 por unidade de combustível recebida |
| **Validação Financeira** | ❌ Não aplicável | ✅ Bloqueio de abastecimento se saldo insuficiente |
| **Abastecimento no Limite** | Lógica básica `if (combustivel > 100)` | Abastecimento proporcional e cálculo exato de custo |
| **Interface e Menu** | Menu fixo sem sanitização de entrada | Interface limpa, sanitização e tolerância a espaços |
| **Tratamento de Entradas** | Apenas `switch default` no loop | Sanitização (`trim`), validação e mensagens amigáveis |
| **Ciclo de Vida da Partida** | `while` travado com `break` ao vencer | Máquina de estados com controle ativo/vitória/desistência |
| **Reinício de Partida** | ❌ Necessário fechar e rodar novamente | ✅ Menu final interativo para jogar novamente |
| **Estatísticas e Resumo** | Apenas mensagem de fim | Resumo completo com entregas, gasto, recargas e saldo |
| **Testes Automatizados** | ❌ 0% de testes automatizados | ✅ 94 testes automatizados com Node Test Runner nativo |
| **Acoplamento com Terminal** | Alto (`readline-sync` acoplado à lógica) | Desacoplado (lógica pura e injeção de dependência) |

---

## 🏗️ 2. Arquitetura e Engenharia de Software

### Versão Legada (`codigo_legado/entregarPizza.js`)
- **Arquivo Único:** Toda a lógica reside em um único script de 90 linhas (`entregarPizza.js`).
- **Estado Global Disperso:** Variáveis mutáveis soltas no escopo global do módulo:
  ```javascript
  let combustivel = 100;
  let entregasRealizadas = 0;
  let totalEntregas = 5;
  ```
- **Forte Acoplamento de I/O:** As funções de negócio chamam diretamente `console.log()` e dependem do loop de terminal para orquestração. Não era viável testar a lógica sem invocar o terminal.
- **Valores "Mágicos":** Números como `100`, `20`, `3`, `5` espalhados pelas funções sem declaração semântica.

### Versão Expandida (`entregador_de_pizza_2.0/src/`)
Adotou princípios de Clean Code e Separação de Responsabilidades (SRP):
- **`config.js`:** Centraliza parâmetros do jogo congelados com `Object.freeze` (capacidade máxima, combustível inicial, custos, recompensas, opções de menu).
- **`gameState.js`:** Fabrica o estado inicial limpo da partida (`criarEstadoInicial`) e implementa a redefinição segura (`reiniciarPartida`).
- **`deliveries.js`:** Módulo exclusivo para regras de entrega, consumo randômico e distribuição de recompensas financeiras.
- **`fuel.js`:** Módulo de gestão de combustível, cálculo proporcional de abastecimento e regras econômicas de recarga.
- **`statistics.js`:** Função pura de extração de estatísticas e formatação do resumo final, livre de efeitos colaterais.
- **`menu.js`:** Camada exclusiva de apresentação e I/O com sanitização de strings e menus formatados.
- **`game.js`:** Orquestrador principal da máquina de estados (vitória, desistência, continuidade), permitindo injeção de leitor para automação de testes.
- **`index.js`:** Ponto de entrada enxuto (apenas 3 linhas) que inicializa o ciclo.

---

## 💰 3. Sistema Econômico e Novas Regras de Negócio

### O que mudou nas Entregas:
1. **No Legado:** Cada entrega consumia aleatoriamente 10, 20 ou 30 de combustível. Ao final de cada entrega, apenas incrementava o contador numérico `entregasRealizadas++`.
2. **No 2.0:** Além da dedução do combustível, cada entrega bem-sucedida gera uma **recompensa financeira aleatória entre R$ 20,00 e R$ 50,00**, que é adicionada ao saldo da carteira do jogador. Entregas recusadas por falta de combustível não pagam recompensa e não consomem combustível.

### O que mudou no Abastecimento:
1. **No Legado:** O abastecimento era gratuito e infinito. O jogador podia selecionar a opção `2` indefinidamente para recuperar +20 de combustível, mesmo que estivesse com tanque cheio.
2. **No 2.0:** O combustível custa **R$ 1,00 por unidade**. O jogador só consegue abastecer se possuir saldo em dinheiro acumulado com entregas:
   - Se o tanque precisar de 20 unidades e o jogador tiver saldo, custa R$ 20,00.
   - Se o tanque estiver em 95 unidades, o abastecimento parcial recupera apenas 5 unidades e cobra R$ 5,00 (não cobra o valor cheio).
   - Se o jogador tiver saldo menor que o custo necessário, a transação é recusada e o saldo permanece intacto.
   - Abastecer com o tanque em 100 exibe mensagem amigável de que o depósito já está cheio, sem cobrar nada.

---

## 🎮 4. Ciclo de Vida da Partida e Experiência do Usuário (UX)

### Finalização e Reinício:
- **No Legado:** Quando o jogador atingia 5 entregas, o script imprimia uma linha e finalizava abruptamente a execução. Para jogar novamente, era necessário rodar o comando no terminal mais uma vez.
- **No 2.0:** O jogo detecta o término e abre o **Menu Final**, permitindo:
  - `[1] Jogar novamente` (ou digitando "sim", "s", "y"): Reinicia todo o estado (combustível volta a 100, contadores e saldo zerados) sem encerrar o processo.
  - `[2] Sair`: Encerra o jogo formalmente com agradecimento.

### Resumo Estatístico:
- **No Legado:** Não havia resumo final, nem histórico de consumo ou de abastecimentos.
- **No 2.0:** Apresenta um painel completo com:
  - Total de entregas realizadas vs. meta.
  - Total de combustível gasto em entregas.
  - Quantidade de vezes em que a moto foi abastecida.
  - Saldo final da carteira em R$.
  - Mensagem de distinção entre vitória e desistência antecipada.

### Resiliência a Erros de Digitação:
- **No Legado:** Qualquer caractere diferente de 1, 2 ou 3 apenas caía no `default` com uma mensagem crua. Entradas com espaços (ex: `" 1 "`) falhavam como inválidas.
- **No 2.0:** Sanitiza entradas (`trim()`), aceita espaços acidentais, suporta maiúsculas/minúsculas e impede travamento do console por entradas nulas ou inesperadas.

---

## 🧪 5. Testabilidade e Qualidade de Código

| Métrica de Qualidade | Versão Legada (1.0) | Versão Expandida (2.0) |
| :--- | :--- | :--- |
| **Cobertura de Testes** | 0 testes | 94 testes automatizados |
| **Framework de Teste** | Nenhum | Node.js Test Runner nativo (`node:test`) |
| **Isolamento de Aleatoriedade** | Impossível (chamadas diretas a `Math.random`) | Testes usam mocks determinísticos de aleatoriedade |
| **Injeção de Dependências** | Nenhuma | Leitor (`leitor`) e escritor (`escritor`) injetáveis |
| **Casos de Teste de Borda** | Não testados | Depósito vazio, teto de 100, saldo exato, saldo zero, saídas |

---

## 📁 6. Tabela de Correspondência de Arquivos

```text
codigo_legado/
└── entregarPizza.js              <-- Tudo em 90 linhas

entregador_de_pizza_2.0/
├── src/
│   ├── config.js                 <-- Constantes imutáveis e configurações
│   ├── gameState.js              <-- Gestão do estado inicial e reinício
│   ├── deliveries.js             <-- Lógica de consumo e recompensas
│   ├── fuel.js                   <-- Lógica de abastecimento e custos
│   ├── statistics.js             <-- Cálculo de métricas e resumo
│   ├── menu.js                   <-- Interface, sanitização e menus
│   ├── game.js                   <-- Orquestrador do fluxo e regras de encerramento
│   └── index.js                  <-- Executável de entrada
├── tests/
│   ├── deliveries.test.js        <-- Testes de entregas e recompensas
│   ├── fuel.test.js              <-- Testes de combustível e economia
│   ├── game.test.js              <-- Testes de fluxo e reinício de partida
│   ├── menu.test.js              <-- Testes de sanitização e menus
│   └── statistics.test.js        <-- Testes de cálculo e imutabilidade de estatísticas
└── docs/
    ├── regras-do-jogo.md         <-- Regras formais do jogo
    ├── validation-report.md      <-- Relatório de validação e regressão
    └── guia-de-demonstracao.md   <-- Roteiro de demonstração para avaliação
```

---

*Documentação elaborada para a entrega final da Issue #6.*
