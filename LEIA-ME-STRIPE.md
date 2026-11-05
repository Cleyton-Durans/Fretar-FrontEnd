# Stripe em modo de teste (sem dinheiro real)

## 1. Criar a conta e pegar as chaves de teste
1. Crie uma conta gratuita em https://dashboard.stripe.com/register
2. No painel, deixe ativado o **modo de teste** (faixa laranja / "Test mode" ou uma *Sandbox*).
3. Abra **Developers > API keys** e copie:
   - **Publishable key** (começa com `pk_test_`): pode ir no front.
   - **Secret key** (começa com `sk_test_`): **segredo**. Só no back. Nunca no chat, no GitHub nem em print.

## 2. Aplicar os arquivos
Extraia este zip **na raiz do projeto** (a pasta com `artisan` e `vite.config.js`) e substitua tudo.
Confira no PowerShell, na raiz:

```powershell
"src\lib\stripe.js","src\components\MetodosPagamento.jsx","app\Services\PaymentService.php","app\Models\Payment.php","app\Http\Resources\PaymentResource.php" | ForEach-Object { "{0,-50} {1}" -f $_, (Test-Path $_) }
```
Tudo deve mostrar `True`. Depois instale as bibliotecas da Stripe no front:

```powershell
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## 3. Configurar as chaves (no seu computador)
**Back:** abra o arquivo `.env` e deixe assim (troque pela SUA chave secreta):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_MOCK_ENABLED=false
```
Depois: `php artisan config:clear` e reinicie o `php artisan serve`.

**Front:** crie na raiz um arquivo chamado `.env.local` com uma linha (a chave PÚBLICA):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
Reinicie o `npm run dev` (o Vite só lê esse arquivo ao iniciar).

## 4. Testar
1. Como cliente, em "Forma de pagamento > Adicionar > Cartão", use os dados de teste da Stripe:
   - Número `4242 4242 4242 4242`, validade futura (ex.: `12/34`), CVC qualquer (ex.: `123`).
2. Crie um frete, deixe o motorista concluir, e clique em **Pagar**.
3. No painel da Stripe (modo de teste) > **Payments**, a cobrança aparece em reais.

Outros cartões de teste: `4000 0000 0000 0002` (recusado) e `4000 0027 6000 3184`
(o banco exige autenticação: abre uma janela de confirmação da Stripe).

## O que muda e o que continua simulado
- **Cartão** usa a Stripe de verdade (em teste). Os dados do cartão vão direto para a Stripe;
  o seu servidor só recebe o identificador `pm_...`, a bandeira e os 4 últimos dígitos.
- **Pix e dinheiro** continuam **simulados**, mesmo com a Stripe ativa.
- Cartões salvos antes (identificador `pm_mock_...`) continuam simulados.
- Sem as chaves, o app volta ao modo simulado de antes.
- **Ainda não existe**: repasse ao motorista (Stripe Connect) nem webhook. O app confirma
  consultando a Stripe no momento do pagamento.

## Na Vercel (quando for publicar)
- Projeto do **back**: variáveis `STRIPE_SECRET_KEY` e `STRIPE_MOCK_ENABLED=false`.
- Projeto do **site**: variável `VITE_STRIPE_PUBLISHABLE_KEY` (precisa existir **antes** do build;
  se adicionar depois, refaça o deploy do site).
