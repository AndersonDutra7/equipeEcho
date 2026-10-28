# Regras Oficiais — Entregador de Pizza

**Projeto:** Entregador de Pizza  
**Versão:** 1.0 — Proposta para aprovação da equipa  
**Responsável pela definição:** Tech Lead

## 1. Objetivo do jogo

O jogador controla uma moto de entregas e deve entregar cinco pizzas, gerindo o combustível disponível.

O objetivo principal é concluir todas as cinco entregas antes de o jogador decidir sair do jogo.

## 2. Regras de combustível

- O combustível inicial é de 100 unidades.
- A capacidade máxima do depósito é de 100 unidades.
- Cada tentativa de entrega gera um consumo aleatório de 10, 20 ou 30 unidades.
- O consumo só é aplicado quando existe combustível suficiente para realizar a entrega.
- Se o combustível disponível for inferior ao consumo sorteado, a entrega falha e o estado da partida não é alterado.
- Cada abastecimento recupera 20 unidades de combustível.
- O combustível nunca pode ultrapassar 100 unidades.
- Se faltarem menos de 20 unidades para encher o depósito, o abastecimento recupera apenas a quantidade necessária para atingir 100.
- Abastecer com o depósito cheio não altera o combustível.

### Economia do abastecimento

Na versão inicial, o abastecimento é gratuito, mantendo o comportamento do código original.

A introdução de dinheiro e de custos de abastecimento fica pendente de aprovação da equipa e será considerada uma melhoria opcional.

## 3. Regras das entregas

- O objetivo é realizar cinco entregas válidas.
- Cada entrega bem-sucedida aumenta o contador em exatamente uma unidade.
- Uma entrega falhada não aumenta o contador.
- Não é possível realizar entregas depois de concluir o objetivo.
- O contador de entregas não pode ser negativo nem ultrapassar cinco.

## 4. Condições de vitória e saída

### Vitória

A partida termina com vitória quando o jogador conclui cinco entregas válidas.

O jogo deve apresentar uma mensagem de sucesso e um resumo final da partida.

### Saída antecipada

O jogador pode selecionar a opção de sair a qualquer momento.

Nesse caso, a partida termina sem ser considerada uma vitória, mesmo que já tenham sido realizadas algumas entregas.

### Combustível insuficiente

A falta de combustível não termina automaticamente a partida, porque o jogador pode abastecer gratuitamente.

A tentativa de entrega deve ser recusada e o jogador deve poder escolher outra ação.

## 5. Menu do jogo

O menu principal disponibiliza as seguintes opções:

1. Entregar pizza.
2. Abastecer moto.
3. Sair do jogo.

Entradas inválidas devem apresentar uma mensagem de erro sem encerrar inesperadamente o programa.

Depois de cada ação, o menu deve apresentar o estado atualizado da partida enquanto o jogo estiver ativo.

## 6. Estado da partida

O estado da partida deve conter, no mínimo:

- `combustivel`: combustível disponível.
- `entregasRealizadas`: quantidade de entregas concluídas.
- `combustivelGasto`: total de combustível consumido em entregas bem-sucedidas.
- `abastecimentos`: número de operações de abastecimento efetuadas.
- `ativo`: indica se a partida continua em execução.

Os valores de configuração, como o combustível inicial, a capacidade máxima e o total de entregas, devem ficar centralizados num módulo de configuração.

O estado só pode ser alterado através das operações definidas pela lógica do jogo.

## 7. Estrutura de módulos

A estrutura proposta é:

```text
src/
├── config.js
├── game.js
├── deliveries.js
├── fuel.js
├── statistics.js
└── menu.js

tests/
├── deliveries.test.js
├── fuel.test.js
└── statistics.test.js

docs/
└── regras-do-jogo.md

README.md
package.json
```

### Responsabilidades

**`config.js`**
- Definir os valores configuráveis do jogo.
- Centralizar o combustível inicial, a capacidade máxima, o consumo possível e o total de entregas.

**`game.js`**
- Inicializar e coordenar a partida.
- Controlar o estado ativo e as condições de vitória e saída.
- Coordenar as operações dos restantes módulos.

**`deliveries.js`**
- Sortear o consumo de combustível de uma entrega.
- Validar se existe combustível suficiente.
- Aplicar as regras de conclusão das entregas.
- Atualizar o progresso após uma entrega bem-sucedida.

**`fuel.js`**
- Gerir o combustível disponível.
- Validar e executar abastecimentos.
- Garantir que o combustível respeita os limites definidos.

**`statistics.js`**
- Calcular e apresentar os dados estatísticos da partida.
- Disponibilizar os dados para o resumo final.

**`menu.js`**
- Apresentar as opções disponíveis.
- Ler e validar a entrada do utilizador.
- Apresentar mensagens e resultados das operações.

**`tests/`**
- Conter testes automatizados das regras de negócio.
- Verificar limites, operações válidas e operações inválidas.

## 8. Contratos entre módulos

Os módulos devem comunicar através de funções com responsabilidades claras.

- `config.js` disponibiliza os valores de configuração aos outros módulos.
- `deliveries.js` recebe ou consulta o estado necessário para validar uma entrega e devolve o resultado da operação.
- `fuel.js` recebe os dados necessários para calcular um abastecimento e devolve o resultado e o novo combustível.
- `statistics.js` consulta os dados da partida e disponibiliza estatísticas sem alterar o estado do jogo.
- `menu.js` solicita ações e apresenta resultados, sem implementar regras de negócio.
- `game.js` coordena as operações e determina quando a partida termina.

Sempre que possível, as funções de negócio devem ser independentes do terminal e da leitura de teclado, para permitir testes automatizados.

Os contratos concretos das funções e os seus parâmetros devem ser acordados pela equipa antes do desenvolvimento paralelo.

## 9. Pontuação e economia

A versão inicial não inclui pontuação nem dinheiro.

Estas funcionalidades são opcionais e só devem avançar depois de aprovadas pela equipa.

Se forem aprovadas, a equipa deverá definir:
- A recompensa por cada entrega.
- A existência de bónus por conclusão.
- O custo do combustível.
- O comportamento quando o jogador não tiver dinheiro suficiente.

A introdução destas regras não deve alterar as condições fundamentais de vitória sem uma decisão explícita da equipa.

## 10. Critérios de qualidade

- O combustível nunca pode ultrapassar os limites definidos.
- O contador de entregas nunca pode ultrapassar o objetivo.
- Uma operação inválida não pode alterar indevidamente o estado.
- A lógica de negócio deve estar separada da interface.
- As regras principais devem possuir testes automatizados.
- As alterações devem ser integradas através de Pull Requests revistos.

## 11. Processo de aprovação

Antes de começar a implementação paralela, os quatro integrantes devem rever este documento.

Qualquer alteração às regras deve ser discutida, documentada e aprovada pela equipa.

A implementação deve respeitar esta versão aprovada, salvo quando uma alteração posterior for formalmente aceite.

## 12. Critérios de aceitação desta documentação

- As regras de vitória e saída estão definidas.
- O consumo e o abastecimento estão documentados.
- A estrutura de módulos está definida.
- As responsabilidades dos módulos estão identificadas.
- Os contratos entre módulos estão descritos.
- A equipa aprovou as regras antes da implementação.
