import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, EyeOff, GitBranch, Mail, Search, Sparkles } from 'lucide-react'

const siteUrl = 'https://gyatt.email'

export const metadata: Metadata = {
  title: 'gyatt.email — Email, carved for focus',
  description: 'gyatt.email is an open-source, not-for-profit email client with thoughtful AI tools, powerful search, and a calm inbox.',
  alternates: { canonical: '/' },
  openGraph: { title: 'gyatt.email — Email, carved for focus', description: 'A calm, open-source email client with thoughtful AI tools and powerful search.', url: siteUrl, siteName: 'gyatt.email', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'gyatt.email — Email, carved for focus', description: 'A calm, open-source email client with thoughtful AI tools and powerful search.' },
}

const features = [
  { icon: Sparkles, title: 'AI that stays useful', text: 'Summarise long threads, draft replies, and improve your writing without making your inbox feel busy.' },
  { icon: Search, title: 'Find what matters', text: 'Search through your mail quickly, then use clear filters and labels to keep the important things close.' },
  { icon: EyeOff, title: 'Your mail, on your terms', text: 'Connect the accounts you already use. gyattmail is built around control, not lock-in.' },
]

const inboxRows = [
  ['Design review · Tue', 'The updated exploration is attached — keen for your notes.'],
  ['Order confirmation · Mon', 'Your receipt and delivery details are ready.'],
  ['Sunday plans · Sun', 'I found a little place worth trying.'],
]

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: 'gyatt.email', url: siteUrl, description: 'An open-source, not-for-profit email client with AI tools, search, and inbox management.' },
      { '@type': 'SoftwareApplication', name: 'gyattmail', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', url: siteUrl, description: 'An open-source, not-for-profit email client with AI tools, search, and inbox management.', isAccessibleForFree: true },
    ],
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-paper-100 text-ink-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <section className="paper-grain relative isolate">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <header className="flex items-center justify-between py-5 sm:py-7">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="gyatt.email home">
              <span className="grid size-9 place-items-center rounded-xl bg-hat-600 font-serif text-lg font-bold text-paper-100 shadow-letterpress transition-transform group-hover:-rotate-3">g</span>
              <span className="font-serif text-xl font-bold tracking-tight text-ink-700">gyatt.email</span>
            </Link>
            <Link href="/connect" className="rounded-full border-2 border-hatch-600 bg-paper-200 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-paper-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hat-600 focus-visible:ring-offset-2 sm:px-5">Open app</Link>
          </header>

          <div className="grid items-center gap-12 pb-16 pt-9 sm:pb-24 sm:pt-16 lg:grid-cols-[1.04fr_.96fr] lg:gap-16 lg:pb-28">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-hat-700"><span className="h-px w-7 bg-hat-600" />a calmer way to email</p>
              <h1 className="font-serif text-5xl font-bold leading-[0.94] tracking-[-0.045em] text-ink-700 sm:text-6xl lg:text-7xl">Email, carved<span className="block text-hat-600">for focus.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-ink-700/80 sm:text-xl">gyatt.email brings your accounts, your attention, and genuinely helpful AI back into one beautifully quiet inbox.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/connect" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-hat-600 px-6 font-semibold text-paper-100 shadow-letterpress transition-transform hover:-translate-y-0.5 hover:bg-hat-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hat-600 focus-visible:ring-offset-2">Open gyattmail <ArrowRight size={17} aria-hidden="true" /></Link>
                <a href="#how-it-feels" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-hatch-600 bg-paper-100 px-6 font-semibold text-ink-700 transition-colors hover:bg-paper-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hat-600 focus-visible:ring-offset-2">See what it does</a>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-hatch-600"><GitBranch size={16} aria-hidden="true" /> Open source · not-for-profit · built for people</p>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div className="absolute -inset-8 -z-10 rounded-full bg-hat-400/20 blur-3xl" />
              <div className="hatch-border hatch-border-active rounded-[1.6rem] bg-paper-200 p-2 soft-lift sm:p-3"><div className="overflow-hidden rounded-[1.2rem] border border-hatch-600/50 bg-paper-100">
                <div className="flex items-center gap-2 border-b border-hatch-600/50 px-4 py-3"><span className="size-2.5 rounded-full bg-berry-500/70" /><span className="size-2.5 rounded-full bg-hat-400" /><span className="size-2.5 rounded-full bg-pine-500/70" /><div className="ml-3 h-5 flex-1 rounded-md bg-paper-200" /></div>
                <div className="grid min-h-[342px] grid-cols-[92px_1fr] sm:grid-cols-[124px_1fr]">
                  <aside className="border-r border-hatch-600/45 bg-paper-200/70 p-3 sm:p-4"><div className="mb-5 flex items-center gap-1.5 text-hat-700"><Mail size={15} /><span className="hidden text-xs font-bold sm:inline">Inbox</span></div>{['Inbox', 'Starred', 'Sent', 'Drafts'].map((item, index) => <div key={item} className={`mb-2 rounded-md px-2 py-1.5 text-[10px] sm:text-xs ${index === 0 ? 'bg-hat-600 text-paper-100' : 'text-hatch-600'}`}>{item}</div>)}</aside>
                  <div className="p-4 sm:p-5"><div className="mb-5 flex items-center justify-between"><div><p className="font-serif text-xl font-bold text-ink-700">Inbox</p><p className="text-xs text-hatch-600">3 messages, all caught up</p></div><span className="grid size-8 place-items-center rounded-full bg-hat-600 text-paper-100"><Sparkles size={15} /></span></div><div className="space-y-2">{inboxRows.map(([subject, preview], index) => <div key={subject} className={`rounded-lg border p-3 ${index === 0 ? 'border-hat-600/60 bg-hat-400/15' : 'border-hatch-600/35 bg-paper-200/45'}`}><p className="truncate text-xs font-bold text-ink-700">{subject}</p><p className="mt-1 truncate text-[11px] text-hatch-600">{preview}</p></div>)}</div><div className="mt-4 rounded-lg border border-dashed border-hat-600/60 bg-hat-400/10 p-3"><p className="flex items-center gap-1.5 text-xs font-bold text-hat-700"><Sparkles size={13} /> Thread summary ready</p><p className="mt-1 text-[11px] leading-4 text-ink-700/75">Three decisions, one action item.</p></div></div>
                </div>
              </div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-feels" className="border-y border-hatch-600/45 bg-paper-200 paper-grain"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.15em] text-hat-700">Made for everyday mail</p><h2 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-ink-700 sm:text-5xl">Less inbox theatre. More room to think.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="hatch-border rounded-2xl bg-paper-100 p-6 sm:p-7"><span className="mb-7 grid size-11 place-items-center rounded-xl bg-hat-400/30 text-hat-700"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span><p className="mb-3 font-serif text-2xl font-bold text-ink-700"><span className="mr-2 text-sm text-hat-600">0{index + 1}</span>{title}</p><p className="leading-7 text-ink-700/75">{text}</p></article>)}</div></div></section>

      <section className="paper-grain"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-hat-700">A different kind of inbox</p><h2 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-ink-700 sm:text-5xl">Good tools should feel like yours.</h2></div><div className="rounded-2xl border-2 border-hatch-600 bg-paper-200 p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-2">{['Connect Gmail, Outlook, or your own mailbox.', 'Keep conversation context with clear message views.', 'Use AI assistance when it saves time — not for show.', 'Choose open software built without a profit motive.'].map((item) => <p key={item} className="flex gap-3 text-sm leading-6 text-ink-700"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-pine-500 text-paper-100"><Check size={13} strokeWidth={3} /></span>{item}</p>)}</div><div className="separator-hatched my-7" /><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="font-serif text-xl font-bold text-ink-700">Your inbox is waiting.</p><Link href="/connect" className="inline-flex items-center gap-2 font-semibold text-hat-700 hover:text-hat-600">Get started <ArrowRight size={17} /></Link></div></div></div></section>

      <footer className="border-t border-hatch-600/45 bg-ink-900 text-paper-100"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><p className="font-serif text-xl font-bold">gyatt.email</p><p className="mt-1 text-sm text-paper-100/65">Open-source email for people, not profit.</p></div><Link href="/connect" className="inline-flex items-center gap-2 self-start rounded-full bg-paper-100 px-5 py-2.5 text-sm font-bold text-ink-700 transition-colors hover:bg-hat-400 sm:self-auto">Open gyattmail <ArrowRight size={16} /></Link></div></footer>
    </main>
  )
}
