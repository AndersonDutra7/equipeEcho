# Relatório de Validação e Regressão — Entregador de Pizza 2.0

**Branch:** `docs/final-delivery`  
**Data:** 2026-11-09  
**Responsável:** Leo Rios (QA & Documentação)

---

## 1. Execução dos Testes Automatizados

**Comando:** `npm test`  
**Resultado:** ✅ **94 testes aprovados, 0 falhas (100% de sucesso)**

| Arquivo de Teste | Testes | Resultado | Cobertura Principal |
| :--- | :---: | :---: | :--- |
| `deliveries.test.js` | 16 | ✅ Pass | Sorteio de consumo, recompensas (R$ 20-50), validação de combustível, bloqueio pós-meta |
| `fuel.test.js` | 13 | ✅ Pass | Depósito cheio/vazio, abastecimento parcial, limite de 100, custos (R$ 1/unid) e saldo |
| `game.test.js` | 19 | ✅ Pass | Fluxo principal, opções inválidas, saída antecipada, vitória e reinício de partida |
| `menu.test.js` | 23 | ✅ Pass | Sanitização de entrada, validação de opções, formatação de status/resultado e menu final |
| `statistics.test.js` | 23 | ✅ Pass | Extração de métricas, formatação de resumo, imutabilidade de estado e persistência |
| **Total** | **94** | **✅ 100%** | **Suíte completa de regras e regressão** |

---

## 2. Validação Manual dos Principais Cenários

### Cenário 1: Partida completa com vitória e recompensas
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Iniciar o jogo (`npm start`) | Menu exibido com status inicial (0/5 entregas, 100/100 combustível, Saldo R$ 0.00) | Conforme | ✅ |
| 2 | Escolher opção `1` (Entregar) 5 vezes | Entregas incrementam, combustível deduzido, recompensas creditadas entre R$ 20 e 50 | Conforme | ✅ |
| 3 | Verificar resumo final | Exibe "Parabéns! Concluíste todas as entregas!" com estatísticas de consumo, recargas e saldo | Conforme | ✅ |
| 4 | Testar Menu Final | Apresenta opções [1] Jogar novamente e [2] Sair | Conforme | ✅ |

### Cenário 2: Abastecimento com economia e saldo
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Realizar entrega e acumular saldo | Saldo positivo registrado | Conforme | ✅ |
| 2 | Abastecer com saldo suficiente | Recupera até +20 litros cobrando R$ 1,00 por litro recebido | Conforme | ✅ |
| 3 | Abastecer com tanque em 95 | Recupera apenas 5 litros e cobra apenas R$ 5,00 | Conforme | ✅ |
| 4 | Abastecer com tanque cheio (100) | Mensagem "O depósito já está cheio.", sem cobrança | Conforme | ✅ |
| 5 | Abastecer sem saldo suficiente | Recusa transação, saldo e combustível inalterados | Conforme | ✅ |

### Cenário 3: Saída antecipada (desistência)
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Fazer 2 entregas | Contador em 2/5 e saldo acumulado | Conforme | ✅ |
| 2 | Escolher opção `3` (Sair) | Partida encerra com resultado "desistencia" | Conforme | ✅ |
| 3 | Verificar resumo | "Partida terminada sem concluir o objetivo." com entregas = 2/5 | Conforme | ✅ |

### Cenário 4: Reinício de partida sem encerrar o processo
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Finalizar partida com vitória | Resumo exibido e prompt do Menu Final aberto | Conforme | ✅ |
| 2 | Digitar `1` ou `"sim"` | Nova partida reiniciada com estado limpo (0 entregas, 100 combustível, R$ 0.00) | Conforme | ✅ |
| 3 | Digitar `2` ou `"sair"` | Jogo finalizado com encerramento gracioso | Conforme | ✅ |

### Cenário 5: Resiliência a entradas inválidas
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Digitar "abc", "0", "4", "", espaços | Mensagem "Opção inválida. Escolhe 1, 2 ou 3." | Conforme | ✅ |
| 2 | Verificar estabilidade | Estado inalterado, menu reaparece sem fechar o terminal | Conforme | ✅ |

---

## 3. Registro e Resolução de Defeitos

### BUG-001 — Dependência fantasma `start` no package.json
- **Severidade:** Baixa
- **Arquivo:** `package.json`
- **Descrição:** O pacote `start@^5.1.0` está em `dependencies`. Não impacta a execução do jogo nem os testes.
- **Status:** ℹ️ Registrado para manutenção futura.

### BUG-002 — Encoding UTF-16LE no README.md raiz
- **Severidade:** Média (afetava visualização e caracteres acentuados no GitHub)
- **Arquivo:** `README.md`
- **Resolução:** Arquivo reescrito e padronizado em **UTF-8 limpo**, garantindo legibilidade perfeita de acentos e formatação no GitHub e editores.
- **Status:** ✅ **Resolvido** na branch `docs/final-delivery`.

### BUG-003 — `deliveries.js` delega verificação de vitória para `game.js`
- **Severidade:** Informativa
- **Status:** ℹ️ Por design — coerente com o padrão de orquestração do jogo.

---

## 4. Conclusão da Validação

| Critério de Aceitação da Entrega | Status |
| :--- | :---: |
| Todos os testes automatizados passam sem erros (94 testes) | ✅ Aprovado |
| Execução manual de ponta a ponta sem falhas | ✅ Aprovado |
| Rastreabilidade de features e commits validada | ✅ Aprovado |
| Documentação de regras, diferenças e roteiro de demo pronta | ✅ Aprovado |

**Veredicto:** 🚀 **Versão 2.0 validada e homologada para entrega final e avaliação docente.**
