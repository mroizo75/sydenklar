import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Valutaer støttet av Stripe for norske kontoer (fra Stripe-feilmelding)
const STRIPE_NO_SUPPORTED = new Set([
  'usd','aed','afn','all','amd','ang','aoa','ars','aud','awg','azn','bam','bbd','bdt','bgn',
  'bif','bmd','bnd','bob','brl','bsd','bwp','byn','bzd','cad','cdf','chf','clp','cny','cop',
  'crc','cve','czk','djf','dkk','dop','dzd','egp','etb','eur','fjd','fkp','gbp','gel','gip',
  'gmd','gnf','gtq','gyd','hkd','hnl','hrk','htg','huf','idr','ils','inr','isk','jmd','jpy',
  'kes','kgs','khr','kmf','krw','kyd','kzt','lak','lbp','lkr','lrd','lsl','mad','mdl','mga',
  'mkd','mmk','mnt','mop','mur','mvr','mwk','mxn','myr','mzn','nad','ngn','nio','nok','npr',
  'nzd','pab','pen','pgk','php','pkr','pln','pyg','qar','ron','rsd','rub','rwf','sar','sbd',
  'scr','sek','sgd','shp','sle','sos','srd','std','szl','thb','tjs','top','try','ttd','twd',
  'tzs','uah','ugx','uyu','uzs','vnd','vuv','wst','xaf','xcd','xcg','xof','xpf','yer','zar','zmw',
])

// Valutaer uten desimaler (Stripe krever heltall for disse)
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','ugx','vnd','vuv','xaf','xof','xpf',
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, partnerOrderId, hotelName, guestEmail } = body

    if (!amount || !currency || !partnerOrderId) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felter: amount, currency, partnerOrderId' },
        { status: 400 },
      )
    }

    const currencyLower = currency.toLowerCase()
    if (!STRIPE_NO_SUPPORTED.has(currencyLower)) {
      return NextResponse.json(
        { error: `Valuta ${currency.toUpperCase()} støttes ikke for norske Stripe-kontoer. Bruk NOK eller annen støttet valuta.`, unsupportedCurrency: true },
        { status: 400 },
      )
    }

    const amountNum = parseFloat(String(amount))
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Ugyldig beløp' }, { status: 400 })
    }

    // Null-desimal-valutaer sendes som heltall, andre ganges med 100
    const amountInSmallestUnit = ZERO_DECIMAL_CURRENCIES.has(currencyLower)
      ? Math.round(amountNum)
      : Math.round(amountNum * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currencyLower,
      metadata: {
        partner_order_id: partnerOrderId,
        hotel_name: hotelName || '',
        guest_email: guestEmail || '',
        source: 'sydenklar',
      },
      description: `Hotellbooking: ${hotelName || partnerOrderId}`,
      receipt_email: guestEmail || undefined,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Kunne ikke opprette betaling' },
      { status: 500 },
    )
  }
}
