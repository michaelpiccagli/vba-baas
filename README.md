# VBA BaaS

Backend desenvolvido em NestJS para o desafio técnico de integração com a plataforma Lera Box / BranchPay.

A aplicação funciona como uma camada BaaS intermediária entre lojistas e o gateway de pagamentos, permitindo autenticação, criação de checkout, pagamentos via Pix e cartão, consulta de carteira, saques e processamento de webhooks.

## Tecnologias

- Node.js
- TypeScript
- NestJS
- TypeORM
- MySQL
- Docker
- JWT
- class-validator
- class-transformer
- Axios
- Swagger
- Jest

## Arquitetura

O projeto foi dividido em módulos seguindo a organização do NestJS.

Principais responsabilidades:

- `auth`: autenticação dos lojistas no BaaS
- `merchants`: dados dos lojistas
- `gateway`: integração HTTP com a Lera Box
- `checkouts`: criação e processamento de checkouts
- `transactions`: persistência das transações
- `webhooks`: recebimento e processamento de eventos
- `health`: health check da aplicação

Fluxo simplificado:

```text
Cliente / Lojista
       |
       v
    VBA BaaS
       |
       v
   Lera Box API
       |
       v
Pix / Cartão / Saques / Webhooks
```

A aplicação não acessa diretamente o banco de dados do gateway. Toda comunicação com a Lera Box ocorre através das APIs HTTP disponibilizadas.

## Funcionalidades implementadas

O backend implementa:

- autenticação própria de lojistas com JWT
- cadastro e login de lojistas
- integração com autenticação da Lera Box
- criação de usuário no gateway
- consulta do usuário autenticado
- reset de senha
- consulta da carteira
- consulta de transações
- criação de pagamento Pix
- criação de pagamento com cartão
- consulta de pagamento por ID
- consulta das taxas de cartão
- validação de bandeira Visa, Mastercard e Elo
- validação de taxa por bandeira e número de parcelas
- persistência das taxas de cartão
- criação de checkout
- checkout público
- pagamento público via Pix
- pagamento público via cartão
- expiração de checkout
- saques via Pix
- consulta de saque
- cadastro, listagem e exclusão de webhooks
- persistência local das configurações de webhook
- validação HMAC dos webhooks
- idempotência dos eventos recebidos
- atualização de transações através de webhook
- correlation ID nas requisições
- tratamento global de exceções
- validação global de DTOs
- documentação Swagger
- health check

## Checkout público

A criação do checkout é feita pelo lojista autenticado.

Após a criação, o cliente pode consultar e pagar o checkout sem precisar utilizar o JWT do lojista.

Fluxo:

```text
Lojista autenticado
       |
       | cria checkout
       v
Checkout PENDING
       |
       | link / id
       v
Cliente
       |
       +---- Pix
       |
       +---- Cartão
```

O backend identifica automaticamente o lojista relacionado ao checkout e utiliza internamente a conta correspondente na Lera Box.

Tokens e credenciais do gateway não são enviados ao cliente.

## Pagamentos com cartão

Antes de realizar o pagamento com cartão, a aplicação consulta a tabela de taxas disponibilizada pelo gateway.

A taxa enviada precisa corresponder a:

- bandeira
- quantidade de parcelas
- percentual configurado pelo gateway

São persistidos localmente:

- bandeira
- quantidade de parcelas
- percentual da taxa
- valor da taxa em centavos
- valor líquido em centavos

Exemplo:

```text
Valor bruto: R$ 25,00
Taxa: 3,19%
Valor da taxa: R$ 0,80
Valor líquido: R$ 24,20
```

Dados sensíveis como número completo do cartão e CVV não são persistidos.

## Webhooks

A aplicação permite cadastrar webhooks para os eventos:

- `PAYMENT_PIX`
- `PAYMENT_CARD`
- `WITHDRAWAL`

Os webhooks recebidos podem ser validados através do header:

```text
X-Lera-Box-Signature
```

A assinatura é validada utilizando HMAC SHA-256 sobre o corpo bruto da requisição.

Também foi implementado controle de idempotência para evitar o processamento repetido do mesmo status de uma transação.

Ao receber um evento válido, a aplicação atualiza a transação local e, quando aplicável, o checkout associado.

A exclusão de webhook também atualiza o registro local, mantendo o histórico com `active = false`.

## Pré-requisitos

É necessário ter instalado:

- Node.js
- npm
- Docker
- MySQL, caso não utilize Docker

## Instalação

Clone o repositório:

```bash
git clone https://github.com/michaelpiccagli/vba-baas.git
```

Entre na pasta:

```bash
cd vba-baas
```

Instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows, também pode criar manualmente um arquivo `.env` baseado no `.env.example`.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=vba_baas

JWT_SECRET=change-me

GATEWAY_BASE_URL=https://api.branchpay.com.br/api
```

O arquivo `.env` real não deve ser enviado para o repositório.

## Banco de dados com Docker

Exemplo para iniciar o MySQL:

```bash
docker run \
  --name vba-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=vba_baas \
  -p 3306:3306 \
  -d mysql:8.4
```

Caso o container já exista:

```bash
docker start vba-mysql
```

## TypeORM e sincronização do schema

Para facilitar a execução do desafio em ambiente local, o projeto utiliza:

```text
synchronize: true
```

Essa configuração permite que o TypeORM sincronize automaticamente as entidades com o banco durante o desenvolvimento.

Essa escolha foi feita para agilizar a configuração e execução do desafio.

Em um ambiente de produção, a abordagem recomendada seria:

```text
synchronize: false
```

junto com migrations versionadas.

Isso evita alterações automáticas de schema e permite controlar a evolução do banco de dados de forma segura.

## Executando a aplicação

Modo desenvolvimento:

```bash
npm run start:dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## Swagger

A documentação Swagger pode ser acessada em:

```text
http://localhost:3000/docs
```

O Swagger está configurado para facilitar a exploração e teste dos endpoints da aplicação.

Algumas descrições e respostas podem ser ampliadas futuramente com anotações mais detalhadas.

## Health check

```http
GET /health
```

Exemplo:

```json
{
  "status": "ok",
  "service": "vba-baas"
}
```

## Principais endpoints

### Autenticação BaaS

```http
POST /auth/register
POST /auth/login
```

### Checkout

Criar checkout:

```http
POST /checkouts
Authorization: Bearer <BaaS JWT>
```

Consultar checkout público:

```http
GET /checkouts/:id
```

Pagamento Pix público:

```http
POST /checkouts/:id/pix
```

Pagamento com cartão público:

```http
POST /checkouts/:id/card
```

### Gateway

```http
POST /gateway/login
POST /gateway/users
GET  /gateway/users/me
POST /gateway/auth/reset-password
```

### Carteira

```http
GET /gateway/wallet
GET /gateway/wallet/transactions
```

### Pagamentos

```http
POST /gateway/payments/pix
POST /gateway/payments/card
GET  /gateway/payments/:id
```

### Taxas

```http
GET /gateway/fees
```

### Saques

```http
POST /gateway/withdrawals
GET  /gateway/withdrawals/:id
```

### Webhooks

```http
POST   /gateway/webhooks
GET    /gateway/webhooks
DELETE /gateway/webhooks/:id
```

Receiver público:

```http
POST /webhooks/lera-box/:event
```

## Validações

A aplicação utiliza `ValidationPipe` global com:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

Isso evita que campos inesperados sejam aceitos pelos DTOs da aplicação.

## Tratamento de erros

Foi implementado um filtro global de exceções para padronizar erros da aplicação e erros provenientes do gateway.

As respostas incluem informações como:

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "path": "/rota",
  "timestamp": "2026-10-08T00:00:00.000Z",
  "correlationId": "uuid"
}
```

O `correlationId` permite relacionar uma requisição aos logs gerados durante seu processamento.

## Segurança

Medidas implementadas:

- autenticação JWT
- isolamento de dados por lojista
- validação de DTOs
- validação HMAC dos webhooks
- idempotência de eventos
- não persistência de CVV
- não persistência do número completo do cartão
- credenciais configuradas através de variáveis de ambiente
- tokens do gateway utilizados somente internamente
- checkout público sem exposição das credenciais do lojista

Alguns pontos poderiam ser reforçados em uma evolução para produção, como criptografia de credenciais sensíveis persistidas e políticas adicionais de rate limiting.

## Valores monetários

Valores monetários são tratados em centavos.

Exemplo:

```text
1500 = R$ 15,00
2500 = R$ 25,00
```

Isso evita problemas de precisão comuns no uso de números de ponto flutuante para dinheiro.

## Testes

Executar os testes:

```bash
npm test -- --runInBand
```

Build da aplicação:

```bash
npm run build
```

Atualmente o projeto possui testes básicos de estrutura e inicialização.

Uma cobertura maior de testes unitários, integração e end-to-end seria uma evolução importante para um ambiente de produção.

## Decisões técnicas

### Gateway

A comunicação com a Lera Box é feita exclusivamente através de HTTP.

O BaaS mantém apenas os dados necessários para controle interno, conciliação e relacionamento das operações.

### Checkout

O lojista cria o checkout autenticado.

O cliente pode realizar o pagamento utilizando apenas o ID do checkout.

A associação entre checkout e lojista é resolvida internamente pelo backend.

### Webhooks

Eventos processados são registrados localmente para evitar processamento duplicado.

A validação da assinatura utiliza o corpo bruto da requisição para manter compatibilidade com o HMAC enviado pelo gateway.

## Limitações e melhorias futuras

Por se tratar de um desafio técnico com prazo reduzido, alguns pontos foram priorizados como evolução futura:

- substituir `synchronize: true` por migrations versionadas
- ampliar cobertura de testes
- adicionar testes end-to-end
- ampliar anotações do Swagger
- criptografar credenciais sensíveis persistidas
- implementar rate limiting
- adicionar observabilidade e métricas
- utilizar filas para processamento assíncrono de webhooks
- implementar estratégia de retry
- disponibilizar a API em ambiente público
- implementar frontend completo para painel do lojista e checkout

## Autor

Michael Piccagli

Desafio técnico BaaS / integração com gateway de pagamentos.