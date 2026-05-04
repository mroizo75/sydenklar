import Stripe from 'stripe'

function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY mangler i environment')
  return new Stripe(secret, { apiVersion: '2026-04-22.dahlia', typescript: true })
}

export const stripe = getStripe()

export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET mangler i environment')
  return stripe.webhooks.constructEvent(body, signature, secret)
}
