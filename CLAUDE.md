# CLAUDE.md — MQ Sistema Interno

## Contexto persistente
Este projeto é um **sistema interno da MQ** construído com **Next.js, React, Tailwind e Motion**. A prioridade é entregar rápido **sem perder controle, consistência, segurança e legibilidade**.

Você deve atuar como copiloto técnico de execução. Não assuma autonomia criativa acima do necessário. O mantenedor do projeto define direção, padrão e decisões finais.

---

## Princípios centrais

### 1. Respeitar identidade visual da MQ
Use o site **mqsoftwares.com.br** como referência visual direta para:
- bordas e arredondamentos
- contraste geral
- acabamento de superfícies
- aparência de cartões e blocos
- sensação de interface premium, sóbria e técnica

**Nunca sair da paleta oficial da MQ.**
Não introduzir novas cores por gosto pessoal. Não usar “quase a mesma cor”. Não inventar nova escala visual fora do conjunto aprovado.

### 2. Respeitar a tipografia do site
Use **somente** a tipografia já utilizada em **mqsoftwares.com.br**.
Não misture outra família.
Não proponha outra fonte.
Não “modernize” a tipografia.

Se a configuração da fonte ainda não existir no projeto:
- não adivinhe
- não aproxime
- solicite aprovação antes de configurar

### 3. Simplicidade acima de abstração
Este projeto não é lugar para excesso de genericidade.
Evite:
- componentes genéricos demais
- camadas artificiais
- abstrações antecipadas
- factories, builders e wrappers sem necessidade
- super arquitetura por “boas práticas de mercado”

Só extraia um componente quando houver ganho real de clareza, manutenção ou reaproveitamento.

**Regra obrigatória:** sempre pedir aprovação antes de criar qualquer componente novo.

### 4. Conteúdo hardcoded para velocidade
Todo texto de página deve ficar **hardcoded no próprio componente**.
Não separar conteúdo em:
- config files
- arquivos de conteúdo
- dicionários
- JSONs
- getters/setters
- CMS
- maps de texto

A meta é produção rápida com controle simples.

### 5. Formulários centralizados
Todo formulário deve obrigatoriamente usar o **componente genérico de formulário já existente/aprovado no projeto**.
Essa camada é a responsável por:
- máscaras
- validações
- padronização de inputs
- feedback visual
- consistência de comportamento

Não contorne essa camada sem autorização explícita.

### 6. Segurança desde a raiz
Assuma que este sistema lida com dados internos sensíveis da empresa.
Logo:
- toda entrada é não confiável
- validação apenas no client nunca é suficiente
- não expor segredos ou dados sensíveis no front
- não logar tokens, payloads sensíveis ou dados internos
- proteger rotas, ações e superfícies por padrão
- preferir a alternativa mais segura quando houver dúvida

### 7. Respeito às decisões já tomadas
Se houver regra de negócio, padrão técnico ou decisão de arquitetura já definida pelo mantenedor:
- siga a decisão
- não substitua por alternativa “melhor” apenas por opinião
- não reabra o tema sem necessidade

Intervenha apenas quando houver:
- risco jurídico/legal/compliance
- vulnerabilidade séria
- dano operacional concreto
- quebra real de segurança

### 8. Consistência com o projeto real
Siga o padrão já existente no repositório.
Não misture estilos incompatíveis.
Não introduza patterns estranhos ao projeto.
Não gere código “quase padronizado”.

Quando houver padrão local, ele vence preferência pessoal do modelo.

---

## Paleta oficial da MQ

### Hex
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

### Política de uso
- Priorizar azuis profundos, cianos, superfícies frias e contraste limpo.
- `#FFA500` é cor de destaque pontual, não base de interface.
- Hover, focus, border, ring, active e disabled devem derivar desta paleta.
- Transparências são permitidas quando derivadas das cores oficiais.
- Não introduzir vermelho/verde/roxo/rosa/outras famílias fora deste conjunto sem aprovação explícita.

---

## Convenções de implementação

### Next.js
Seguir convenções oficiais do framework:
- `app/` ou `src/app/`
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- `route.ts`
- segmentos dinâmicos em `[id]`, `[slug]`, etc.
- `public/` na raiz para assets estáticos
- configs na raiz

### Convenções de nomes
- Componentes React: **PascalCase**
- Hooks: prefixo `use`
- Tipos/interfaces: nomes explícitos do domínio
- Helpers: nomes objetivos e específicos
- Evitar arquivos sem contexto como `utils.ts`, `helpers.ts`, `common.ts` quando isso esconder responsabilidade

### Observação importante
Se o mantenedor decidir outra convenção interna, siga a convenção nova e preserve a consistência do módulo afetado.

---

## Regras operacionais

### Antes de implementar
Cheque:
1. Já existe padrão semelhante?
2. Já existe solução aprovada?
3. Isso é uma abstração desnecessária?
4. O novo componente foi aprovado?
5. O texto precisa mesmo ser externalizado? Neste projeto, normalmente não.

### Ao desenhar páginas
- Priorizar clareza operacional
- Reduzir ruído visual
- Ser consistente com a linguagem do site da MQ
- Garantir estados de loading, erro, vazio e sucesso quando aplicável
- Não sacrificar usabilidade por estética

### Ao mexer com API
- Não presumir payload perfeito
- Tratar falhas, timeout, ausência de dados e formatos inesperados
- Não vazar detalhes internos para o usuário
- Não afrouxar validação para “andar mais rápido”

### Ao mexer com auth
- Não reinventar a autenticação
- Respeitar contratos existentes
- Proteger superfícies por padrão
- Não criar bypass inseguro de sessão, autorização ou validação

---

## Testes obrigatórios

### Responsividade
Toda implementação deve ser validada em:
- mobile
- tablet
- desktop
- larguras maiores quando o layout exigir

### Testes unitários
Toda implementação relevante deve trazer testes proporcionais ao risco, principalmente para:
- lógica de exibição
- condicionais
- formulários
- máscaras
- validações
- componentes reutilizáveis aprovados
- regras críticas

### Testes complementares
Adicionar quando necessário:
- edge cases
- regressão
- falhas de permissão
- stress em componentes/fluxos mais sensíveis

---

## Quando parar e pedir aprovação
Pare e peça aprovação antes de:
- criar componente novo
- adicionar dependência nova
- alterar tipografia
- sair da paleta
- fugir do componente genérico de formulário
- modificar regra de negócio decidida
- introduzir nova abstração estrutural
- relaxar qualquer requisito de segurança

---

## Definição de pronto
Uma implementação só está pronta quando:
- respeita a paleta oficial
- respeita a tipografia do site
- mantém a linguagem visual da MQ
- evita abstrações desnecessárias
- não cria componente novo sem aprovação
- mantém textos hardcoded no componente
- usa a camada oficial de formulários
- segue o padrão do projeto
- segue as convenções do Next.js
- passou por testes de responsividade
- possui testes unitários proporcionais
- mantém postura de segurança forte
