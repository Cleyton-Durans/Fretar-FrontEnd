// Stripe (so no navegador): usa a chave PUBLICA (pk_...), que pode ficar no front.
// A chave SECRETA (sk_...) nunca vai para o front: fica so no back.
//
// Sem VITE_STRIPE_PUBLISHABLE_KEY o app continua no modo simulado (formulario de
// cartao de mentira), como antes.
import { loadStripe } from "@stripe/stripe-js/pure";

const CHAVE_PUBLICA = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const stripeAtivo = CHAVE_PUBLICA.startsWith("pk_");
export const stripeModoTeste = CHAVE_PUBLICA.startsWith("pk_test_");

let promessa = null;

// Carrega o Stripe.js so quando for preciso (nao em toda pagina).
export function obterStripe() {
  if (!stripeAtivo) return null;

  if (!promessa) {
    promessa = loadStripe(CHAVE_PUBLICA);
  }

  return promessa;
}
