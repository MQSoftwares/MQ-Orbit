# AGENTS.md — MQ Sistema Interno

## Objetivo do agente
Ajudar a construir o sistema interno da MQ com **velocidade, consistência visual, segurança e baixo acoplamento desnecessário**. O projeto será feito em **Next.js + React + Tailwind + Motion**. O agente deve acelerar a execução sem assumir o controle do projeto.

## Prioridade de decisão
Em caso de conflito, siga esta ordem:
1. Regras explícitas deste arquivo
2. Padrões já existentes no repositório
3. Convenções oficiais do Next.js
4. Preferências pessoais do agente

Nunca troque a ordem acima por opinião própria.

---

## Regras inegociáveis

### 1) Design e identidade visual
- **Nunca saia da paleta oficial da MQ.**
- Não introduza cores “parecidas”, tons arbitrários, gradientes novos, ou escalas que não derivem desta paleta.
- É permitido usar transparência/opacidade derivada das cores oficiais, desde que a cor-base seja uma das aprovadas.
- Use o site **mqsoftwares.com.br** como referência visual para:
  - linguagem visual geral
  - bordas e arredondamentos
  - sensação de contraste
  - aparência de cartões, blocos e superfícies
  - sobriedade e acabamento

### 2) Tipografia
- Use **exatamente a mesma tipografia do site mqsoftwares.com.br**.
- **Não invente**, substitua, aproxime ou misture outra fonte.
- Se o repositório já possuir a configuração da fonte, **reutilize exatamente a mesma configuração**.
- Se a fonte ainda não estiver configurada neste projeto, **pare e peça aprovação antes de configurar**.
- O sistema deve trabalhar com **uma única família tipográfica principal**, igual à do site.

### 3) Componentização com freio
- Este projeto **não deve virar um laboratório de abstrações**.
- Não criar componentes genéricos “por precaução”.
- Não criar wrappers, factories, builders, render abstractions ou camadas extras sem necessidade real.
- Só extraia um componente quando houver ganho claro de leitura, manutenção ou reaproveitamento real.
- **Antes de criar qualquer componente novo, peça aprovação.**
- Se a solução puder ser resolvida com boa organização local dentro da página/feature, prefira isso.

### 4) Textos hardcoded
- Todo texto de página deve ficar **hardcoded no próprio componente**.
- Não separar conteúdo em arquivos externos, mapas de conteúdo, dicionários, CMS, config objects, JSONs de texto, getters, setters ou camadas de conteúdo.
- O foco do projeto é **velocidade e simplicidade operacional**.

### 5) Formulários
- Todo formulário deve passar pelo **componente genérico de formulário já definido no projeto**.
- Não criar formulários “na mão” fora desse padrão, salvo autorização explícita.
- Máscaras, validações, comportamento de erro e padronização de input devem estar centralizados nessa camada.
- Se um input novo exigir comportamento especial, adaptar a camada de formulário existente ou pedir aprovação antes de criar exceção.

### 6) Segurança
- Todo componente e fluxo devem nascer com postura de **segurança por padrão**.
- Trate toda entrada como não confiável.
- Nunca confiar em validação apenas no client.
- Nunca expor segredo, token sensível, lógica sensível ou dado crítico no front.
- Nunca armazenar credenciais ou dados sensíveis em localStorage se houver alternativa segura já definida no projeto.
- Nunca logar tokens, segredos, payloads sensíveis ou dados internos da empresa em console.
- Toda rota protegida deve assumir necessidade de autenticação/autorização explícita.
- Toda renderização de dado dinâmico deve considerar sanitização, escaping e controle de superfície de ataque.
- Qualquer dúvida entre conveniência e segurança: escolha segurança.

### 7) Regras de negócio e arquitetura já decididas
- Quando uma regra de negócio ou decisão de arquitetura já estiver definida pelo mantenedor do projeto, **siga essa decisão mesmo que você considere existir alternativa “melhor”**.
- Não reescreva fluxo, convenção ou organização por preferência técnica pessoal.
- Só intervenha para sinalizar problema quando a decisão:
  - criar risco jurídico/legal/compliance
  - criar vulnerabilidade séria
  - quebrar operação crítica
  - gerar dano concreto ao negócio

### 8) Consistência com o código existente
- Siga o padrão já existente no projeto.
- Não misture estilos de código incompatíveis.
- Não introduza patterns inexistentes só porque são “mais elegantes”.
- Não entregue código “meio padronizado” misturado com código improvisado.
- Se existir padrão local para páginas, hooks, serviços, tipos, testes ou chamadas HTTP, siga o padrão local.

---

## Paleta oficial da MQ

### Cores base
- `#7AD6D3`
- `#0E3A53`
- `#279890`
- `#A4C6E1`
- `#B6D7F7`
- `#F2FEFE`
- `#E2EFFF`
- `#2C77D4`
- `#1D4E76`
- `#0F3A53`
- `#020B25`
- `#1E1B4B`
- `#A9B9C6`
- `#4A5A67`
- `#FFA500`

### Regras de uso da paleta
- Priorize fundos escuros e profundos com contraste claro e acentos frios da marca.
- Use `#FFA500` apenas como cor de destaque pontual/alerta/CTA secundário quando fizer sentido.
- Não invente escala nova de cinzas fora das cores já aprovadas, salvo transparências derivadas.
- Estados visuais (hover, active, disabled, focus, border, ring) devem derivar desta paleta.
- Não usar vermelho, verde, roxo, rosa ou amarelos alternativos fora do conjunto acima, a menos que haja aprovação explícita.

---

## Stack e filosofia de implementação
- Stack principal: **Next.js + React + Tailwind + Motion**.
- Use Motion com moderação e intenção de UX.
- Evite animações decorativas sem função.
- Prefira interfaces rápidas, limpas, legíveis e objetivas.
- O sistema é interno, então produtividade importa, mas **sem relaxar segurança e consistência**.

---

## Convenções de código e organização

### Convenções do Next.js a respeitar
Use as convenções oficiais do framework, salvo ordem expressa em contrário:
- `app/` ou `src/app/` para App Router
- `page.tsx` para páginas
- `layout.tsx` para layouts
- `loading.tsx` para loading UI
- `error.tsx` para error boundary do segmento
- `not-found.tsx` para not found
- `route.ts` para route handlers
- segmentos dinâmicos com `[id]`, `[slug]`, etc.
- `public/` na raiz para assets estáticos
- arquivos de configuração na raiz do projeto

### Convenções internas sugeridas
- Componentes React: **PascalCase**
- Hooks: `useNomeDoHook`
- Funções auxiliares: nome claro e específico
- Tipos/interfaces: nomes explícitos de domínio
- Arquivos de página e convenções especiais do Next: seguir exatamente o nome esperado pelo framework
- Evite nomes genéricos demais como `utils.ts`, `helpers.ts`, `data.ts`, `component.tsx` sem contexto

### Importante
Se o mantenedor decidir alterar qualquer convenção interna, o agente deve:
1. seguir a convenção nova
2. respeitar consistência retroativa do módulo afetado
3. evitar convivência caótica entre padrões antigos e novos

---

## Regras práticas para implementação

### Antes de codar
Sempre verificar:
- já existe padrão semelhante no projeto?
- já existe componente aprovado que resolve isso?
- a necessidade é real ou é abstração prematura?
- o texto precisa mesmo ser externo? (na MQ, normalmente **não**)
- o componente novo foi aprovado?

### Ao criar telas
- Priorizar leitura rápida, clareza operacional e baixo ruído visual
- Textos da página hardcoded no componente
- Responsividade obrigatória
- Estados obrigatórios: carregando, vazio, erro, sucesso, bloqueio por permissão quando aplicável
- Nada de UI “bonita” às custas de clareza operacional

### Ao integrar com API
- Nunca presumir payload perfeito
- Tratar erro, ausência de dados, timeout e estado inesperado
- Validar e tipar entrada/saída conforme o padrão existente no projeto
- Não vazar detalhes internos de erro para o usuário final
- Não enfraquecer validação para “ganhar tempo”

### Ao trabalhar com autenticação/autorização
- Não redesenhar o fluxo de auth sem pedido explícito
- Assumir proteção de rotas e dados por padrão
- Respeitar contratos existentes da API de autenticação
- Não criar atalhos inseguros para facilitar desenvolvimento

---

## Testes obrigatórios

### Responsividade
Toda implementação deve ser validada em múltiplos cenários de viewport, no mínimo:
- mobile
- tablet
- desktop
- widescreen quando a interface exigir

### Testes unitários
- Toda implementação relevante deve vir com testes unitários proporcionais ao risco.
- Testar especialmente:
  - regras de exibição
  - estados de formulário
  - máscaras/validações
  - fluxos críticos
  - condicionais
  - componentes reutilizáveis aprovados

### Testes adicionais
Quando fizer sentido, incluir:
- testes de stress
- testes de edge cases
- testes de regressão
- testes de permissão
- testes de falha/erro

Não pular testes por conveniência sem alinhamento explícito.

---

## Critérios de bloqueio
O agente deve interromper e pedir validação antes de:
- criar novo componente
- introduzir nova abstração
- adicionar nova fonte
- alterar padrão visual da MQ
- criar exceção à camada de formulários
- mudar regra de negócio já decidida
- alterar convenção estrutural do projeto
- introduzir nova dependência sem motivo claro
- afrouxar segurança para “fazer funcionar”

---

## Checklist de entrega
Antes de concluir qualquer task, verificar:
- usa apenas a paleta oficial?
- respeita a tipografia do site?
- segue o padrão visual da MQ?
- evitou abstração desnecessária?
- não criou componente novo sem aprovação?
- textos ficaram hardcoded no componente?
- formulário passou pela camada genérica oficial?
- há postura de segurança adequada?
- segue o padrão do código existente?
- respeita convenções do Next.js?
- passou por testes de responsividade?
- possui testes unitários proporcionais ao risco?

Se qualquer item acima falhar, a task não está pronta.
