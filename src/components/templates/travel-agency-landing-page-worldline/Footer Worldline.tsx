/*
 * Closing — final call to action (tour search) plus the footer. (Nature / outdoor style)
 * 100% self-contained.
 * Needs: only React 18 + Tailwind CSS. Fonts load from Google Fonts (no npm package).
 */
import { useEffect, useRef, useState } from 'react'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap'

const FRAME_H = 1110

const IDEAS = ['Bali, 6 days in May', "Cox's Bazar, a long weekend", 'Kyoto in cherry-blossom season', 'Sajek Valley above the clouds']
const COLUMNS = [
  { title: 'Explore', links: ['Destinations', 'Tours', 'Deals', 'Gift cards'] },
  { title: 'Company', links: ['About us', 'Local partners', 'Careers', 'Journal'] },
  { title: 'Support', links: ['Help centre', 'Cancellations', 'Travel insurance', 'Contact'] },
]

export default function Closing() {
  return <Responsive desktop={<Desktop />} mobile={<Mobile />} />
}

function Desktop() {
  return (
    <Artboard height={FRAME_H} id="start" className="bg-[#ECEEE8]">
      <Topo width={1600} height={700} color="#1F3A2E" opacity={0.07} cx={800} cy={330} rings={24} />
      <div style={at(0, 128, 1600)} className="text-center">
        <Reveal>
          <Label>Start planning</Label>
        </Reveal>
      </div>
      <div style={at(200, 182, 1200)} className="text-center">
        <Reveal delay={200}>
          <h2 className="font-['Outfit',system-ui,sans-serif] text-[116px] font-bold leading-[0.92] tracking-[-0.045em] text-[#1F3A2E]">
            Where do you
            <br />
            <span className="text-[#E9824B]">want to go next?</span>
          </h2>
        </Reveal>
      </div>
      <div style={at(370, 452, 860)}>
        <Reveal delay={320}>
          <PromptField />
        </Reveal>
      </div>
      <div style={at(0, 560, 1600)} className="flex justify-center gap-[28px] text-[15px] text-[#1F3A2E]/70">
        <Reveal delay={400}>
          <div className="flex gap-[28px]">
            {['No booking fee', 'Prices in US dollars', 'Free date changes up to 7 days before'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check />
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
      <div style={at(40, 700, 1520, 370)}>
        <Footer />
      </div>
    </Artboard>
  )
}

function Footer() {
  return (
    <footer className="relative flex h-full flex-col overflow-hidden rounded-[40px] bg-[#1F3A2E] px-[80px] pb-[34px] pt-[56px] text-[#ECEEE8]">
      <Topo width={1520} height={370} color="#ECEEE8" opacity={0.06} cx={1300} cy={380} rings={18} />
      <div className="relative flex justify-between">
        <div className="w-[420px]">
          <Logo light />
          <div className="mt-[16px] text-[15px] text-[#F3A36A]">DHAKA · 23.81° N · 90.41° E</div>
          <p className="mt-[12px] text-[16px] leading-[1.55] text-[#ECEEE8]/65">
            Small-group tours with local guides, and a 3D preview of every place before you book. Our office is in Dhaka.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-[26px] flex h-[52px] w-[400px] items-center rounded-full border border-[#ECEEE8]/20 bg-[#14261E]/40 pl-[20px] pr-[6px]">
            <input
              aria-label="Email for travel deals"
              placeholder="Email, for one deals email a month"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#ECEEE8] outline-none placeholder:text-[#ECEEE8]/40"
            />
            <button type="submit" className="h-[40px] rounded-full bg-[#E9824B] px-[18px] text-[15px] font-semibold text-[#14261E] transition-colors duration-300 hover:bg-[#ECEEE8]">
              Subscribe
            </button>
          </form>
        </div>
        <div className="flex gap-[90px]">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="text-[15px] text-[#ECEEE8]/45">{c.title}</div>
              <ul className="mt-[18px] flex flex-col gap-[12px]">
                {c.links.map((l) => (
                  <li key={l}>
                    <UnderlineLink href="#start">{l}</UnderlineLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-auto flex items-center justify-between border-t border-[#ECEEE8]/12 pt-[26px] text-[15px] text-[#ECEEE8]/55">
        <span>© 2026 Worldline Trips</span>
        <span className="flex items-center gap-[10px]">
          Secure payments in
          <span className="rounded-full bg-[#E9824B] px-[10px] py-[3px] font-semibold text-[#14261E]">USD $</span>
        </span>
        <span className="flex gap-[24px]">
          <UnderlineLink href="#start">Privacy</UnderlineLink>
          <UnderlineLink href="#start">Terms</UnderlineLink>
        </span>
      </div>
    </footer>
  )
}

function PromptField() {
  const [i, setI] = useState(0)
  const [value, setValue] = useState('')
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % IDEAS.length), 3200)
    return () => clearInterval(id)
  }, [])
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex h-[84px] items-center rounded-full border-[1.5px] border-[#1F3A2E]/15 bg-[#F6F8F4] pl-[28px] pr-[12px] shadow-[0_30px_60px_-30px_rgba(30,58,47,.5)] transition-colors duration-500 focus-within:border-[#E9824B]"
    >
      <Pin />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Try “${IDEAS[i]}”`}
        aria-label="Where do you want to go?"
        className="ml-[14px] min-w-0 flex-1 bg-transparent text-[19px] text-[#18231C] outline-none placeholder:text-[#18231C]/40"
      />
      <Button>Search tours</Button>
    </form>
  )
}

function Mobile() {
  return (
    <section id="start" className="relative overflow-hidden bg-[#ECEEE8] pb-3 pt-20">
      <Topo width={390} height={600} color="#1F3A2E" opacity={0.07} cx={195} cy={200} rings={14} />
      <div className="relative px-5 text-center">
        <Reveal>
          <Label>Start planning</Label>
        </Reveal>
        <Reveal delay={200}>
          <h2 className="mt-5 font-['Outfit',system-ui,sans-serif] text-[52px] font-bold leading-[0.94] tracking-[-0.04em] text-[#1F3A2E]">
            Where do you <span className="text-[#E9824B]">want to go next?</span>
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex flex-col gap-3">
            <input
              placeholder={`Try “${IDEAS[0]}”`}
              aria-label="Where do you want to go?"
              className="h-[56px] rounded-full border-[1.5px] border-[#1F3A2E]/15 bg-[#F6F8F4] px-5 text-[16px] outline-none placeholder:text-[#18231C]/40 focus:border-[#E9824B]"
            />
            <Button full>Search tours</Button>
          </form>
          <p className="mt-4 text-[15px] text-[#1F3A2E]/65">No booking fees · Prices in USD</p>
        </Reveal>
      </div>
      <footer className="relative mx-3 mt-14 rounded-[32px] bg-[#1F3A2E] px-6 pb-8 pt-10 text-[#ECEEE8]">
        <Logo light />
        <p className="mt-4 text-[15px] leading-[1.55] text-[#ECEEE8]/65">
          Small-group tours with local guides. Our office is in Dhaka.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6">
          {COLUMNS.slice(0, 2).map((c) => (
            <div key={c.title}>
              <div className="text-[15px] text-[#ECEEE8]/45">{c.title}</div>
              <ul className="mt-3 flex flex-col gap-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <UnderlineLink href="#start">{l}</UnderlineLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-[#ECEEE8]/12 pt-5 text-[15px] text-[#ECEEE8]/55">© 2026 Worldline Trips · Payments in USD $</div>
      </footer>
    </section>
  )
}

/* ================================================================== */
/*  Section-local helpers — kept in this file so the section is 100%  */
/*  self-contained                                                    */
/* ================================================================== */
function useViewportWidth() {
  const [w, setW] = useState(() => (typeof document === 'undefined' ? 1600 : document.documentElement.clientWidth))
  useEffect(() => {
    const on = () => setW(document.documentElement.clientWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}
function useDesignScale() {
  return useViewportWidth() / 1600
}
function useIsDesktop() {
  return useViewportWidth() >= 768
}
function at(left: number, top: number, width?: number, height?: number): React.CSSProperties {
  return { position: 'absolute', left, top, width, height }
}
function Artboard({ height, children, id, className = '' }: { height: number; children: React.ReactNode; id?: string; className?: string }) {
  const s = useDesignScale()
  return (
    <section id={id} className={`relative overflow-hidden ${className}`} style={{ height: height * s }}>
      <div className="absolute left-0 top-0" style={{ width: 1600, height, transform: `scale(${s})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </section>
  )
}
function useGoogleFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_URL}"]`)) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = FONT_URL
    document.head.appendChild(l)
  }, [])
}
function Responsive({ desktop, mobile }: { desktop: React.ReactNode; mobile: React.ReactNode }) {
  useGoogleFonts()
  const d = useIsDesktop()
  return <div className="font-['Figtree',system-ui,sans-serif] text-[#18231C] antialiased">{d ? desktop : mobile}</div>
}
function usePrefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function useInView<T extends HTMLElement>(ref: React.RefObject<T | null>, threshold = 0.15) {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return v
}
/** Fades content up a short distance when it scrolls into view (and back out when it leaves). */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const shown = usePrefersReduced() || inView
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translate3d(0, 28px, 0)',
        transition: `opacity 700ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[10px] text-[16px] font-semibold ${light ? 'text-[#F3A36A]' : 'text-[#C25F2C]'}`}>
      <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
        <path d="M1 9 L7 3 L11 6 L15 1 L21 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}
function Button({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return (
    <button
      type="submit"
      className={`group relative inline-flex h-[58px] items-center justify-center overflow-hidden rounded-full bg-[#E9824B] px-[28px] text-[16px] font-semibold text-[#14261E] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_14px_30px_-12px_rgba(30,58,47,.6)] active:scale-[0.97] ${
        full ? 'w-full' : ''
      }`}
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-[#1F3A2E] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      <span className="relative block overflow-hidden transition-colors duration-500 group-hover:text-[#ECEEE8]">
        <span className="flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
          {children}
          <Arrow />
        </span>
        <span className="absolute inset-0 flex translate-y-full items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
          {children}
          <Arrow />
        </span>
      </span>
    </button>
  )
}
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-500 group-hover:-rotate-45">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Pin({ small }: { small?: boolean }) {
  return (
    <svg width={small ? 12 : 18} height={small ? 14 : 22} viewBox="0 0 14 16" aria-hidden>
      <path d="M1.5 6.2a5.5 5.5 0 0 1 11 0c0 4.3-5.5 9-5.5 9s-5.5-4.7-5.5-9Z" fill="#E9824B" />
      <circle cx="7" cy="6.2" r="1.9" fill="#F6F8F4" />
    </svg>
  )
}
function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="none" stroke="#6F8B4F" />
      <path d="M4.8 8.2 7 10.3l4.3-4.6" fill="none" stroke="#6F8B4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function UnderlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-[2px] text-[15px] opacity-75 transition-[background-size,opacity] duration-500 hover:bg-[length:100%_1px] hover:opacity-100"
    >
      {children}
    </a>
  )
}
function Logo({ light }: { light?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-[10px] ${light ? 'text-[#ECEEE8]' : 'text-[#1F3A2E]'}`}>
      <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden>
        <circle cx="13" cy="13" r="12" stroke="currentColor" strokeOpacity=".3" />
        <path d="M2 15.5c3.5-2.6 7-2.6 11 0s7.5 2.6 11 0" stroke="#E8865E" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="13" cy="9" r="3.2" fill="#E8865E" />
      </svg>
      <span className="font-['Outfit',system-ui,sans-serif] text-[22px] font-bold tracking-[-0.03em]">Worldline</span>
    </a>
  )
}
/** Topographic contour lines (deterministic SVG paths) */
function Topo({ width, height, color, opacity, cx, cy, rings }: { width: number; height: number; color: string; opacity: number; cx: number; cy: number; rings: number }) {
  const paths = Array.from({ length: rings }, (_, k) => {
    const r0 = 30 + k * 34
    const pts: string[] = []
    for (let a = 0; a <= 360; a += 6) {
      const t = (a * Math.PI) / 180
      const r = r0 * (1 + 0.16 * Math.sin(t * 3 + k * 0.35) + 0.08 * Math.sin(t * 5 - k * 0.5) + 0.05 * Math.cos(t * 2 + k))
      pts.push(`${(cx + Math.cos(t) * r * 1.35).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`)
    }
    return 'M' + pts.join(' L') + 'Z'
  })
  return (
    <svg className="pointer-events-none absolute left-0 top-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeOpacity={opacity * (i % 5 === 0 ? 1.8 : 1)} strokeWidth={i % 5 === 0 ? 1.4 : 1} strokeLinejoin="round" />
      ))}
    </svg>
  )
}
