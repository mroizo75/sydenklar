import NewsletterSignup from '@/components/NewsletterSignup'

export default function NewsletterSection() {
  return (
    <section className="bg-[var(--deep)] py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">
          Nyhetsbrev
        </p>
        <h2 className="font-display text-3xl lg:text-4xl text-white mb-4">
          Ukentlig reiseinspirasjon
        </h2>
        <p className="text-white/55 text-base mb-8 max-w-lg mx-auto">
          Få utvalgte hoteller, populære destinasjoner og eksklusive tilbud rett i innboksen — hver mandag.
        </p>
        <NewsletterSignup variant="dark" className="max-w-xl mx-auto" />
      </div>
    </section>
  )
}
