# Projeto: Sistema de Vendas com IA

## Objetivo
Criar uma plataforma web onde vários usuários da mesma loja podem acessar um catálogo compartilhado de produtos, registrar vendas manualmente ou colando mensagens de clientes para a IA interpretar os itens do pedido, revisar os itens encontrados e salvar a venda no dashboard da operação.

## Tipo de sistema
Sistema web interno de controle de vendas para uma loja com múltiplos usuários.

## Público
Lojas e equipes de atendimento que vendem por WhatsApp, Instagram, balcão ou atendimento direto e precisam controlar vendas de forma rápida, organizada e com menos digitação manual.

## Problema principal
Hoje os vendedores recebem pedidos em mensagens e depois precisam anotar manualmente produto por produto, o que toma tempo, gera erros e dificulta acompanhar o total vendido no dia e na semana.

## Solução
O sistema permitirá:
- cadastro e login de usuários da loja
- catálogo compartilhado de produtos
- registro manual de vendas
- colar mensagem do cliente
- IA identificar produtos e quantidades
- usuário revisar e confirmar os itens encontrados
- sistema salvar a venda
- dashboard com total vendido
- ranking de usuários por vendas registradas

## Estrutura geral do sistema
O sistema será usado por várias pessoas da mesma loja.
Todos os usuários acessarão o mesmo catálogo de produtos.
Cada venda ficará registrada com o usuário que realizou o lançamento.
A IA ajudará a transformar mensagens de clientes em vendas preenchidas automaticamente, mas a confirmação final sempre será humana.

## Regras principais
- todos os usuários pertencem à mesma operação da loja
- os produtos são compartilhados entre todos os usuários
- cada venda registra qual usuário fez o lançamento
- a IA apenas sugere os itens
- a venda só é salva após confirmação do usuário
- o total da venda é calculado pelo sistema
- o usuário não precisa digitar o preço no momento da venda
- o preço vem do produto cadastrado
- uma venda pode ter um ou vários itens
- o sistema deve guardar o texto original quando a venda vier da IA
- o ranking será baseado no total vendido e/ou quantidade de vendas por usuário

## Perfis de usuário
### Administrador
Pode:
- cadastrar produtos
- editar produtos
- ativar ou desativar produtos
- cadastrar usuários
- visualizar dashboard geral
- visualizar ranking
- visualizar histórico completo

### Vendedor
Pode:
- fazer login
- registrar venda manual
- registrar venda com IA
- visualizar dashboard
- visualizar histórico de vendas
- visualizar ranking, se permitido pela loja
- editar as próprias vendas dentro da regra de edição definida pela loja

## Funcionalidades da primeira versão
- cadastro de conta
- login
- listagem de produtos compartilhados
- cadastro de produtos
- registro manual de venda
- registro de venda por mensagem com IA
- confirmação da venda antes de salvar
- dashboard com total do dia
- dashboard com total da semana
- histórico de vendas
- ranking de usuários
- identificação do usuário que registrou cada venda
- editar venda

## Funcionalidades futuras
- cancelar venda
- categorias de produtos
- filtros por período
- relatórios mensais
- exportar Excel/PDF
- integração direta com WhatsApp
- leitura de áudio transcrito
- sugestões melhores da IA com base em correções anteriores
- comissão por vendedor
- metas de vendas
- notificações automáticas de fechamento diário

## Telas
- página inicial
- cadastro
- login
- dashboard
- produtos
- nova venda manual
- nova venda com IA
- histórico de vendas
- ranking
- perfil/configurações
- usuários da loja

## Fluxo da venda manual
1. usuário faz login
2. acessa a tela de nova venda
3. escolhe um ou mais produtos do catálogo
4. informa a quantidade de cada item
5. sistema calcula subtotais e valor total
6. usuário revisa os dados
7. usuário confirma
8. venda é salva com o usuário logado

## Fluxo da venda com IA
1. usuário faz login
2. acessa a tela de nova venda com IA
3. cola a mensagem do cliente
4. sistema envia o texto para interpretação
5. IA identifica itens e quantidades
6. sistema tenta relacionar os itens com os produtos cadastrados no catálogo da loja
7. sistema monta uma prévia da venda
8. usuário revisa os itens encontrados
9. usuário corrige se necessário
10. usuário confirma
11. venda é salva com origem "ia" e com o texto original armazenado

## Fluxo do dashboard
1. usuário faz login
2. acessa o dashboard
3. visualiza:
   - total vendido hoje
   - total vendido na semana
   - últimas vendas registradas
   - produtos mais vendidos
   - ranking de usuários
4. se for administrador, pode visualizar dados completos da operação
5. se for vendedor, pode visualizar a área permitida pela loja

## Fluxo do ranking
1. sistema reúne as vendas registradas
2. agrupa as vendas por usuário
3. calcula indicadores de desempenho
4. exibe ranking com base nos critérios definidos

## Dados principais do sistema

### Usuário
- id
- nome
- email
- senha_hash
- cargo
- ativo
- data_criacao

### Produto
- id
- nome
- preco
- ativo
- data_criacao

### Venda
- id
- usuario_id
- valor_total
- origem
- texto_original
- editada
- editada_em
- editada_por
- data_criacao

### Item da venda
- id
- venda_id
- produto_id
- quantidade
- preco_unitario
- subtotal

## Origem da venda
- manual
- ia

## Relações entre os dados
- um usuário pode registrar várias vendas
- uma venda pertence a um usuário
- uma venda possui vários itens
- cada item da venda aponta para um produto
- os produtos são compartilhados entre todos os usuários

## Ideia central da IA
A IA não decide sozinha.
A IA interpreta a mensagem e sugere os itens.
O sistema compara os itens sugeridos com o catálogo da loja.
O usuário revisa e confirma.
Depois disso a venda é registrada.

## Exemplos de uso da IA

### Exemplo 1
Mensagem do cliente:
"quero 2 coca 2l e 3 coxinhas"

Resultado esperado:
- Coca-Cola 2 Litros — quantidade 2
- Coxinha — quantidade 3

### Exemplo 2
Mensagem do cliente:
"me vê 1 pudim, 2 esfirras de carne e 1 refri grande"

Resultado esperado:
- Pudim — quantidade 1
- Esfirra de carne — quantidade 2
- produto correspondente ao "refri grande" com base no catálogo da loja

## Regras da interpretação com IA
- a IA deve tentar identificar produto e quantidade
- a IA pode retornar itens com baixa confiança
- itens com baixa confiança devem pedir revisão do usuário
- se um item não for encontrado com clareza, o usuário escolhe manualmente
- a venda não pode ser salva automaticamente sem confirmação
- o preço sempre vem do produto cadastrado, nunca da mensagem do cliente

## Indicadores do dashboard
- total vendido hoje
- total vendido na semana
- quantidade de vendas hoje
- quantidade de vendas na semana
- produtos mais vendidos
- últimas vendas registradas
- usuário que mais vendeu
- ranking geral de vendedores

## Critérios possíveis para o ranking
O ranking poderá usar um ou mais critérios:
- maior valor total vendido
- maior quantidade de vendas registradas
- maior quantidade de itens vendidos

## Critério inicial do ranking
Na primeira versão, o ranking principal será por:
- valor total vendido por usuário no período

## Informações exibidas no ranking
- posição
- nome do usuário
- valor total vendido
- quantidade de vendas
- quantidade total de itens vendidos

## Objetivo da primeira entrega
Entregar um sistema funcional onde:
- os usuários da loja conseguem entrar com login
- usam um catálogo compartilhado de produtos
- registram vendas manualmente ou com ajuda da IA
- confirmam a venda antes de salvar
- acompanham os resultados no dashboard
- visualizam um ranking de desempenho por usuário

## Resumo da ideia central
Este projeto não é uma rede social.
Ele é um sistema interno de operação com cara moderna de dashboard colaborativo.
Várias pessoas da mesma loja entram no sistema, usam os mesmos produtos, registram vendas e acompanham os resultados da operação em tempo real.
A IA entra como assistente para acelerar o lançamento das vendas a partir de mensagens reais dos clientes.

---

# Estrutura de páginas e navegação

## 1. Página inicial
### Objetivo
Receber o usuário ao entrar no sistema.

### O que aparece
- nome do sistema
- frase explicando o que ele faz
- botão de login
- botão de cadastro

### Ações
- clicar em "Entrar" leva para a tela de login
- clicar em "Criar conta" leva para a tela de cadastro

### Quem acessa
- qualquer pessoa não logada

---

## 2. Página de cadastro
### Objetivo
Permitir criar uma conta no sistema.

### O que aparece
- campo nome
- campo email
- campo senha
- botão criar conta
- link para login

### Ações
- ao enviar, o sistema cria o usuário
- depois do cadastro, o usuário pode ser redirecionado para login

### Quem acessa
- qualquer pessoa não logada

### Observação
Na primeira versão, o sistema pode permitir cadastro aberto ou apenas cadastro feito por admin.
Essa decisão será tomada antes da implementação.

---

## 3. Página de login
### Objetivo
Permitir que o usuário entre no sistema.

### O que aparece
- campo email
- campo senha
- botão entrar
- link para cadastro

### Ações
- ao fazer login com sucesso, o usuário vai para o dashboard

### Quem acessa
- qualquer pessoa não logada

---

## 4. Dashboard
### Objetivo
Ser a tela principal após o login.

### O que aparece
- total vendido hoje
- total vendido na semana
- quantidade de vendas hoje
- quantidade de vendas na semana
- produtos mais vendidos
- últimas vendas registradas
- ranking de usuários
- atalhos para nova venda manual
- atalho para nova venda com IA

### Ações
- clicar em "Nova venda manual" leva para a página de venda manual
- clicar em "Nova venda com IA" leva para a página de venda com IA
- clicar em uma venda recente pode levar para detalhes ou edição
- clicar em ranking pode levar para a página completa de ranking

### Quem acessa
- usuários logados
- admins visualizam dados completos
- vendedores visualizam conforme regra definida

---

## 5. Página de produtos
### Objetivo
Listar e gerenciar o catálogo compartilhado da loja.

### O que aparece
- lista de produtos
- nome do produto
- preço
- status ativo/inativo
- botão novo produto
- botão editar produto
- botão ativar/desativar produto
- campo de busca por nome

### Ações
- cadastrar produto
- editar produto
- ativar produto
- desativar produto

### Quem acessa
- admin

### Observação
Vendedores podem apenas visualizar produtos se isso for permitido futuramente, mas na primeira versão o gerenciamento é do admin.

---

## 6. Página de nova venda manual
### Objetivo
Permitir registrar uma venda escolhendo os produtos manualmente.

### O que aparece
- campo para adicionar produto
- seleção de produto do catálogo
- campo quantidade
- botão adicionar item
- lista dos itens adicionados
- subtotal por item
- valor total da venda
- botão remover item
- botão salvar venda

### Ações
- selecionar um produto
- informar quantidade
- adicionar à venda
- remover item da venda
- confirmar e salvar

### Quem acessa
- usuários logados

### Regra importante
O sistema calcula automaticamente o subtotal e o valor total.
O preço vem do cadastro do produto.

---

## 7. Página de nova venda com IA
### Objetivo
Permitir que o usuário cole a mensagem do cliente para a IA interpretar a venda.

### O que aparece
- área de texto para colar a mensagem
- botão interpretar pedido
- lista de itens identificados pela IA
- quantidade sugerida de cada item
- produto correspondente encontrado no catálogo
- indicador de confiança da interpretação
- opção de corrigir item manualmente
- opção de remover item
- opção de adicionar item extra manualmente
- valor total estimado
- botão confirmar venda

### Ações
- colar mensagem
- mandar interpretar
- revisar resultado
- corrigir o que estiver errado
- confirmar venda

### Quem acessa
- usuários logados

### Regras importantes
- a IA não salva direto
- a venda só é registrada após confirmação do usuário
- o texto original da mensagem deve ser salvo
- o sistema deve marcar a origem da venda como "ia"

---

## 8. Página de histórico de vendas
### Objetivo
Permitir visualizar todas as vendas registradas.

### O que aparece
- lista de vendas
- data e hora
- usuário que registrou
- origem da venda
- valor total
- quantidade de itens
- botão visualizar detalhes
- botão editar venda

### Ações
- visualizar detalhes da venda
- editar venda registrada

### Quem acessa
- usuários logados
- admin vê todas
- vendedor visualiza as vendas permitidas pela regra da loja

### Regras de edição
- admin pode editar qualquer venda
- vendedor pode editar apenas as próprias vendas
- vendedor pode editar apenas vendas registradas no mesmo dia
- toda edição recalcula os valores da venda
- toda edição afeta dashboard e ranking
- o sistema deve registrar que a venda foi editada
---
## 9. Página de edição de venda
### Objetivo
Permitir corrigir uma venda já salva.

### O que aparece
- dados da venda
- lista de itens atuais
- opção de alterar quantidade
- opção de remover item
- opção de adicionar item
- novo valor total recalculado
- botão salvar alterações

### Ações
- editar itens
- recalcular total
- salvar alterações

### Quem acessa
- admin pode editar qualquer venda
- vendedor pode editar apenas as próprias vendas registradas no mesmo dia

### Regras importantes
- toda edição deve recalcular o valor total
- a edição deve atualizar dashboard e ranking
- o sistema deve marcar a venda como editada
- o sistema deve guardar data e usuário da última edição
---

## 10. Página de ranking
### Objetivo
Exibir o desempenho dos usuários da loja.

### O que aparece
- posição
- nome do usuário
- valor total vendido
- quantidade de vendas
- quantidade de itens vendidos
- destaque para primeiro lugar

### Ações
- visualizar ranking geral
- futuramente aplicar filtro por período

### Quem acessa
- usuários logados
- visibilidade final depende da regra da loja

### Critério inicial
Ranking por valor total vendido.

---

## 11. Página de perfil/configurações
### Objetivo
Mostrar dados do usuário logado.

### O que aparece
- nome
- email
- cargo
- opção de alterar senha
- botão sair

### Ações
- visualizar perfil
- alterar senha
- sair do sistema

### Quem acessa
- usuários logados

---

## 12. Página de usuários da loja
### Objetivo
Gerenciar os usuários internos do sistema.

### O que aparece
- lista de usuários
- nome
- email
- cargo
- status ativo/inativo
- botão novo usuário
- botão editar usuário
- botão ativar/desativar usuário

### Ações
- criar usuário
- editar cargo
- ativar ou desativar acesso

### Quem acessa
- admin

---

## Regra de edição de venda
- admin pode editar qualquer venda
- vendedor pode editar apenas as próprias vendas
- vendedor só pode editar vendas registradas no mesmo dia
- toda edição recalcula os totais da venda
- toda edição impacta dashboard e ranking
- o sistema deve registrar que a venda foi editada
- o sistema deve guardar quem editou e quando editou