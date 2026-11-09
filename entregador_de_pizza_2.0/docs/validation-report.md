# Relatório de Validação e Regressão — Entregador de Pizza 2.0

**Branch:** `test/regression-suite`  
**Data:** 2026-11-09  
**Responsável:** Leo Rios (QA)

---

## 1. Execução dos Testes Automatizados

**Comando:** `npm test`  
**Resultado:** ✅ **68 testes aprovados, 0 falhas**

| Arquivo de Teste | Testes | Resultado |
| :--- | :---: | :---: |
| `deliveries.test.js` | 12 | ✅ Pass |
| `fuel.test.js` | 10 | ✅ Pass |
| `game.test.js` | 15 | ✅ Pass |
| `menu.test.js` | 17 | ✅ Pass |
| `statistics.test.js` | 14 | ✅ Pass |
| **Total** | **68** | **✅ 100%** |

---

## 2. Validação Manual dos Principais Cenários

### Cenário 1: Partida completa com vitória
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Iniciar o jogo (`npm start`) | Menu exibido com status inicial (0/5 entregas, 100/100 combustível) | Conforme | ✅ |
| 2 | Escolher opção `1` (Entregar) 5 vezes | Entregas incrementam, combustível deduzido, vitória ao completar 5 | Conforme | ✅ |
| 3 | Verificar resumo final | Exibe "Parabéns! Concluíste todas as entregas!" com estatísticas corretas | Conforme | ✅ |

### Cenário 2: Saída antecipada (desistência)
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Fazer 2 entregas | Contador em 2/5 | Conforme | ✅ |
| 2 | Escolher opção `3` (Sair) | Partida encerra com resultado "desistencia" | Conforme | ✅ |
| 3 | Verificar resumo | "Partida terminada sem concluir o objetivo." com entregas = 2/5 | Conforme | ✅ |

### Cenário 3: Combustível insuficiente
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Realizar entregas até combustível ficar baixo | Combustível deduzido corretamente | Conforme | ✅ |
| 2 | Tentar entregar com combustível < gasto sorteado | Mensagem "Combustível insuficiente.", contador e combustível inalterados | Conforme | ✅ |
| 3 | Abastecer e tentar novamente | Combustível recupera até +20, entrega válida se combustível >= gasto | Conforme | ✅ |

### Cenário 4: Abastecimento no limite
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Com tanque em 90, abastecer | Recupera apenas 10 unidades (teto de 100) | Conforme | ✅ |
| 2 | Com tanque em 100, abastecer | "O depósito já está cheio.", sem alteração | Conforme | ✅ |

### Cenário 5: Entradas inválidas
| Passo | Ação | Resultado Esperado | Resultado Obtido | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Digitar "abc", "0", "4", "", espaços | Mensagem "Opção inválida. Escolhe 1, 2 ou 3." | Conforme | ✅ |
| 2 | Verificar que o jogo continua ativo | Estado inalterado, menu reaparece | Conforme | ✅ |

---

## 3. Defeitos Identificados (Análise de Código)

### BUG-001 — Dependência fantasma `start` no package.json
- **Severidade:** Baixa
- **Arquivo:** `package.json`
- **Descrição:** O pacote `start@^5.1.0` está listado como dependência. Ele é um pacote deprecado que não é utilizado em nenhum módulo do projeto. Provavelmente foi instalado por engano ao executar `npm i start` em vez de `npm start`.
- **Passos para reproduzir:**
  1. Abrir `entregador_de_pizza_2.0/package.json`
  2. Observar `"start": "^5.1.0"` em `dependencies`
  3. Pesquisar por `import` ou `require` de `start` nos arquivos `src/` — nenhuma ocorrência encontrada
- **Impacto:** Aumenta o tamanho do `node_modules` sem necessidade. O npm exibe warning de deprecation durante `npm install`.
- **Correção sugerida:** `npm uninstall start`
- **Status:** 📋 Documentado

### BUG-002 — Encoding UTF-16LE no README.md raiz
- **Severidade:** Baixa
- **Arquivo:** `README.md`
- **Descrição:** O arquivo README.md na raiz do repositório está codificado em UTF-16LE em vez de UTF-8. Isso causa exibição de caracteres corrompidos (mojibake) em editores, ferramentas CLI e na visualização do GitHub.
- **Passos para reproduzir:**
  1. Executar `file README.md` ou tentar ler o arquivo com ferramentas padrão UTF-8
  2. Observar caracteres como `Vers�o`, `Descri�o`, `L�der` em vez dos acentos corretos
- **Impacto:** Documentação ilegível no GitHub e em editores sem detecção automática de encoding.
- **Correção sugerida:** Converter o arquivo para UTF-8: `Get-Content README.md | Set-Content -Encoding utf8 README.md`
- **Status:** 📋 Documentado

### BUG-003 — `deliveries.js` não verifica condição de vitória
- **Severidade:** Informativa (por design)
- **Arquivo:** `src/deliveries.js`
- **Descrição:** A função `entregarPizza()` em `deliveries.js` incrementa o contador de entregas mas **não** transiciona o estado para vitória. Essa responsabilidade é delegada a `game.js` via `verificarVitoria()`, que é chamada dentro de `processarAcao()`.
- **Impacto:** Se `entregarPizza()` for chamada diretamente (fora de `processarAcao`), a 5ª entrega não encerrará a partida automaticamente. Isto é o comportamento esperado conforme o comentário JSDoc no código, mas é um risco caso um novo módulo chame `entregarPizza()` diretamente.
- **Status:** ℹ️ Por design — documentado para conhecimento da equipe

---

## 4. Cobertura de Cenários por Módulo

| Módulo | Cenários Cobertos | Lacunas Identificadas |
| :--- | :--- | :--- |
| `config.js` | Constantes utilizadas via referência em todos os testes | Nenhuma |
| `gameState.js` | Inicialização validada em múltiplos testes | Nenhuma |
| `deliveries.js` | Sorteio, entrega válida, falha por combustível, bloqueio pós-meta, progressão | Nenhuma |
| `fuel.js` | Depósito vazio, cheio, parcial, limite máximo, partida encerrada, valores anômalos | Nenhuma |
| `game.js` | Opção inválida, saída antecipada, vitória, bloqueio pós-encerramento, fluxo completo | Nenhuma |
| `menu.js` | Sanitização, validação, formatação de status/resultado/resumo, I/O | Nenhuma |
| `statistics.js` | Extração, cálculo, formatação, imutabilidade, valores nulos, integração | Nenhuma |

---

## 5. Conclusão

| Critério de Aceitação | Status |
| :--- | :---: |
| Todos os testes obrigatórios passam | ✅ |
| Bugs críticos estão corrigidos ou documentados | ✅ (nenhum bug crítico — 2 baixos e 1 informativo documentados) |
| Resultados da validação ficam registados | ✅ (este documento) |

**Veredicto: ✅ A versão integrada está aprovada para merge.** Os defeitos encontrados são de severidade baixa e não bloqueiam a entrega.
