# Fretar — fretes sob demanda (estilo Uber, para cargas)

Projeto de final de curso. Conecta **clientes** que precisam de um frete a **motoristas**.
O cliente marca origem e destino no mapa, escolhe o veículo, vê o valor, paga e acompanha;
o motorista recebe a oferta, aceita, inicia e conclui; o cliente avalia.

- **Site publicado:** https://fretar-vercel.vercel.app
- **API publicada:** https://fretar-vercel-backend.vercel.app (teste: `/api/health`)
- **Contas de demonstração** (senha `secret123`): `cliente@fretar.com` e `motorista@fretar.com`
  (ou crie uma conta nova pelo próprio site).

> Os pagamentos são de **teste**: nenhum dinheiro real é movido.

## Tecnologias

| Parte | Tecnologia |
|---|---|
| Front | React 19 + Vite, mapa com Leaflet (OpenStreetMap), rotas pelo OSRM |
| Back | Laravel 12 (API REST), autenticação por token (Sanctum) |
| Banco | PostgreSQL (Neon) |
| Pagamento | Stripe (modo de teste) |
| Hospedagem | Vercel (site + API em container) |
| App no celular | PWA instalável (menu do navegador > "Instalar app") |

## Estrutura do repositório

```
frontend/   site React (projeto "fretar-vercel" na Vercel)
backend/    API Laravel (projeto "fretar-vercel-backend" na Vercel)
LEIA-ME.md  guia de publicação passo a passo
```

O site chama `/api/...` no próprio endereço, e a Vercel repassa ao back (`frontend/vercel.json`).

## O que o sistema faz

**Cliente:** cadastro e login; marca origem e destino no mapa ou por endereço; escolhe o tipo
de veículo e vê o **valor da corrida para aquela rota**; escolhe a forma de pagamento; solicita
o frete; acompanha o status (atualiza a cada 3 s); paga; avalia o motorista; histórico.

**Motorista:** cadastro com **endereço (área de atuação)**, veículo e **chave Pix para receber**;
recebe ofertas, aceita ou recusa, inicia, simula o trajeto e conclui; histórico.

**Regras importantes**
- **O preço é calculado no servidor**, não pelo cliente: `valor = distância (km) × tarifa do veículo`,
  com valor mínimo. Tarifa base R$ 2,50/km (carro) × multiplicador: moto 0,6 · carro 1,0 ·
  caminhonete 1,3 · van 1,6 · caminhão 2,4. Configurável em `backend/config/fretar.php`
  (variáveis `FRETE_PRICE_PER_KM`, `FRETE_MIN_PRICE`).
- **Pagamento:** cartão pela **Stripe** (modo de teste). Os dados do cartão vão direto à Stripe;
  o servidor só guarda o identificador, a bandeira e os 4 últimos dígitos. **Pix e dinheiro são
  simulados.**
- Máquina de estados do frete: `pending → searching_driver → driver_assigned → in_transit → completed`
  (ou `cancelled`).

## Cartões de teste da Stripe

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | aprovado |
| `4000 0000 0000 0002` | recusado |
| `4000 0027 6000 3184` | exige autenticação (3D Secure) |

Validade: qualquer data futura (ex.: 12/34). CVC: qualquer (ex.: 123).

## Como rodar no seu computador

Requisitos: PHP 8.3+, Composer, Node 20+, PostgreSQL.

```bash
# Back
cd backend
composer install
cp .env.example .env        # ajuste DB_PASSWORD, etc.
php artisan key:generate
php artisan migrate --seed
php artisan serve           # http://localhost:8000

# Front (outro terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173  (o Vite repassa /api para o back)
```

Sem chaves da Stripe o app roda com pagamento **simulado**. Para usar a Stripe de teste:
no `.env` do back `STRIPE_SECRET_KEY=sk_test_...` e `STRIPE_MOCK_ENABLED=false`; no front,
`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` (pode ficar no mesmo `.env`).
**Não use um arquivo chamado `.env.local`** (com `APP_ENV=local` o Laravel o lê no lugar do `.env`).

## Variáveis de ambiente na Vercel

**Projeto da API:** `APP_KEY`, `APP_ENV=production`, `APP_DEBUG=false`, `DB_CONNECTION=pgsql`,
`DB_URL` (string de conexão do Neon, sem *pooling*), `DB_SSLMODE=require`, `STRIPE_MOCK_ENABLED`,
`STRIPE_SECRET_KEY` (opcional).
**Projeto do site:** `VITE_STRIPE_PUBLISHABLE_KEY` (opcional; precisa existir antes do build).
Nunca versionar o arquivo `.env` nem chaves secretas.

## O que foi alterado em relação à versão original

- **Cadastro do motorista:** endereço completo e chave Pix (validada); 27 estados.
- **Preço por distância e por veículo**, calculado no back; o cliente não digita mais o valor.
- **Carteira de pagamento** (cartão, Pix, dinheiro) e **integração real com a Stripe (teste)**:
  Customer, PaymentIntent confirmado no servidor, tratamento de 3D Secure.
- **Correções:** histórico do motorista dava 403; responder uma oferta alterava as ofertas de
  todos os motoristas (chave composta de `shipping_drivers`); motorista novo nascia offline;
  placa repetida dava erro 500; conflito de merge no `App.css`; arquivos fora de lugar em `config/`.
- **Publicação:** divisão em `frontend/` e `backend/`, Dockerfile (FrankenPHP) para a API,
  banco no Neon, PWA instalável.

## Limitações conhecidas

- Pix e dinheiro são simulados; não há **repasse ao motorista** (exigiria Stripe Connect) nem **webhook**.
- Sem WebSocket: o acompanhamento é por consulta a cada 3 s.
- Depois de alguns minutos sem uso, o back e o banco "dormem": a primeira chamada demora alguns segundos.
- A execução de containers na Vercel e o plano gratuito têm limites e estão sujeitos a mudanças.
- Ideias futuras: oferecer o frete ao motorista mais próximo, botão online/offline, localização
  do motorista no mapa em tempo real, notificações, repasse automático.
