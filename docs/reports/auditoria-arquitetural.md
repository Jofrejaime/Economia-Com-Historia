# Auditoria Arquitetural: Impacto da Ausência de Models Eloquent

Esta auditoria avalia os riscos, limitações e impactos da arquitetura atual do backend (baseada essencialmente em Query Builder `DB::table()`) em comparação com o uso de Models Eloquent do Laravel.

---

## 1. Bugs e Limitações por Ausência de Models
**Classificação:** ⚠️ **Médio**

### Limitações Identificadas:
*   **UUIDs e Timestamps Manuais:** A ausência de Traits nativos (como o trait `HasUuids` do Laravel 10+) obriga a aplicação a gerar UUIDs (`Str::uuid()`) e preencher timestamps (`created_at` e `updated_at`) manualmente em cada inserção de banco de dados (ex: em [DocumentController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php) e [QuizController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/QuizController.php)). Isso aumenta a propensão a falhas humanas de esquecimento e dificulta a manutenção caso as regras de auditoria de dados mudem.
*   **Falta de Conversão Automática de Tipos (Casting):** O Query Builder do Laravel retorna colunas numéricas (como contadores e inteiros) ou booleanos diretamente do driver de banco de dados, frequentemente como strings (dependendo do driver MySQL configurado). Sem a propriedade `$casts` do Eloquent (por exemplo, `is_correct => 'boolean'`), o frontend pode receber tipos de dados inconsistentes (ex: `"1"` em vez de `true`), gerando bugs de interface.
*   **Regras de Negócio Espalhadas:** Funções e regras de negócio do modelo de domínio (como verificar se um acesso está ativo, formatar uma citação académica ou calcular pontuações) ficam dispersas em controllers procedimentais ou serviços, em vez de encapsuladas no próprio modelo correspondente.

---

## 2. Queries Duplicadas que seriam Simplificadas
**Classificação:** 🟠 **Alto**

### Duplicações Identificadas:
*   **Listagens e Métodos de Detalhe de Documentos:** Em [DocumentController.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php), o mesmo bloco complexo com múltiplos `leftJoin` (unindo tabelas `document_categories`, `access_levels`, `user_profiles`) é repetido de forma quase idêntica nos métodos [index](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php#L28-L77), [search](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php#L79-L119) e no método auxiliar [findDocument](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php#L490-L510).
*   Com o Eloquent, esse comportamento seria centralizado através de relacionamentos ou de um Query Scope (por exemplo, `scopeWithCategoryAndAccess(...)`), mantendo o código DRY (Don't Repeat Yourself).

---

## 3. Relacionamentos Reimplementados Manualmente
**Classificação:** 🔴 **Crítico**

### Reimplementações Identificadas:
*   **Gerenciamento Many-to-Many de Tags:** O relacionamento entre documentos e tags em [DocumentController::store](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php#L201-L236) exige a busca procedural de slugs, inserção condicional de tags novas no banco de dados e subsequente vinculação manual na tabela pivot `document_tags`. O Eloquent simplificaria isto a uma única linha de código utilizando `$document->tags()->sync($tagIds)`.
*   **Queries Manuais para Obtenção de Relações:** No método [show](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/app/Http/Controllers/Api/DocumentController.php#L121-L173), as tags de um documento precisam ser consultadas manualmente com `DB::table('document_tags as dt')->join(...)` para compor o JSON de retorno. Relacionamentos complexos em Quiz (Attempt -> Answers -> Questions -> Options) também são resolvidos em cascata de forma puramente procedural.

---

## 4. Manutenção e Testabilidade Prejudicadas
**Classificação:** ⚠️ **Médio**

### Impactos em Manutenção e Testes:
*   **Duplicação nos Testes (Seeds Manuais):** Nos testes (como em [QuizGamificationTest.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/tests/Feature/QuizGamificationTest.php) e [DocumentAccessTest.php](file:///c:/Users/BeeFlex%20Studio/Documents/ISPTEC/3%20%C2%BA%20ano/2%C2%BA%20Semestre/ESII/Economia-Com-Historia/backend/tests/Feature/DocumentAccessTest.php)), os métodos auxiliares `seedQuiz()` e `seedPublishedDocument()` precisam efetuar inserções brutas via `DB::table(...)->insert(...)` contendo UUIDs e timestamps explícitos. Não é possível usufruir de Factories Eloquent para gerar dados fakes de forma limpa, inchando os arquivos de teste.
*   **Acoplamento Forte de Banco de Dados:** Qualquer alteração simples no schema (renomear uma coluna ou tabela) exigirá buscas globais no projeto para alterar strings de queries manuais. Nos controllers, não há barreira de abstração, gerando um forte acoplamento com a estrutura exata do MySQL.

---

## 5. Viabilidade de Conclusão do MVP com a Arquitetura Atual
**Classificação:** 🟢 **Baixo Risco (Curto Prazo) / Altamente Recomendável**

### Análise de Viabilidade:
*   **Segurança no Curto Prazo:** **Sim, é seguro e altamente recomendável manter a arquitetura atual para a entrega do MVP.** O sistema atual possui uma suíte de testes de integração rodando e passando com **100% de sucesso** (66 testes cobrindo todas as rotas e regras de negócio existentes).
*   **Risco de Refatoração no MVP:** Reescrever a API inteira para utilizar Eloquent nesta fase do projeto introduziria um **risco altíssimo de regressão**, bugs e atrasos significativos na entrega final do MVP.
*   **Estratégia Recomendada:** 
    1.  Concluir o MVP estabilizando as pontas soltas usando `DB::table()` para garantir a entrega rápida e sem riscos.
    2.  Planejar a refatoração de Query Builder para Eloquent Models (criação de Models, relacionamentos e factories) como o **item prioritário da Fase 2 (Pós-MVP)** de escalabilidade e manutenção da aplicação.
