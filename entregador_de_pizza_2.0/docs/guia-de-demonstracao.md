# 🎬 Roteiro de Demonstração — Entregador de Pizza 2.0

**Projeto:** Entregador de Pizza 2.0  
**Equipe:** Equipe Echo  
**Objetivo:** Guia prático passo a passo para demonstração e avaliação pela equipe docente.

---

## 📋 1. Checklist Pré-Apresentação

Antes de iniciar a apresentação com os avaliadores, garanta que:
- [ ] O Node.js (versão 18 ou superior) está instalado: `node -v`
- [ ] O terminal está aberto na pasta `entregador_de_pizza_2.0/`
- [ ] As dependências estão instaladas: `npm install`
- [ ] Os testes foram executados previamente com sucesso: `npm test`

---

## ⏱️ 2. Roteiro da Demonstração (Duração estimada: 5 a 8 minutos)

### Etapa 1: Apresentação Geral e Arquitetura (1 min)
1. Explicar brevemente o projeto:
   > *"O Entregador de Pizza 2.0 é a evolução de um código legado monolítico de 90 linhas para uma aplicação modular, testável e com regras econômicas completas. O objetivo do jogador é realizar 5 entregas de pizza gerenciando seu combustível e seu saldo em dinheiro."*
2. Destacar a separação em camadas em `src/`:
   - Configurações e Estado (`config.js`, `gameState.js`)
   - Lógica de Domínio (`deliveries.js`, `fuel.js`)
   - Apresentação e I/O (`menu.js`, `statistics.js`)
   - Orquestrador e Máquina de Estados (`game.js`)

---

### Etapa 2: Execução dos Testes Automatizados (1 min)
Mostre a confiabilidade e robustez do código executando os testes nativos:
```bash
npm test
```
**O que destacar:**
- Execução rápida com o **Node Test Runner** nativo (`node:test`).
- **94 testes automatizados** divididos em 5 suítes (`deliveries`, `fuel`, `game`, `menu`, `statistics`).
- **100% de taxa de aprovação**, cobrindo limites de depósito, saldo insuficiente, vitórias, desistências e injeção de leitor.

---

### Etapa 3: Demonstração Interativa do Jogo (3 a 4 min)

Inicie o jogo:
```bash
npm start
```

#### Passo 3.1: Interface Inicial
- Mostre o cabeçalho formatado:
  - Entregas: `0/5`
  - Combustível: `100/100`
  - Saldo: `R$ 0.00`
  - Preço do combustível: `R$ 1.00 por unidade`

#### Passo 3.2: Realizar Entregas e Ganhar Dinheiro
- Digite `1` e pressione `Enter`.
- Mostre a mensagem de entrega bem-sucedida, indicando:
  - O combustível consumido (10, 20 ou 30 unidades).
  - A recompensa financeira gerada (entre R$ 20,00 e R$ 50,00).
  - A atualização imediata do saldo em conta.
- Faça mais 1 ou 2 entregas digitando `1`.

#### Passo 3.3: Demonstrar o Sistema Econômico e Abastecimento
- Quando o combustível estiver abaixo de 80, selecione a opção `2` (Abastecer moto).
- Mostre que o abastecimento:
  - Recupera até 20 unidades de combustível.
  - Deduz exatamente R$ 1,00 por litro recuperado do saldo do jogador.
  - Nunca ultrapassa a capacidade máxima de 100 unidades.
- *(Opcional)* Se o combustível estiver em 90 ou 95, abasteça para demonstrar o **abastecimento parcial**: o jogo recupera apenas o que cabe no tanque e cobra o valor proporcional exato (ex: 5 litros = R$ 5,00).

#### Passo 3.4: Demonstrar Resiliência e Validação de Entrada
- Digite uma opção inválida com espaços ou letras (ex: `"  9  "` ou `"abc"`).
- Mostre que o jogo não quebra: exibe a mensagem de erro amigável e reapresenta o menu sem perder o estado da partida.

#### Passo 3.5: Vitória e Resumo Final
- Continue realizando entregas (opção `1`, abastecendo se necessário) até completar as **5 entregas**.
- Observe a tela de vitória:
  - Mensagem comemorativa: *"Parabéns! Concluíste todas as entregas!"*.
  - Painel com resumo detalhado: Entregas realizadas, total de combustível gasto, total de abastecimentos e saldo final.

#### Passo 3.6: Opção de Reiniciar Partida (Feature Nova)
- No **Menu Final**, demonstre as opções `[1] Jogar novamente` e `[2] Sair`.
- Digite `1` (ou `"sim"`).
- Mostre que uma nova partida é iniciada com o estado perfeitamente limpo (0 entregas, 100 de combustível, R$ 0.00 de saldo, contadores zerados).
- Digite `3` para demonstrar a saída limpa por desistência antecipada.

---

### Etapa 4: Comparativo com o Código Legado (1 min)
Se solicitado pela banca, mostre o arquivo `codigo_legado/entregarPizza.js` ou execute-o:
```bash
node ../codigo_legado/entregarPizza.js
```
Pontue as principais diferenças documentadas em `DIFERENCAS.md`:
1. O legado era um arquivo único procedural sem testes.
2. O legado tinha abastecimento infinito e gratuito sem sistema de saldo.
3. O 2.0 introduziu testes unitários, economia realista, modularização limpa e opção de reiniciar.

---

## 🎯 3. Respostas para Possíveis Perguntas da Banca

| Pergunta da Banca | Resposta Recomendada |
| :--- | :--- |
| **Como foi garantida a testabilidade sem usar libs externas de teste (como Jest)?** | *Utilizamos o Node Test Runner nativo (`node:test` e `node:assert/strict`) disponível a partir do Node 18, reduzindo dependências externas e aumentando o desempenho. Para testar I/O e aleatoriedade, injetamos mocks de `Math.random` e funções de leitura/escrita.* |
| **O que acontece se o jogador ficar sem combustível e sem saldo para abastecer?** | *A tentativa de entrega é recusada sem alterar o estado. Se o jogador não puder mais abastecer nem entregar, ele pode escolher a opção de Sair (opção 3), finalizando como desistência e exibindo o resumo do que conseguiu realizar.* |
| **Por que separar em tantos módulos em `src/`?** | *Para aplicar o Princípio de Responsabilidade Única (SRP). As regras de negócio de combustível e entregas ficaram 100% isoladas de terminal e console, facilitando a manutenção e permitindo cobrir todas as regras de negócio com testes automatizados.* |

---
*Equipe Echo — Roteiro de Validação e Demonstração Final.*
