/*
 * Numbers — "We do every tour before we sell it." Six facts in a grid, plus a marquee of popular places. (Nature / outdoor style)
 * 100% self-contained.
 * Needs: only React 18 + Tailwind CSS. Fonts load from Google Fonts (no npm package).
 */
import { useEffect, useRef, useState } from 'react'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap'

const FRAME_H = 1080

/** Example figures — replace with your real numbers. */
const STATS = [
  { value: '4,800', label: 'Tours on the site', text: 'Each one checked by someone on our team before it goes live.', icon: 'check' as const },
  { value: '4.9', suffix: 'out of 5', label: 'Average tour rating', text: 'From travellers who finished a tour in the last 12 months.', icon: 'star' as const },
  { value: '$0', label: 'Booking fee', text: 'The price on the tour page is the price you pay.', icon: 'tag' as const, featured: true },
  { value: '120', label: 'Countries', text: 'Most trips are in Asia, with more added every season.', icon: 'globe' as const },
  { value: '24/7', label: 'Help while you travel', text: 'Call or WhatsApp a real person, in Bangla or English.', icon: 'phone' as const },
  { value: '100%', label: 'Tours with a 3D preview', text: 'Look around the hotel and the route before you pay.', icon: 'cube' as const },
]
const STAGES = ["Cox's Bazar", 'Sajek Valley', 'Pokhara', 'Kathmandu', 'Sylhet tea gardens', 'Bali', 'Maldives', 'Kyoto', 'Cappadocia', 'Hunza Valley', 'Phuket', 'Santorini']

export default function Numbers() {
  return <Responsive desktop={<Desktop />} mobile={<Mobile />} />
}

function Desktop() {
  return (
    <Artboard height={FRAME_H} id="numbers" className="bg-[#F6F8F4]">
      <Topo width={1600} height={FRAME_H} color="#1F3A2E" opacity={0.05} cx={1400} cy={180} rings={20} />
      <div style={at(120, 128)}>
        <Reveal>
          <Label>Why people book with us</Label>
        </Reveal>
      </div>
      <div style={at(120, 178, 900)}>
        <Reveal delay={150}>
          <h2 className="font-['Outfit',system-ui,sans-serif] text-[92px] font-bold leading-[0.95] tracking-[-0.035em] text-[#1F3A2E]">
            We do every tour
            <br />
            <span className="text-[#E9824B]">before we sell it.</span>
          </h2>
        </Reveal>
      </div>
      <div style={at(1060, 214, 420)}>
        <Reveal delay={250}>
          <p className="text-[18px] leading-[1.6] text-[#19231C]/70">
            Someone from our team has stayed at the hotels and walked the routes before a tour goes on the site. The price you see includes everything on the itinerary.
          </p>
        </Reveal>
      </div>
      {STATS.map((st, i) => (
        <div key={st.label} style={at(120 + (i % 3) * 461, 420 + Math.floor(i / 3) * 252, 437, 228)}>
          <Reveal delay={200 + i * 90} className="h-full">
            <StatCard stat={st} />
          </Reveal>
        </div>
      ))}
      <div style={at(0, 946, 1600)}>
        <Marquee duration={46} copies={3} reverse>
          {STAGES.map((s) => (
            <Stage key={s} label={s} />
          ))}
        </Marquee>
      </div>
    </Artboard>
  )
}

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const featured = 'featured' in stat && stat.featured
  return (
    <div
      className={`group flex h-full flex-col justify-between gap-[22px] rounded-[26px] p-[28px] transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[4px] ${
        featured
          ? 'bg-[#1F3A2E] text-[#ECEEE8] shadow-[0_30px_50px_-30px_rgba(30,58,47,.7)]'
          : 'border border-[#1F3A2E]/10 bg-white text-[#1F3A2E] shadow-[0_1px_2px_rgba(30,58,47,.05)] hover:shadow-[0_30px_50px_-34px_rgba(30,58,47,.45)]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-[10px]">
          <span className="font-['Outfit',system-ui,sans-serif] text-[68px] font-bold leading-[0.9] tracking-[-0.04em] [font-variant-numeric:tabular-nums]">
            <CountUp value={stat.value} />
          </span>
          {'suffix' in stat && <span className={`text-[17px] ${featured ? 'text-[#ECEEE8]/60' : 'text-[#19231C]/50'}`}>{stat.suffix}</span>}
        </div>
        <span className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${featured ? 'bg-[#E9824B] text-[#14261E]' : 'bg-[#E9824B]/[0.12] text-[#C25F2C]'}`}>
          <StatIcon kind={stat.icon} />
        </span>
      </div>
      <div>
        <div className="text-[19px] font-semibold">{stat.label}</div>
        <p className={`mt-[6px] text-[16px] leading-[1.5] ${featured ? 'text-[#ECEEE8]/70' : 'text-[#19231C]/65'}`}>{stat.text}</p>
      </div>
    </div>
  )
}
function Stage({ label }: { label: string }) {
  return (
    <div className="mr-[14px] flex h-[58px] shrink-0 items-center gap-[12px] rounded-full border-[1.5px] border-[#1F3A2E]/15 bg-[#F6F8F4] px-[22px] text-[17px] font-medium text-[#1F3A2E] transition-colors duration-300 hover:border-[#1F3A2E] hover:bg-[#1F3A2E] hover:text-[#ECEEE8]">
      <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
        <path d="M1.5 6.2a5.5 5.5 0 0 1 11 0c0 4.3-5.5 9-5.5 9s-5.5-4.7-5.5-9Z" fill="#E9824B" />
        <circle cx="7" cy="6.2" r="1.9" fill="#F6F8F4" />
      </svg>
      {label}
    </div>
  )
}
function StatIcon({ kind }: { kind: 'check' | 'star' | 'tag' | 'globe' | 'phone' | 'cube' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      {kind === 'check' && <path {...p} d="M4 12.5 9 17.5 20 6.5" />}
      {kind === 'star' && <path {...p} d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z" />}
      {kind === 'tag' && (
        <>
          <path {...p} d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9Z" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        </>
      )}
      {kind === 'globe' && (
        <>
          <circle {...p} cx="12" cy="12" r="8.5" />
          <path {...p} d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" />
        </>
      )}
      {kind === 'phone' && <path {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />}
      {kind === 'cube' && <path {...p} d="m12 3 8 4.5v9L12 21l-8-4.5v-9Zm0 0v18M4 7.5l8 4.5 8-4.5" />}
    </svg>
  )
}

function Mobile() {
  return (
    <section id="numbers" className="relative overflow-hidden bg-[#F6F8F4] py-20">
      <Topo width={390} height={1600} color="#1F3A2E" opacity={0.05} cx={340} cy={120} rings={14} />
      <div className="relative px-5">
        <Reveal>
          <Label>Why people book with us</Label>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="mt-5 font-['Outfit',system-ui,sans-serif] text-[48px] font-bold leading-[0.95] tracking-[-0.035em] text-[#1F3A2E]">
            We do every tour <span className="text-[#E9824B]">before we sell it.</span>
          </h2>
        </Reveal>
        <Reveal delay={250}>
          <p className="mt-5 text-[16px] leading-[1.6] text-[#19231C]/70">
            Someone from our team has stayed at the hotels and walked the routes before a tour goes on the site. The price you see includes everything on the itinerary.
          </p>
        </Reveal>
        <div className="mt-10 flex flex-col gap-3">
          {STATS.map((st, i) => (
            <Reveal key={st.label} delay={i * 70}>
              <StatCard stat={st} />
            </Reveal>
          ))}
        </div>
      </div>
      <div className="relative mt-8">
        <Marquee duration={34} copies={3} reverse>
          {STAGES.map((s) => (
            <Stage key={s} label={s} />
          ))}
        </Marquee>
      </div>
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
  return <div className="font-['Figtree',system-ui,sans-serif] text-[#19231C] antialiased">{d ? desktop : mobile}</div>
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
/** Counts a number up from zero when it scrolls into view. Leaves values like "24/7" as they are. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, 0.4)
  const [text, setText] = useState(value)
  useEffect(() => {
    const m = value.match(/^(\D*)([\d,.]+)(\D*)$/)
    if (!m || !inView || usePrefersReducedStatic()) {
      setText(value)
      return
    }
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, ''))
    const decimals = (num.split('.')[1] || '').length
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1600)
      const e = 1 - Math.pow(1 - p, 4)
      setText(pre + (target * e).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])
  return <span ref={ref}>{text}</span>
}
function usePrefersReducedStatic() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function Marquee({ children, duration = 40, copies = 2, reverse = false }: { children: React.ReactNode; duration?: number; copies?: number; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const end = `translateX(-${100 / copies}%)`
    const a = el.animate(reverse ? [{ transform: end }, { transform: 'translateX(0)' }] : [{ transform: 'translateX(0)' }, { transform: end }], {
      duration: duration * 1000,
      iterations: Infinity,
      easing: 'linear',
    })
    const pause = () => a.pause()
    const play = () => a.play()
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', play)
    return () => {
      a.cancel()
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', play)
    }
  }, [duration, copies, reverse])
  return (
    <div className="overflow-hidden">
      <div ref={ref} className="flex w-max">
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} className="flex shrink-0" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
function Label({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[10px] text-[16px] font-semibold ${light ? 'text-[#F2A36A]' : 'text-[#C25F2C]'}`}>
      <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
        <path d="M1 9 L7 3 L11 6 L15 1 L21 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {children}
    </span>
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
