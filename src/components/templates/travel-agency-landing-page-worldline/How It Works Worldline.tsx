/*
 * HowItWorks — how booking works, in three steps. (Nature / outdoor style)
 * 100% self-contained.
 * Needs: only React 18 + Tailwind CSS. Fonts load from Google Fonts (no npm package).
 */
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { DESTINATION_IMAGES, type StepItem } from '../../../i18n/translations'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600&family=Noto+Sans+Georgian:wght@400;500;600;700&display=swap'

const FRAME_H = 1200

const PREVIEW_IMG = DESTINATION_IMAGES.brienz

export default function HowItWorks() {
  return <Responsive desktop={<Desktop />} mobile={<Mobile />} />
}

function Desktop() {
  const { isKa, t, typo } = useLanguage()
  return (
    <Artboard height={FRAME_H} id="how" className="bg-[#ECEEE8]">
      <Topo width={1600} height={FRAME_H} color="#1F3A2E" opacity={0.07} cx={1350} cy={160} rings={22} />
      <div style={at(120, 128)}>
        <Reveal>
          <Label isKa={isKa}>{t.howItWorks.label}</Label>
        </Reveal>
      </div>
      <div style={at(120, 178, 920)}>
        <Reveal delay={200}>
          <h2
            className={`${typo.headingFontClass} font-bold text-[#1F3A2E] ${
              isKa ? 'text-[62px] leading-[1.04] tracking-[-0.02em]' : 'text-[92px] leading-[0.95] tracking-[-0.035em]'
            }`}
          >
            {t.howItWorks.titleLine1}
            <br />
            <span className="text-[#E9824B]">{t.howItWorks.titleLine2}</span>
          </h2>
        </Reveal>
      </div>
      <div style={at(1060, 214, 420)}>
        <Reveal delay={300}>
          <p className={`text-[#19231C]/70 ${isKa ? 'text-[16.5px] leading-[1.6]' : 'text-[19px] leading-[1.6]'}`}>
            {t.howItWorks.description}
          </p>
        </Reveal>
      </div>
      {/* the trail between the waypoints */}
      <svg style={at(120, 452, 1360, 60)} viewBox="0 0 1360 60" aria-hidden>
        <path
          d="M12 40 C 160 6, 300 6, 470 30 S 760 58, 932 26 S 1200 4, 1350 34"
          fill="none"
          stroke="#1F3A2E"
          strokeOpacity=".35"
          strokeWidth="2"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        {[
          [12, 40],
          [470, 30],
          [932, 26],
        ].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="11" fill="#E9824B" fillOpacity=".18" />
            <circle cx={x} cy={y} r="5" fill="#E9824B" />
          </g>
        ))}
        <path d="M1342 26 l10 8 -10 8" fill="none" stroke="#1F3A2E" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.howItWorks.steps.map((s, i) => (
        <div key={s.art} style={at(120 + i * 461, 534, 437, 560)}>
          <Reveal delay={350 + i * 110} className="h-full">
            <StepCard step={s} />
          </Reveal>
        </div>
      ))}
    </Artboard>
  )
}

function StepCard({ step }: { step: StepItem }) {
  const { isKa, typo } = useLanguage()
  return (
    <Tilt className="h-full rounded-[32px]" max={3}>
      <div className="group flex h-full flex-col rounded-[32px] border border-[#1F3A2E]/[0.07] bg-[#F6F8F4] p-[24px] shadow-[0_1px_2px_rgba(30,58,47,.06),0_12px_30px_-18px_rgba(30,58,47,.25)] transition-shadow duration-700 hover:shadow-[0_1px_2px_rgba(30,58,47,.06),0_40px_60px_-30px_rgba(30,58,47,.45)]">
        <div className={`flex items-center justify-between ${isKa ? 'text-[13.5px]' : 'text-[15px]'}`}>
          <span className="rounded-full bg-[#1F3A2E] px-[10px] py-[4px] text-[#ECEEE8]">{step.wp}</span>
          <span className="text-[#1F3A2E]/55">{step.label}</span>
        </div>
        <div className="mt-[18px] h-[236px] overflow-hidden rounded-[22px] bg-[#14261E] [&>*]:transition-transform [&>*]:duration-[1400ms] [&>*]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&>*]:scale-[1.04]">
          <StepArt kind={step.art} />
        </div>
        <h3
          className={`mt-[24px] ${typo.headingFontClass} font-semibold text-[#1F3A2E] ${
            isKa ? 'text-[26px] leading-[1.12] tracking-[-0.015em]' : 'text-[34px] leading-none tracking-[-0.02em]'
          }`}
        >
          {step.title}
        </h3>
        <p className={`mt-[12px] text-[#19231C]/70 ${isKa ? 'text-[14px] leading-[1.6]' : 'text-[16px] leading-[1.55]'}`}>
          {step.text}
        </p>
        <div className={`mt-auto flex items-center gap-2 pt-[14px] text-[#6E8B4E] ${isKa ? 'text-[13.5px]' : 'text-[15px]'}`}>
          <Pin />
          {step.foot}
        </div>
      </div>
    </Tilt>
  )
}

function Mobile() {
  const { isKa, t, typo } = useLanguage()
  return (
    <section id="how" className="relative overflow-hidden bg-[#ECEEE8] px-5 py-20">
      <Topo width={390} height={900} color="#1F3A2E" opacity={0.07} cx={330} cy={80} rings={14} />
      <div className="relative">
        <Reveal>
          <Label isKa={isKa}>{t.howItWorks.label}</Label>
        </Reveal>
        <Reveal delay={200}>
          <h2
            className={`mt-5 ${typo.headingFontClass} font-bold text-[#1F3A2E] ${
              isKa ? 'text-[36px] leading-[1.1] tracking-[-0.02em]' : 'text-[50px] leading-[0.95] tracking-[-0.035em]'
            }`}
          >
            {t.howItWorks.titleLine1} <span className="text-[#E9824B]">{t.howItWorks.titleLine2}</span>
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <p className={`mt-5 text-[#19231C]/70 ${isKa ? 'text-[14.5px] leading-[1.6]' : 'text-[16px] leading-[1.6]'}`}>
            {t.howItWorks.description}
          </p>
        </Reveal>
        <div className="mt-10 flex flex-col gap-4">
          {t.howItWorks.steps.map((s, i) => (
            <Reveal key={s.art} delay={i * 100}>
              <div className="rounded-[26px] bg-[#F6F8F4] p-5">
                <span className={`rounded-full bg-[#1F3A2E] px-[10px] py-[4px] text-[#ECEEE8] ${isKa ? 'text-[13px]' : 'text-[15px]'}`}>{s.wp}</span>
                <h3
                  className={`mt-4 ${typo.headingFontClass} font-semibold text-[#1F3A2E] ${
                    isKa ? 'text-[24px] leading-[1.12] tracking-[-0.015em]' : 'text-[30px] leading-none tracking-[-0.02em]'
                  }`}
                >
                  {s.title}
                </h3>
                <p className={`mt-2 text-[#19231C]/70 ${isKa ? 'text-[14px] leading-[1.6]' : 'text-[16px] leading-[1.55]'}`}>{s.text}</p>
                <div className="mt-5 h-[210px] overflow-hidden rounded-[20px] bg-[#14261E]">
                  <StepArt kind={s.art} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Small product mock-ups (inline SVG + local generated preview) */
function StepArt({ kind }: { kind: 'search' | 'preview' | 'ticket' }) {
  const { isKa, t } = useLanguage()
  const svgFont = isKa ? 'Noto Sans Georgian, Figtree, sans-serif' : 'Figtree, sans-serif'
  const svgHeadFont = isKa ? 'Noto Sans Georgian, Outfit, sans-serif' : 'Outfit, sans-serif'
  if (kind === 'search')
    return (
      <svg viewBox="0 0 389 236" className="h-full w-full" aria-hidden>
        <TopoLines w={389} h={236} />
        <text x="194" y="56" textAnchor="middle" fontFamily={svgHeadFont} fontWeight="600" fontSize={isKa ? '20' : '24'} fill="#ECEEE8">
          {t.howItWorks.artSearchTitle}
        </text>
        <rect x="24" y="76" width="341" height="48" rx="24" fill="#F6F8F4" />
        <path d="M44 93a6 6 0 0 1 12 0c0 5-6 11-6 11s-6-6-6-11Z" fill="#E9824B" />
        <circle cx="50" cy="93" r="2.2" fill="#F6F8F4" />
        <text x="66" y="105" fontFamily={svgFont} fontSize={isKa ? '11.5' : '13.5'} fontWeight="500" fill="#19231C">
          {t.howItWorks.artSearchQuery}
        </text>
        <rect x={isKa ? 240 : 226} y="92" width="1.8" height="17" fill="#E9824B">
          <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite" />
        </rect>
        <rect x="284" y="82" width="74" height="36" rx="18" fill="#E9824B" />
        <text x="321" y="104" textAnchor="middle" fontFamily={svgFont} fontSize={isKa ? '11' : '12'} fontWeight="600" fill="#fff">
          {t.howItWorks.artSearchButton}
        </text>
        {t.howItWorks.artSearchChips.map(([l, x]) => (
          <g key={l}>
            <rect x={x} y="140" width={l.length * (isKa ? 7.2 : 6.6) + 20} height="26" rx="13" fill="none" stroke="#ECEEE8" strokeOpacity=".25" />
            <text x={x + 10} y="157" fontFamily={svgFont} fontSize={isKa ? '10' : '11'} fill="#ECEEE8" fillOpacity=".8">
              {l}
            </text>
          </g>
        ))}
        <rect x="24" y="210" width="341" height="4" rx="2" fill="#ECEEE8" fillOpacity=".12" />
        <rect x="24" y="210" width="256" height="4" rx="2" fill="#E9824B" />
      </svg>
    )
  if (kind === 'preview')
    return (
      <div className="relative h-full w-full">
        <img
          src={PREVIEW_IMG}
          alt={t.howItWorks.artPreviewAlt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover [object-position:50%_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,170,110,.18)_0%,rgba(0,0,0,0)_45%,rgba(20,38,31,.45)_100%)]" />
        <div
          className={`absolute left-[12px] top-[12px] flex items-center gap-[6px] rounded-full bg-[#14261E]/55 px-[10px] py-[5px] text-white backdrop-blur-md ${
            isKa ? 'text-[13px]' : 'text-[15px]'
          }`}
        >
          <span className="h-[7px] w-[7px] rounded-full bg-[#E9824B]" />
          {t.howItWorks.artPreviewBadge}
        </div>
        <div className="absolute bottom-[12px] left-[12px] right-[12px] flex items-center gap-[10px] rounded-full bg-[#14261E]/55 px-[12px] py-[7px] backdrop-blur-md">
          <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden>
            <path d="M0 0 L9 5 L0 10Z" fill="#fff" />
          </svg>
          <div className="relative h-[2px] flex-1 rounded bg-white/30">
            <div className="absolute inset-y-0 left-0 w-[58%] rounded bg-[#E9824B]" />
            <div className="absolute left-[58%] top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        </div>
      </div>
    )
  return (
    <svg viewBox="0 0 389 236" className="h-full w-full" aria-hidden>
      <TopoLines w={389} h={236} />
      <g transform="translate(32 32) rotate(-3 162 86)">
        <rect width="325" height="172" rx="18" fill="#F6F8F4" />
        <rect x="236" width="89" height="172" rx="18" fill="#E2E7DC" />
        <path d="M236 12 V160" stroke="#1F3A2E" strokeOpacity=".3" strokeDasharray="3 5" />
        <text x="18" y="76" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="38" fill="#1F3A2E">
          {t.howItWorks.artTicketFrom}
        </text>
        <path d="M104 64 h30 m-8 -6 8 6 -8 6" stroke="#E9824B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="144" y="76" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="38" fill="#1F3A2E">
          {t.howItWorks.artTicketTo}
        </text>
        {t.howItWorks.artTicketFields.map(([k, v, x]) => (
          <g key={k}>
            <text x={x} y="110" fontFamily={svgFont} fontSize={isKa ? '10' : '11'} fill="#1F3A2E" fillOpacity=".55">
              {k}
            </text>
            <text x={x} y="128" fontFamily={svgFont} fontSize={isKa ? '11.5' : '13'} fontWeight="600" fill="#19231C">
              {v}
            </text>
          </g>
        ))}
        <text x="18" y="156" fontFamily={svgFont} fontSize={isKa ? '10.5' : '12'} fill="#4F6F3B" fontWeight="600">
          {t.howItWorks.artTicketConfirmed}
        </text>
        <text x="280" y="70" textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="30" fill="#1F3A2E">
          {t.howItWorks.artTicketPrice}
        </text>
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={250 + i * 3.8} y="116" width={i % 3 ? 1.6 : 2.6} height="32" fill="#1F3A2E" />
        ))}
      </g>
    </svg>
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
  const { typo } = useLanguage()
  const d = useIsDesktop()
  return <div className={`${typo.bodyFontClass} text-[#19231C] antialiased`}>{d ? desktop : mobile}</div>
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
/** Card that tilts toward the pointer with a damped, spring-like follow and a soft light reflection. */
function Tilt({ children, className = '', max = 4 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(hover: none)').matches) return
    let tx = 0, ty = 0, tl = 0, cx = 0, cy = 0, cl = 0, raf = 0
    const tick = () => {
      cx += (tx - cx) * 0.1
      cy += (ty - cy) * 0.1
      cl += (tl - cl) * 0.1
      el.style.transform = `perspective(1100px) rotateX(${cy.toFixed(3)}deg) rotateY(${cx.toFixed(3)}deg) translate3d(0, ${(-cl).toFixed(2)}px, 0)`
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(tl - cl) > 0.005 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      tx = px * max * 2
      ty = -py * max * 2
      tl = 6
      el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`)
      el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`)
      kick()
    }
    const leave = () => {
      tx = ty = tl = 0
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])
  return (
    <div ref={ref} className={`group/tilt relative will-change-transform ${className}`}>
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(420px_circle_at_var(--gx,50%)_var(--gy,0%),rgba(255,255,255,.16),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100" />
    </div>
  )
}
function Label({ children, light, isKa }: { children: React.ReactNode; light?: boolean; isKa?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-[10px] font-semibold ${isKa ? 'text-[14px]' : 'text-[16px]'} ${light ? 'text-[#F2A26A]' : 'text-[#C25E2C]'}`}>
      <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
        <path d="M1 9 L7 3 L11 6 L15 1 L21 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}
function Pin() {
  return (
    <svg width="11" height="13" viewBox="0 0 14 16" aria-hidden>
      <path d="M1.5 6.2a5.5 5.5 0 0 1 11 0c0 4.3-5.5 9-5.5 9s-5.5-4.7-5.5-9Z" fill="currentColor" />
      <circle cx="7" cy="6.2" r="1.9" fill="#F6F8F4" />
    </svg>
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
function TopoLines({ w, h }: { w: number; h: number }) {
  return (
    <g opacity=".5">
      {Array.from({ length: 9 }, (_, k) => {
        const pts: string[] = []
        for (let x = 0; x <= w; x += 12) pts.push(`${x},${(h * 0.12 + k * 26 + Math.sin(x / 40 + k) * 8 + Math.sin(x / 17 - k * 2) * 3).toFixed(1)}`)
        return <path key={k} d={'M' + pts.join(' L')} fill="none" stroke="#6E8B4E" strokeOpacity=".35" strokeWidth="1" />
      })}
    </g>
  )
}
