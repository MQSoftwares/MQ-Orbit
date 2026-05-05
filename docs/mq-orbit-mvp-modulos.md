# MQ Orbit MVP de Módulos

Este bloco adiciona uma base navegável para os módulos operacionais da MQ Orbit, reaproveitando o shell atual do projeto e mantendo os dados em mock local.

## Módulos criados

- Kanban
- Administrativo
- Finanças
- Arquivos
- Design
- Marketing

## Rotas principais

- `/kanban`
- `/kanban/quadros`
- `/kanban/backlog`
- `/kanban/minhas-tarefas`
- `/kanban/sprints`
- `/kanban/etiquetas`
- `/administrativo`
- `/administrativo/equipe`
- `/administrativo/clientes`
- `/administrativo/contratos`
- `/administrativo/processos`
- `/administrativo/documentos`
- `/administrativo/permissoes`
- `/financas`
- `/financas/fluxo-de-caixa`
- `/financas/contas-a-pagar`
- `/financas/contas-a-receber`
- `/financas/assinaturas`
- `/financas/centros-de-custo`
- `/financas/relatorios`
- `/arquivos`
- `/arquivos/explorador`
- `/arquivos/recentes`
- `/arquivos/compartilhados`
- `/arquivos/favoritos`
- `/arquivos/lixeira`
- `/design`
- `/design/projetos`
- `/design/briefings`
- `/design/assets`
- `/design/templates`
- `/design/aprovacoes`
- `/design/referencias`
- `/marketing`
- `/marketing/campanhas`
- `/marketing/calendario-editorial`
- `/marketing/leads`
- `/marketing/landing-pages`
- `/marketing/metricas`
- `/marketing/automacoes`

## Estrutura de rotas

- Cada módulo possui uma página raiz em `src/app/<modulo>/page.tsx`
- Cada subpágina agora tem seu próprio `src/app/<modulo>/<slug>/page.tsx`
- Os antigos `src/app/<modulo>/[subpage]/page.tsx` ficaram apenas como fallback de `notFound()`
- A visão geral é sempre a própria página raiz do módulo, sem slug dedicado
- A navegação mantém os mesmos slugs usados na sidebar, sem camada extra de dispatch interno

## Entidades mockadas

- Kanban: board, task, sprint, tag
- Administrativo: employee, client, contract, process, document
- Finanças: financialEntry, payable, receivable, subscription, costCenter, reportPreset
- Arquivos: folder, fileItem, fileOwner, filePermission, fileCategory
- Design: designProject, briefing, asset, template, approval, referenceBoard
- Marketing: campaign, contentItem, lead, landingPage, metricSnapshot, automationFlow

## O que está mockado

- Status e filtros operam em memória
- Mudança de coluna no Kanban ocorre sem backend
- Pagamentos podem ser marcados como pagos apenas no estado local
- Explorer de arquivos alterna entre grid e lista
- Aprovações e leads avançam estágios localmente
- Matriz de permissões é visual e não persiste
- A hierarquia de rotas é explícita no App Router, no mesmo padrão da Agenda

## Próximos passos sugeridos

- Refinar a densidade visual página por página
- Consolidar componentes realmente reutilizáveis, sem exagero de abstração
- Conectar backend apenas depois que a navegação e a hierarquia estiverem fechadas
- Trocar os mocks por dados reais módulo a módulo, mantendo os layouts
