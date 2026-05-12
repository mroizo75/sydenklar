import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string {
  const secret = process.env.CANCEL_TOKEN_SECRET
  if (!secret) throw new Error('CANCEL_TOKEN_SECRET mangler i environment')
  return secret
}

export function generateCancelToken(partnerOrderId: string): string {
  return createHmac('sha256', getSecret()).update(partnerOrderId).digest('hex')
}

export function verifyCancelToken(partnerOrderId: string, token: string): boolean {
  try {
    const expected = generateCancelToken(partnerOrderId)
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(token, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
