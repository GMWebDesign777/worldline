/*
 * Hero — "One sentence. A whole world."
 * A scroll-driven, photoreal 3D film: the camera glides to a desk in golden-hour light,
 * the laptop opens, a sentence is typed, Enter is pressed and the camera dives into the
 * world that appears on the screen.
 *
 * 100% self-contained.
 * Needs: only React 18 + Tailwind CSS. Fonts load from Google Fonts (no npm package).
 * The 3D engine (three.js r160) is loaded at runtime with a <script> tag from jsDelivr (unpkg as backup) — nothing to install.
 */
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { DESTINATION_IMAGES } from '../../../i18n/translations'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600&family=Noto+Sans+Georgian:wght@400;500;600;700&display=swap'
/** three.js r160 (plain script build), tried in order until one loads. */
const THREE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
  'https://unpkg.com/three@0.160.0/build/three.min.js',
]
/** Shown instead of the 3D film if it cannot run (no WebGL, or the script is blocked). */
const FALLBACK_IMG = DESTINATION_IMAGES.brienz

/** The search typed on the laptop. */
const QUERY = 'Lake Brienz, Switzerland · 5 days in May'

/** Scroll-timeline (in "film seconds"). The whole hero is one scroll-scrubbed film. */
const DURATION = 18
const T = {
  approachEnd: 8.2,
  lidStart: 2.4, lidEnd: 4.6,
  powerStart: 4.7, powerEnd: 5.4,
  barStart: 5.4, barEnd: 6.2,
  typeStart: 6.4, typeEnd: 9.0,
  enter: 9.4,
  worldFadeStart: 9.7, worldFadeEnd: 10.4,
  diveStart: 10.0, diveEnd: 12.2,
  innerEnd: 17.2,
}

/* ------------------------------------------------------------------ */
/*  Section                                                           */
/* ------------------------------------------------------------------ */
export default function Hero() {
  useGoogleFonts()
  const { isKa, t, typo } = useLanguage()
  const isDesktop = useIsDesktop()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const cap1Ref = useRef<HTMLDivElement>(null)
  const cap2Ref = useRef<HTMLDivElement>(null)
  const outroRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    let engine: Engine | null = null
    let raf = 0
    let frameTimer = 0
    let alive = true
    let shown = 0
    let tSmooth = 0
    let last = performance.now()
    const params = new URLSearchParams(location.search)
    const forcedT = params.has('t') ? parseFloat(params.get('t') || '0') : null

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas')
      const gl = probe.getContext('webgl2') || probe.getContext('webgl')
      if (!gl) return true
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER
      const gpu = String(gl.getParameter(param) || '')
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu)
    })()

    const afterDraw = (cb: () => void) => {
      const gl = engine?.gl as WebGL2RenderingContext | undefined
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameTimer = window.setTimeout(cb, 80)
        return
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
      gl.flush()
      const poll = () => {
        if (!alive) {
          if (sync) gl.deleteSync(sync)
          return
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS)
        if (state === gl.UNSIGNALED) {
          frameTimer = window.setTimeout(poll, 5)
        } else {
          if (sync) gl.deleteSync(sync)
          frameTimer = window.setTimeout(cb, 80)
        }
      }
      frameTimer = window.setTimeout(poll, 5)
    }

    const setStyle = (el: HTMLElement | null, o: number, y = 0) => {
      if (!el) return
      el.style.opacity = String(o)
      el.style.transform = `translate3d(0, ${y}px, 0)`
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
    }

    const loop = (now: number) => {
      if (!alive || !engine) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const rect = section.getBoundingClientRect()
      const span = Math.max(1, rect.height - window.innerHeight)
      const progress = clamp01(-rect.top / span)
      const forced = (window as unknown as { __heroT?: number }).__heroT ?? forcedT
      const target = forced ?? progress * DURATION
      tSmooth = forced ?? tSmooth + (target - tSmooth) * (1 - Math.exp(-dt * 5))
      const t = tSmooth

      // only render while the hero is (partly) on screen
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight
      if (onScreen) {
        engine.render(t, now / 1000, dt)
        shown = Math.min(1, shown + dt * 1.2)
        engine.setFade(forcedT !== null ? 1 : shown)
      }

      // overlays
      const intro = 1 - seg(t, 0.25, 1.6)
      setStyle(introRef.current, intro, -40 * (1 - intro))
      setStyle(hintRef.current, (1 - seg(t, 0.05, 0.6)) * Math.min(1, shown * 2))
      const c1 = seg(t, 2.2, 3.0) * (1 - seg(t, 4.4, 5.2))
      setStyle(cap1Ref.current, c1, 14 * (1 - c1))
      const c2 = seg(t, 6.0, 6.6) * (1 - seg(t, 9.2, 9.8))
      setStyle(cap2Ref.current, c2, 14 * (1 - c2))
      const o = seg(t, 13.0, 14.4)
      setStyle(outroRef.current, o, 30 * (1 - o))
      if (barRef.current) barRef.current.style.transform = `scaleX(${t / DURATION})`
      if (isSoftwareGl && onScreen) {
        afterDraw(() => {
          if (alive) raf = requestAnimationFrame(loop)
        })
      } else {
        raf = requestAnimationFrame(loop)
      }
    }

    loadThree()
      .then((THREE) => {
        if (!alive) return
        engine = createEngine(THREE, canvas, { query: QUERY, isSoftwareGl })
        const onResize = () => engine?.resize()
        window.addEventListener('resize', onResize)
        engine.resize()
        setStatus('ready')
        ;(window as unknown as { __heroReady: boolean }).__heroReady = true
        raf = requestAnimationFrame(loop)
        cleanupResize = () => window.removeEventListener('resize', onResize)
      })
      .catch((err) => {
        console.error('[Hero] 3D film could not start:', err)
        if (alive) setStatus('error')
      })

    let cleanupResize = () => {}
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearTimeout(frameTimer)
      cleanupResize()
      engine?.dispose()
    }
  }, [])

  return (
    <>
      <Navbar isDesktop={isDesktop} />
      <section
        ref={sectionRef}
        className={`relative ${status === 'error' ? 'h-screen' : 'h-[720vh]'} bg-[#0e0c0a] ${typo.bodyFontClass} text-[#F5EEE6] antialiased`}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* poster shown while the 3D scene loads */}
          <div
            className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_40%,#5a3d2a_0%,#1d1611_55%,#0e0c0a_100%)] transition-opacity duration-[1200ms] ${
              status === 'ready' ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <canvas ref={canvasRef} data-testid="hero-canvas" className="absolute inset-0 h-full w-full" />
          {status === 'error' && (
            <div className="absolute inset-0">
              <img src={FALLBACK_IMG} alt={t.hero.fallbackAlt} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,12,10,.75)_0%,rgba(14,12,10,.35)_55%,rgba(14,12,10,.1)_100%)]" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,.55)_0%,rgba(14,12,10,0)_22%,rgba(14,12,10,0)_62%,rgba(14,12,10,.65)_100%)]" />

          {/* Intro copy */}
          <div
            ref={introRef}
            className={
              isDesktop
                ? 'absolute bottom-[11vh] left-[6vw] max-w-[min(920px,62vw)]'
                : 'absolute bottom-[14vh] left-5 right-5'
            }
          >
            <Badge isKa={isKa}>{t.hero.badge}</Badge>
            <h1
              className={`mt-5 ${typo.headingFontClass} font-bold ${
                isKa
                  ? isDesktop
                    ? 'text-[clamp(42px,4.5vw,78px)] leading-[1.06] tracking-[-0.02em]'
                    : 'text-[38px] leading-[1.08] tracking-[-0.02em]'
                  : isDesktop
                    ? 'text-[clamp(52px,5.6vw,96px)] leading-[0.92] tracking-[-0.045em]'
                    : 'text-[50px] leading-[0.92] tracking-[-0.045em]'
              }`}
            >
              {t.hero.titleLine1}
              <br />
              <span className="text-[#F3A26B]">{t.hero.titleLine2}</span>
            </h1>
            <p
              className={`mt-5 max-w-[520px] text-[#F5EEE6]/80 ${
                isKa
                  ? isDesktop
                    ? 'text-[16.5px] leading-[1.55]'
                    : 'text-[14.5px] leading-[1.55]'
                  : isDesktop
                    ? 'text-[19px] leading-[1.5]'
                    : 'text-[16px] leading-[1.5]'
              }`}
            >
              {t.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#start" variant="light" isKa={isKa}>{t.hero.ctaPrimary}</Button>
              <Button href="#destinations" variant="ghost" isKa={isKa}>{t.hero.ctaSecondary}</Button>
            </div>
          </div>

          {/* scroll hint */}
          <div ref={hintRef} className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center opacity-0">
            <div className={`${isKa ? 'text-[13px]' : 'text-[15px]'} text-[#F5EEE6]/70`}>{t.hero.scrollHint}</div>
            <div className="mx-auto mt-3 h-10 w-px overflow-hidden bg-[#F5EEE6]/20">
              <ScrollLine />
            </div>
          </div>

          {/* film captions */}
          <Caption refEl={cap1Ref} isKa={isKa} headingFontClass={typo.headingFontClass}>{t.hero.caption1}</Caption>
          <Caption refEl={cap2Ref} isKa={isKa} headingFontClass={typo.headingFontClass}>{t.hero.caption2}</Caption>

          {/* Outro inside the world: the search result */}
          <div
            ref={outroRef}
            data-testid="hero-outro"
            className={isDesktop ? 'absolute bottom-[10vh] left-[6vw] right-[6vw] opacity-0' : 'absolute bottom-[7vh] left-5 right-5 opacity-0'}
          >
            <div className={`flex items-center gap-2 ${isKa ? 'text-[13.5px]' : 'text-[15px]'} text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,.4)]`}>
              <span className="h-[6px] w-[6px] rounded-full bg-[#E9875E]" />
              {t.hero.outroBadge}
            </div>
            <h2
              className={`mt-3 ${typo.headingFontClass} font-bold text-white [text-shadow:0_4px_40px_rgba(20,15,30,.45)] ${
                isKa
                  ? isDesktop
                    ? 'text-[clamp(44px,5.1vw,84px)] leading-[1.04] tracking-[-0.02em]'
                    : 'text-[38px] leading-[1.06] tracking-[-0.02em]'
                  : isDesktop
                    ? 'text-[clamp(56px,6.6vw,108px)] leading-[0.92] tracking-[-0.045em]'
                    : 'text-[50px] leading-[0.92] tracking-[-0.045em]'
              }`}
            >
              {t.hero.outroTitle}
            </h2>
            <div className={`mt-6 flex gap-3 ${isDesktop ? '' : 'flex-col'}`}>
              {(isDesktop ? t.hero.tours.slice(0, 3) : t.hero.tours.slice(0, 1)).map((tour) => (
                <a
                  key={tour.name}
                  href="#start"
                  className={`group rounded-[18px] border border-white/15 bg-[#14121A]/35 p-4 text-white backdrop-blur-xl transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[4px] hover:border-white/35 hover:bg-[#14121A]/55 ${
                    isDesktop ? 'w-[290px]' : ''
                  }`}
                >
                  <div className={`flex items-center justify-between ${isKa ? 'text-[13.5px]' : 'text-[15px]'} text-white/60`}>
                    <span>{tour.days}</span>
                    <span>★ {tour.rating}</span>
                  </div>
                  <div className={`mt-2 font-medium leading-tight ${isKa ? 'text-[15.5px]' : 'text-[18px]'}`}>{tour.name}</div>
                  <div className={`mt-1 text-white/65 ${isKa ? 'text-[13px]' : 'text-[15px]'}`}>{tour.detail}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className={`${isKa ? 'text-[13px]' : 'text-[15px]'} text-white/60`}>{t.hero.outroFrom}</span>
                    <span className={`${isKa ? 'text-[20px]' : 'text-[22px]'} font-medium`}>{tour.price}</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-6">
              <Button href="#start" variant="light" isKa={isKa}>{t.hero.outroCta}</Button>
            </div>
          </div>

          {/* film progress */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
            <div ref={barRef} className="h-full origin-left scale-x-0 bg-[#E9875E]" />
          </div>

        </div>
      </section>
    </>
  )
}

function Caption({
  children,
  refEl,
  isKa,
  headingFontClass,
}: {
  children: React.ReactNode
  refEl: React.RefObject<HTMLDivElement | null>
  isKa: boolean
  headingFontClass: string
}) {
  return (
    <div ref={refEl} className="absolute inset-x-5 bottom-[12vh] text-center opacity-0">
      <span
        className={`${headingFontClass} font-medium text-[#F5EEE6] [text-shadow:0_2px_24px_rgba(0,0,0,.55)] ${
          isKa ? 'text-[clamp(18px,2.0vw,28px)] tracking-[-0.01em]' : 'text-[clamp(22px,2.4vw,34px)] tracking-[-0.02em]'
        }`}
      >
        {children}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Navbar (fixed, outside any transformed element)                   */
/* ------------------------------------------------------------------ */
function Navbar({ isDesktop }: { isDesktop: boolean }) {
  const [open, setOpen] = useState(false)
  const { lang, isKa, t, typo, toggleLang } = useLanguage()
  const scale = useDesignScale()
  const dark = 'border border-white/10 bg-[#14261E]/55 backdrop-blur-xl'

  if (isDesktop) {
    return (
      <header className={`absolute inset-x-0 top-0 z-50 flex justify-center ${typo.bodyFontClass} antialiased`}>
        <div style={{ width: 1600, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <div className="mx-[40px] mt-[22px] flex items-center justify-between">
            {/* logo */}
            <div className={`flex h-[58px] items-center rounded-full pl-[18px] pr-[22px] ${dark}`}>
              <Logo />
            </div>
            {/* links on a light pill */}
            <nav className="flex h-[58px] items-center gap-[2px] rounded-full bg-[#F6F9F4] p-[6px] shadow-[0_18px_40px_-20px_rgba(0,0,0,.55)]">
              {t.nav.links.map((l) => (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  className={`relative flex h-full items-center whitespace-nowrap rounded-full font-medium text-[#1E3B2E] transition-colors duration-300 hover:bg-[#1E3B2E] hover:text-[#F6F9F4] ${
                    isKa ? 'px-[16px] text-[14px]' : 'px-[20px] text-[16px]'
                  }`}
                >
                  {l.label}
                  {l.dot && (
                    <span
                      className={`ml-[8px] rounded-full bg-[#E9834B] px-[8px] py-[1px] font-semibold text-[#14261E] ${
                        isKa ? 'text-[12px]' : 'text-[14px]'
                      }`}
                    >
                      {t.nav.newTag}
                    </span>
                  )}
                </a>
              ))}
            </nav>
            {/* language switcher + main action */}
            <div className={`flex h-[58px] items-center gap-[4px] rounded-full p-[6px] ${dark}`}>
              <button
                type="button"
                onClick={toggleLang}
                aria-label={t.nav.langAria}
                data-testid="lang-toggle-desktop"
                className="flex h-full cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-full px-[16px] text-[14px] font-medium tracking-[0.02em] text-[#F5EEE6] transition-colors duration-300 hover:bg-white/10"
              >
                <span className={lang === 'en' ? 'font-semibold text-[#F3A26B]' : 'text-[#F5EEE6]/55'}>EN</span>
                <span className="text-[#F5EEE6]/30">|</span>
                <span className={lang === 'ka' ? 'font-semibold text-[#F3A26B]' : 'text-[#F5EEE6]/55'}>ქარ</span>
              </button>
              <a
                href="#start"
                className={`group flex h-full items-center gap-[8px] whitespace-nowrap rounded-full bg-[#E9834B] font-semibold text-[#14261E] transition-[background-color,transform] duration-300 hover:bg-[#F3A26B] active:scale-[0.97] ${
                  isKa ? 'px-[18px] text-[14px]' : 'px-[20px] text-[16px]'
                }`}
              >
                {t.nav.cta}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-300 group-hover:-rotate-45">
                  <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>
    )
  }
  return (
    <header className={`absolute inset-x-0 top-0 z-50 ${typo.bodyFontClass} text-[#F5EEE6] antialiased`}>
      <div className="mx-3 mt-3 flex items-center justify-between gap-2">
        <div className={`flex h-[52px] items-center rounded-full pl-[14px] pr-[18px] ${dark}`}>
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t.nav.langAria}
            data-testid="lang-toggle-mobile"
            className={`flex h-[52px] cursor-pointer items-center gap-[5px] whitespace-nowrap rounded-full px-[14px] text-[13px] font-medium text-[#F5EEE6] transition-colors duration-300 ${dark}`}
          >
            <span className={lang === 'en' ? 'font-semibold text-[#F3A26B]' : 'text-[#F5EEE6]/55'}>EN</span>
            <span className="text-[#F5EEE6]/30">|</span>
            <span className={lang === 'ka' ? 'font-semibold text-[#F3A26B]' : 'text-[#F5EEE6]/55'}>ქარ</span>
          </button>
          <button
            type="button"
            aria-label={t.nav.menuAria}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative h-[52px] w-[52px] shrink-0 rounded-full bg-[#F6F9F4] text-[#1E3B2E] shadow-[0_12px_30px_-14px_rgba(0,0,0,.6)]"
          >
            <span className={`absolute left-[16px] right-[16px] top-[21px] h-[2px] rounded bg-current transition-transform duration-300 ${open ? 'translate-y-[4px] rotate-45' : ''}`} />
            <span className={`absolute left-[16px] right-[16px] top-[29px] h-[2px] rounded bg-current transition-transform duration-300 ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
      <div className={`mx-3 mt-2 grid overflow-hidden rounded-[24px] bg-[#F6F9F4] text-[#1E3B2E] transition-[grid-template-rows,opacity] duration-500 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <nav className="min-h-0">
          <div className="flex flex-col p-3">
            {t.nav.links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-[14px] px-3 py-3 font-medium hover:bg-[#1E3B2E]/5 ${
                  isKa ? 'text-[16px]' : 'text-[18px]'
                }`}
              >
                {l.label}
                {l.dot && (
                  <span className={`rounded-full bg-[#E9834B] px-2 py-[1px] font-semibold text-[#14261E] ${isKa ? 'text-[12px]' : 'text-[14px]'}`}>
                    {t.nav.newTag}
                  </span>
                )}
              </a>
            ))}
            <a
              href="#start"
              onClick={() => setOpen(false)}
              className={`mt-3 flex h-[52px] items-center justify-center rounded-full bg-[#E9834B] font-semibold text-[#14261E] ${
                isKa ? 'text-[14.5px]' : 'text-[16px]'
              }`}
            >
              {t.nav.cta}
            </a>
          </div>
        </nav>
      </div>
    </header>
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
function useGoogleFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_URL}"]`)) return
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = FONT_URL
    document.head.appendChild(l)
  }, [])
}

function Logo() {
  return (
    <a href="#" className="flex items-center gap-[10px] text-[#F5EEE6]">
      <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden>
        <circle cx="13" cy="13" r="12" stroke="currentColor" strokeOpacity=".35" />
        <path d="M2 15.5c3.5-2.6 7-2.6 11 0s7.5 2.6 11 0" stroke="#E9875E" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="13" cy="9" r="3.2" fill="#E9875E" />
      </svg>
      <span className="font-['Outfit',system-ui,sans-serif] text-[21px] font-bold tracking-[-0.03em]">Worldline</span>
    </a>
  )
}

function Badge({ children, isKa }: { children: React.ReactNode; isKa?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[#F5EEE6]/20 bg-[#F5EEE6]/[0.06] px-3 py-[6px] text-[#F5EEE6]/85 backdrop-blur-md ${
        isKa ? 'text-[13.5px]' : 'text-[15px]'
      }`}
    >
      <span className="h-[6px] w-[6px] rounded-full bg-[#E9875E] shadow-[0_0_12px_#E9875E]" />
      {children}
    </span>
  )
}

function Button({
  href,
  children,
  variant,
  small,
  isKa,
}: {
  href: string
  children: React.ReactNode
  variant: 'light' | 'ghost'
  small?: boolean
  isKa?: boolean
}) {
  const base =
    variant === 'light'
      ? 'bg-[#F5EEE6] text-[#14120E] border-[#F5EEE6]'
      : 'bg-[#F5EEE6]/[0.06] text-[#F5EEE6] border-[#F5EEE6]/25 backdrop-blur-md'
  const sweep = variant === 'light' ? 'bg-[#14120E]' : 'bg-[#F5EEE6]'
  const hoverText = variant === 'light' ? 'group-hover:text-[#F5EEE6]' : 'group-hover:text-[#14120E]'
  const sizeCls = small
    ? isKa
      ? 'h-[44px] px-[18px] text-[13.5px]'
      : 'h-[44px] px-[20px] text-[15px]'
    : isKa
      ? 'h-[52px] px-[22px] text-[14px]'
      : 'h-[52px] px-[26px] text-[16px]'
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center whitespace-nowrap overflow-hidden rounded-full border ${base} ${sizeCls} font-medium transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,.55)] active:scale-[0.97]`}
    >
      <span className={`absolute inset-0 origin-left scale-x-0 ${sweep} transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100`} />
      <span className={`relative block overflow-hidden leading-[1.3] ${hoverText} transition-colors duration-500`}>
        <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">{children}</span>
        <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
          {children}
        </span>
      </span>
    </a>
  )
}

function ScrollLine() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const a = ref.current?.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(100%)' }], {
      duration: 1800,
      iterations: Infinity,
      easing: 'cubic-bezier(0.65,0,0.35,1)',
    })
    return () => a?.cancel()
  }, [])
  return <div ref={ref} className="h-full w-full bg-[#F5EEE6]" />
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

/* ------------------------------------------------------------------ */
/*  three.js loader (runtime, from CDN)                               */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any
let threePromise: Promise<Any> | null = null
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve()
    el.onerror = () => {
      el.remove()
      reject(new Error('Could not load ' + src))
    }
    document.head.appendChild(el)
  })
}
/** Loads three.js with a plain <script> tag (works in any bundler or site builder), with a backup CDN. */
function loadThree(): Promise<Any> {
  if (!threePromise)
    threePromise = (async () => {
      const w = window as unknown as { THREE?: Any }
      const probe = document.createElement('canvas')
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('WebGL is not available')
      if (w.THREE?.WebGLRenderer) return w.THREE
      for (const src of THREE_SOURCES) {
        try {
          await loadScript(src)
          if (w.THREE?.WebGLRenderer) return w.THREE
        } catch {
          /* try the next source */
        }
      }
      throw new Error('three.js could not be loaded from any source')
    })()
  threePromise.catch(() => (threePromise = null))
  return threePromise
}

/* ------------------------------------------------------------------ */
/*  The 3D engine                                                     */
/* ------------------------------------------------------------------ */
type Engine = {
  render: (t: number, time: number, dt: number) => void
  resize: () => void
  setFade: (f: number) => void
  dispose: () => void
  gl: WebGLRenderingContext | WebGL2RenderingContext
}

function createEngine(THREE: Any, canvas: HTMLCanvasElement, opts: { query: string; isSoftwareGl?: boolean }): Engine {
  const mobile = window.innerWidth < 768
  const isSoftwareGl = Boolean(opts.isSoftwareGl)
  const ease = {
    inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    in: (x: number) => x * x * x,
    out: (x: number) => 1 - Math.pow(1 - x, 3),
    smooth: (x: number) => x * x * (3 - 2 * x),
  }
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  const disposables: Any[] = []
  const keep = <X,>(x: X) => {
    disposables.push(x)
    return x
  }

  /* ---------------- renderer ---------------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false })
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.shadowMap.enabled = !isSoftwareGl
  renderer.shadowMap.type = THREE.VSMShadowMap
  let pixelRatio = isSoftwareGl ? 0.75 : Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)

  /* ---------------- noise + procedural textures ---------------- */
  const perm = new Uint8Array(512)
  {
    let s = 1337
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const p = Array.from({ length: 256 }, (_, i) => i)
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  }
  const h2 = (x: number, y: number) => perm[(perm[x & 255] + y) & 255] / 255
  const sm = (t: number) => t * t * (3 - 2 * t)
  function noise2(x: number, y: number, period = 256) {
    const xi = Math.floor(x), yi = Math.floor(y)
    const xf = x - xi, yf = y - yi
    const u = sm(xf), v = sm(yf)
    const X0 = ((xi % period) + period) % period, Y0 = ((yi % period) + period) % period
    const X1 = (X0 + 1) % period, Y1 = (Y0 + 1) % period
    const a = h2(X0, Y0), b = h2(X1, Y0), c = h2(X0, Y1), d = h2(X1, Y1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  function fbm2(x: number, y: number, oct = 4, period = 256) {
    let a = 0.5, f = 1, s = 0
    for (let i = 0; i < oct; i++) {
      s += a * noise2(x * f, y * f, period * f)
      a *= 0.5
      f *= 2
    }
    return s
  }
  const texSize = mobile ? 512 : 1024
  function canvasTex(w: number, h: number, draw: (img: ImageData, w: number, h: number) => void, srgb = true, repeat = false) {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    const img = g.createImageData(w, h)
    draw(img, w, h)
    g.putImageData(img, 0, 0)
    const t = keep(new THREE.CanvasTexture(c))
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }
  const put = (img: ImageData, i: number, r: number, g: number, b: number) => {
    img.data[i] = r
    img.data[i + 1] = g
    img.data[i + 2] = b
    img.data[i + 3] = 255
  }
  const mixc = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)

  // Walnut (desk) — color + roughness
  function woodPair(base: number[], dark: number[], light: number[], w: number, h: number, stretch = 16) {
    const rough: number[] = new Array(w * h)
    const color = canvasTex(w, h, (img) => {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h
          const warp = fbm2(u * 3, v * 6, 4) * 7
          const ring = Math.sin((v * stretch + warp) * Math.PI)
          const fine = noise2(u * 220, v * 900)
          const streak = fbm2(u * 1.5, v * 30, 3)
          let t = 0.5 + 0.5 * ring
          t = Math.pow(t, 1.5) * 0.4 + streak * 0.55 + fine * 0.1
          const c = mixc(mixc(base, dark, clamp01(1 - t)), light, clamp01(t - 0.55))
          const i = (y * w + x) * 4
          put(img, i, c[0], c[1], c[2])
          rough[y * w + x] = 0.38 + (1 - t) * 0.18 + fine * 0.08
        }
    })
    const r = canvasTex(w, h, (img) => {
      for (let k = 0; k < w * h; k++) {
        const v = clamp01(rough[k]) * 255
        put(img, k * 4, v, v, v)
      }
    }, false)
    return { color, rough: r }
  }

  // Oak floor planks
  function floorTex() {
    const w = texSize, h = texSize, rows = 8
    const rough: number[] = new Array(w * h)
    const color = canvasTex(w, h, (img) => {
      for (let y = 0; y < h; y++) {
        const row = Math.floor((y / h) * rows)
        const vy = (y / h) * rows - row
        for (let x = 0; x < w; x++) {
          const off = h2(row, 7) // plank stagger
          const ux = (x / w + off) % 1
          const plank = Math.floor(ux * 2)
          const seed = h2(row * 3 + plank, 11)
          const u = ux * 2 - plank
          const warp = fbm2(u * 2 + seed * 10, vy * 2 + row, 3) * 3
          const grain = 0.5 + 0.5 * Math.sin((vy * 9 + warp + seed * 5) * Math.PI)
          const fine = noise2(x * 0.9, y * 0.12)
          const tint = 0.85 + seed * 0.3
          let c = mixc([118, 80, 52], [168, 122, 82], grain * 0.6 + fine * 0.25)
          c = c.map((v) => v * tint)
          const edge = Math.min(vy, 1 - vy) * h / rows
          const endEdge = Math.min(u, 1 - u) * w / 2
          const seam = Math.min(edge, endEdge) < 1.2 ? 0.35 : 1
          const i = (y * w + x) * 4
          put(img, i, c[0] * seam, c[1] * seam, c[2] * seam)
          rough[y * w + x] = seam < 1 ? 0.9 : 0.5 + fine * 0.15 + (1 - grain) * 0.1
        }
      }
    }, true, true)
    const r = canvasTex(w, h, (img) => {
      for (let k = 0; k < w * h; k++) {
        const v = clamp01(rough[k]) * 255
        put(img, k * 4, v, v, v)
      }
    }, false, true)
    return { color, rough: r }
  }

  // Plaster wall bump
  const plasterBump = canvasTex(512, 512, (img, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = fbm2(x / 32, y / 32, 5, 16) * 0.7 + noise2(x / 3, y / 3, 171) * 0.3
        put(img, (y * w + x) * 4, n * 255, n * 255, n * 255)
      }
  }, false, true)

  // Wool rug
  const rugTex = canvasTex(512, 512, (img, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const u = x / w, v = y / h
        const border = Math.min(u, 1 - u, v, 1 - v)
        const fib = noise2(x * 0.7, y * 0.7) * 0.5 + noise2(x * 2.1, y * 2.1) * 0.5
        let c = [214, 203, 186]
        if (border < 0.06 && border > 0.045) c = [150, 76, 52]
        if (border < 0.03) c = [176, 160, 140]
        const k = 0.82 + fib * 0.3
        put(img, (y * w + x) * 4, c[0] * k, c[1] * k, c[2] * k)
      }
  })

  // Brushed aluminium roughness
  const brushed = canvasTex(512, 512, (img, w, h) => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = noise2(x * 0.02, y * 3.0) * 0.6 + noise2(x * 0.05, y * 8) * 0.4
        const v = (0.28 + n * 0.16) * 255
        put(img, (y * w + x) * 4, v, v, v)
      }
  }, false, true)

  /* ---------------- geometry helpers ---------------- */
  function roundedBox(w: number, h: number, d: number, corner: number, bevel: number, segs = 4) {
    // w along x, d along z (plan view, rounded corners = corner), h height along y with bevel
    const s = new THREE.Shape()
    const W = w / 2 - bevel, D = d / 2 - bevel, r = Math.max(0.0001, Math.min(corner - bevel, W, D))
    s.moveTo(-W + r, -D)
    s.lineTo(W - r, -D)
    s.quadraticCurveTo(W, -D, W, -D + r)
    s.lineTo(W, D - r)
    s.quadraticCurveTo(W, D, W - r, D)
    s.lineTo(-W + r, D)
    s.quadraticCurveTo(-W, D, -W, D - r)
    s.lineTo(-W, -D + r)
    s.quadraticCurveTo(-W, -D, -W + r, -D)
    const g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(0.0001, h - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: segs,
      curveSegments: 10,
    })
    g.translate(0, 0, -(h - bevel * 2) / 2)
    g.rotateX(-Math.PI / 2) // extrusion axis -> y
    // planar UVs in metres (x,z) so textures map naturally
    const p = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getZ(i) / d + 0.5)
    g.computeVertexNormals()
    return keep(g)
  }
  const lathe = (pts: number[][], segs = 48) => keep(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs))

  function mesh(geo: Any, mat: Any, parent: Any, x = 0, y = 0, z = 0, cast = true, receive = true) {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = cast
    m.receiveShadow = receive
    parent.add(m)
    return m
  }
  const std = (o: Any) => keep(new THREE.MeshStandardMaterial(o))
  const phys = (o: Any) => keep(new THREE.MeshPhysicalMaterial(o))

  /* ================================================================ */
  /*  ROOM                                                            */
  /* ================================================================ */
  const room = new THREE.Scene()

  // Environment (soft interior reflections built from a tiny light-box scene)
  {
    const env = new THREE.Scene()
    const boxG = new THREE.BoxGeometry(1, 1, 1)
    const wallM = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.16, 0.12, 0.09), side: THREE.BackSide })
    const roomBox = new THREE.Mesh(boxG, wallM)
    roomBox.scale.set(8, 4, 8)
    roomBox.position.y = 1.5
    env.add(roomBox)
    const panel = (c: number[], w: number, h: number, pos: number[], rot: number[]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(c[0], c[1], c[2]), side: THREE.DoubleSide }))
      m.position.set(pos[0], pos[1], pos[2])
      m.rotation.set(rot[0], rot[1], rot[2])
      env.add(m)
    }
    panel([9, 6.2, 3.8], 1.6, 1.5, [-3.9, 1.7, 0.3], [0, Math.PI / 2, 0]) // window
    panel([0.9, 0.75, 0.6], 6, 6, [0, 3.45, 0], [Math.PI / 2, 0, 0]) // ceiling bounce
    panel([0.55, 0.42, 0.3], 8, 4, [0, 1.5, -3.95], [0, 0, 0]) // back wall
    panel([0.25, 0.16, 0.1], 8, 8, [0, -0.45, 0], [-Math.PI / 2, 0, 0]) // floor
    panel([4, 2.6, 1.4], 0.4, 0.4, [1.5, 2, -3.8], [0, 0, 0]) // lamp
    const pmrem = new THREE.PMREMGenerator(renderer)
    const rt = pmrem.fromScene(env, 0.035)
    room.environment = rt.texture
    keep(rt)
    pmrem.dispose()
    boxG.dispose()
  }

  const camera = new THREE.PerspectiveCamera(36, 1, 0.03, 40)
  room.add(camera)

  // ---- Sun through the window
  const sunDir = V(2.6, -1.22, -1.0).normalize()
  const sunTarget = V(0.0, 1.0, -0.88)
  const sun = new THREE.DirectionalLight(new THREE.Color().setRGB(1.0, 0.7, 0.42), 14)
  sun.position.copy(sunTarget).addScaledVector(sunDir, -7)
  sun.target.position.copy(sunTarget)
  sun.castShadow = true
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -2.6, right: 2.6, top: 2.2, bottom: -2.2, near: 3, far: 12 })
  sun.shadow.radius = 5
  sun.shadow.blurSamples = 16
  sun.shadow.bias = -0.0006
  room.add(sun, sun.target)
  room.add(new THREE.HemisphereLight(0xffeedd, 0x2a1d14, 0.12))

  // ---- Materials
  const wallMat = std({ color: 0xece4d7, roughness: 0.94, bumpMap: plasterBump, bumpScale: 0.06, envMapIntensity: 0.6 })
  plasterBump.repeat.set(7, 3)
  const floorT = floorTex()
  floorT.color.repeat.set(3.2, 3.2)
  floorT.rough.repeat.set(3.2, 3.2)
  const floorMat = std({ map: floorT.color, roughnessMap: floorT.rough, roughness: 1, envMapIntensity: 0.6 })
  const walnut = woodPair([92, 54, 34], [52, 28, 17], [138, 88, 56], texSize, texSize / 2)
  const deskMat = phys({ map: walnut.color, roughnessMap: walnut.rough, roughness: 1, clearcoat: 0.35, clearcoatRoughness: 0.32, envMapIntensity: 0.7 })
  const blackMetal = std({ color: 0x141414, roughness: 0.42, metalness: 0.75, envMapIntensity: 0.8 })
  const brass = phys({ color: 0xc89b55, roughness: 0.28, metalness: 1, envMapIntensity: 1.0 })
  const ceramic = phys({ color: 0xf1ede6, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 0.8 })
  const matteCeramic = std({ color: 0xd8cfbf, roughness: 0.8, envMapIntensity: 0.6 })

  // ---- Floor, walls, ceiling, baseboards
  const floor = mesh(keep(new THREE.PlaneGeometry(9, 9)), floorMat, room, 0, 0, 1.5, false, true)
  floor.rotation.x = -Math.PI / 2
  const backWall = mesh(keep(new THREE.PlaneGeometry(9, 3.2)), wallMat, room, 0.2, 1.6, -0.9, true, true)
  void backWall
  // Left wall with a window opening (built from 4 slabs so sunlight only enters through the window)
  const WX = -2.0, WZ0 = -0.45, WZ1 = 0.95, WY0 = 0.92, WY1 = 2.32
  const slab = (z0: number, z1: number, y0: number, y1: number) => {
    const m = mesh(keep(new THREE.BoxGeometry(0.16, y1 - y0, z1 - z0)), wallMat, room, WX - 0.08, (y0 + y1) / 2, (z0 + z1) / 2, true, true)
    return m
  }
  slab(-0.9, WZ0, 0, 3.2)
  slab(WZ1, 4.5, 0, 3.2)
  slab(WZ0, WZ1, 0, WY0)
  slab(WZ0, WZ1, WY1, 3.2)
  mesh(keep(new THREE.BoxGeometry(5, 0.1, 6)), wallMat, room, 0.4, 3.25, 1.6, true, false) // ceiling
  mesh(keep(new THREE.BoxGeometry(0.16, 3.2, 5.4)), wallMat, room, 2.6, 1.6, 1.8, true, true) // right wall
  const skirting = std({ color: 0xf2ece2, roughness: 0.6, envMapIntensity: 0.6 })
  mesh(keep(new THREE.BoxGeometry(9, 0.09, 0.02)), skirting, room, 0.2, 0.045, -0.885)
  mesh(keep(new THREE.BoxGeometry(0.02, 0.09, 5.4)), skirting, room, WX + 0.005, 0.045, 1.8)

  // Window frame, sill, glass
  {
    const frame = std({ color: 0xf3efe8, roughness: 0.55, envMapIntensity: 0.7 })
    const fw = 0.05
    const wz = (WZ0 + WZ1) / 2, wy = (WY0 + WY1) / 2
    mesh(keep(new THREE.BoxGeometry(0.07, WY1 - WY0, fw)), frame, room, WX + 0.01, wy, wz) // mullion
    mesh(keep(new THREE.BoxGeometry(0.07, fw * 0.8, WZ1 - WZ0)), frame, room, WX + 0.01, wy + 0.18, wz) // transom
    mesh(keep(new THREE.BoxGeometry(0.07, fw, WZ1 - WZ0)), frame, room, WX + 0.01, WY1 - fw / 2, wz)
    mesh(keep(new THREE.BoxGeometry(0.07, fw, WZ1 - WZ0)), frame, room, WX + 0.01, WY0 + fw / 2, wz)
    mesh(keep(new THREE.BoxGeometry(0.07, WY1 - WY0, fw)), frame, room, WX + 0.01, wy, WZ0 + fw / 2)
    mesh(keep(new THREE.BoxGeometry(0.07, WY1 - WY0, fw)), frame, room, WX + 0.01, wy, WZ1 - fw / 2)
    mesh(keep(new THREE.BoxGeometry(0.24, 0.03, WZ1 - WZ0 + 0.16)), frame, room, WX + 0.06, WY0 - 0.015, wz) // sill
    // Outside: warm evening sky with soft tree silhouettes (HDR, blooms)
    const sky = canvasTex(512, 512, (img, w, h) => {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const v = y / h
          let c = mixc([255, 236, 205], [255, 182, 120], Math.pow(v, 1.4))
          const tree = fbm2(x / 70, y / 70, 4) + (v - 0.55) * 1.1
          const leafy = clamp01((tree - 0.55) * 4)
          c = mixc(c, [92, 70, 55], leafy * 0.85)
          put(img, (y * w + x) * 4, c[0], c[1], c[2])
        }
    })
    const outside = new THREE.Mesh(keep(new THREE.PlaneGeometry(4.5, 3.6)), new THREE.MeshBasicMaterial({ map: sky, color: new THREE.Color().setRGB(3.2, 3.0, 2.8), fog: false }))
    outside.position.set(WX - 1.6, 1.7, wz)
    outside.rotation.y = Math.PI / 2
    room.add(outside)
    const glass = phys({ color: 0xffffff, roughness: 0.02, transmission: 0, transparent: true, opacity: 0.08, envMapIntensity: 1 })
    const g = new THREE.Mesh(keep(new THREE.PlaneGeometry(WZ1 - WZ0, WY1 - WY0)), glass)
    g.position.set(WX - 0.01, wy, wz)
    g.rotation.y = Math.PI / 2
    room.add(g)
  }

  // ---- Light shaft (fake volumetric) + dust
  const shaftMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 0.035 } },
      vertexShader: `varying vec3 vL; varying vec3 vN; varying vec3 vV;
        void main(){ vL = position; vec4 w = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal);
        vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform float uTime; uniform float uIntensity; varying vec3 vL; varying vec3 vN; varying vec3 vV;
        float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1)))*43758.5); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          float along = clamp(vL.z, 0., 1.);            // 0 at window, 1 far end
          float soft = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
          float streak = 0.65 + 0.35*n(vec2(vL.x*9. + uTime*0.05, vL.y*9.));
          float fade = smoothstep(0., 0.08, along) * (1. - smoothstep(0.25, 1., along));
          fade *= smoothstep(0.5, 0.25, abs(vL.x)) * smoothstep(0.5, 0.25, abs(vL.y));
          vec3 col = vec3(1.0, 0.72, 0.45) * uIntensity * soft * streak * fade;
          gl_FragColor = vec4(col, 1.);
        }`,
    }),
  )
  {
    // a box spanning the window opening, extruded along the sun direction
    const g = keep(new THREE.BoxGeometry(1, 1, 1, 1, 1, 1))
    g.translate(0, 0, 0.5) // z in [0,1]
    const shaft = new THREE.Mesh(g, shaftMat)
    const len = 3.4
    shaft.scale.set(WZ1 - WZ0 - 0.08, WY1 - WY0 - 0.08, len)
    shaft.position.set(WX + 0.02, (WY0 + WY1) / 2, (WZ0 + WZ1) / 2)
    // orient local +z along sun dir, local x along world z (window width)
    const zAxis = sunDir.clone()
    const xAxis = V(0, 0, -1).projectOnPlane(zAxis).normalize()
    const yAxis = zAxis.clone().cross(xAxis).normalize()
    shaft.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis))
    shaft.renderOrder = 5
    room.add(shaft)
  }
  const dustMat = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSunDir: { value: sunDir }, uPR: { value: 1 } },
      vertexShader: `uniform float uTime; uniform vec3 uSunDir; uniform float uPR; attribute float aSeed; varying float vB;
        void main(){
          vec3 p = position;
          p.x += sin(uTime*0.13 + aSeed*20.)*0.05; p.y += sin(uTime*0.09 + aSeed*13.)*0.06 - mod(uTime*0.004 + aSeed, 1.)*0.0;
          p.z += cos(uTime*0.11 + aSeed*7.)*0.05;
          // in-beam test: march back to the window plane (x = -2.0) along -sunDir
          float s = (p.x + 2.0) / uSunDir.x;
          vec3 w = p - uSunDir * s;
          float inB = step(-0.42, w.z)*step(w.z, 0.92)*step(0.95, w.y)*step(w.y, 2.28);
          vB = inB * (0.5 + 0.5*sin(uTime*1.7 + aSeed*30.));
          vec4 mv = modelViewMatrix*vec4(p,1.);
          gl_PointSize = min(uPR * (1.2 + aSeed*1.6) * (1.6 / -mv.z), uPR*3.5);
          vB *= smoothstep(0.35, 1.0, -mv.z);
          gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying float vB; void main(){ vec2 c = gl_PointCoord-0.5; float a = smoothstep(0.5, 0.0, length(c));
        gl_FragColor = vec4(vec3(1.0,0.82,0.6)*a*vB*0.7, 1.); }`,
    }),
  )
  {
    const n = mobile ? 350 : 900
    const pos = new Float32Array(n * 3), seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -1.9 + Math.random() * 2.6
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.2
      pos[i * 3 + 2] = -0.85 + Math.random() * 2.3
      seed[i] = Math.random()
    }
    const g = keep(new THREE.BufferGeometry())
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const pts = new THREE.Points(g, dustMat)
    pts.frustumCulled = false
    pts.renderOrder = 6
    room.add(pts)
  }

  // ---- Desk
  const DESK_Y = 0.75
  {
    const desk = new THREE.Group()
    room.add(desk)
    mesh(roundedBox(1.42, 0.035, 0.7, 0.012, 0.005), deskMat, desk, 0.1, DESK_Y - 0.0175, -0.535)
    const legG = keep(new THREE.CylinderGeometry(0.014, 0.011, DESK_Y - 0.035, 16))
    ;[[-0.56, -0.25], [0.76, -0.25], [-0.56, -0.83], [0.76, -0.83]].forEach(([x, z]) =>
      mesh(legG, blackMetal, desk, x, (DESK_Y - 0.035) / 2, z),
    )
    mesh(keep(new THREE.BoxGeometry(1.3, 0.05, 0.015)), deskMat, desk, 0.1, DESK_Y - 0.06, -0.86) // apron
  }

  // ---- Laptop
  const laptop = new THREE.Group()
  laptop.position.set(0.04, DESK_Y, -0.47)
  laptop.rotation.y = -0.035
  room.add(laptop)
  const LW = 0.312, LD = 0.218, LH = 0.0145
  const alu = phys({ color: 0x8d8f94, metalness: 1, roughness: 0.42, roughnessMap: brushed, envMapIntensity: 0.9, clearcoat: 0.15, clearcoatRoughness: 0.4 })
  mesh(roundedBox(LW, LH, LD, 0.011, 0.0035), alu, laptop, 0, LH / 2, 0)
  // keyboard well + keys
  const wellMat = std({ color: 0x1b1c1f, roughness: 0.55, metalness: 0.2, envMapIntensity: 0.5 })
  const well = mesh(keep(new THREE.PlaneGeometry(0.276, 0.112)), wellMat, laptop, 0, LH + 0.0002, -0.034, false, true)
  well.rotation.x = -Math.PI / 2
  {
    const rows = [
      { w: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], d: 0.55 },
      { w: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], d: 1 },
      { w: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], d: 1 },
      { w: [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7], d: 1 },
      { w: [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2], d: 1 },
      { w: [1, 1, 1.2, 1.3, 5.2, 1.3, 1.2, 1, 1, 1], d: 1 },
    ]
    const unit = 0.0186
    const keyGeo = roundedBox(1, 1, 1, 0.12, 0.08, 2)
    const count = rows.reduce((s, r) => s + r.w.length, 0)
    const keys = new THREE.InstancedMesh(keyGeo, std({ color: 0x0f0f11, roughness: 0.62, envMapIntensity: 0.45 }), count)
    const m4 = new THREE.Matrix4()
    let k = 0
    let z = -0.086
    rows.forEach((r) => {
      const total = r.w.reduce((a, b) => a + b, 0)
      const scale = 14.6 / total
      let x = -0.1358
      const depth = unit * r.d - 0.0022
      r.w.forEach((w) => {
        const kw = w * scale * unit - 0.0024
        m4.compose(V(x + kw / 2, LH + 0.0009, z + depth / 2), new THREE.Quaternion(), V(kw, 0.0016, depth))
        keys.setMatrixAt(k++, m4)
        x += w * scale * unit
      })
      z += unit * r.d
    })
    keys.castShadow = false
    keys.receiveShadow = true
    laptop.add(keys)
    const pad = mesh(roundedBox(0.118, 0.0004, 0.07, 0.006, 0.0001, 1), phys({ color: 0x8a8c91, metalness: 0.6, roughness: 0.22, envMapIntensity: 0.9 }), laptop, 0, LH + 0.0002, 0.06, false, true)
    void pad
  }
  // hinge
  const hinge = mesh(keep(new THREE.CylinderGeometry(0.0055, 0.0055, 0.24, 20)), std({ color: 0x1a1a1c, roughness: 0.4, metalness: 0.6 }), laptop, 0, LH - 0.001, -LD / 2 + 0.004)
  hinge.rotation.z = Math.PI / 2
  // lid
  const lid = new THREE.Group()
  lid.position.set(0, LH, -LD / 2 + 0.004)
  laptop.add(lid)
  const LIDH = 0.214, LIDT = 0.0055
  {
    const shell = mesh(roundedBox(LW, LIDT, LIDH, 0.011, 0.0022), alu, lid, 0, LIDH / 2, -LIDT / 2)
    shell.rotation.x = Math.PI / 2
    const bezel = mesh(keep(new THREE.PlaneGeometry(LW - 0.006, LIDH - 0.006)), phys({ color: 0x050506, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1 }), lid, 0, LIDH / 2, 0.0003, false, true)
    void bezel
    const cam = mesh(keep(new THREE.CircleGeometry(0.0012, 16)), std({ color: 0x0a0d14, roughness: 0.1 }), lid, 0, LIDH - 0.0072, 0.0006, false, false)
    void cam
  }
  const SW = 0.284, SH = 0.1775
  const LID_CLOSED = Math.PI / 2 - 0.006, LID_OPEN = -0.27

  // UI canvas for the screen
  const UI_W = 2048, UI_H = 1280
  const uiCanvas = document.createElement('canvas')
  uiCanvas.width = UI_W
  uiCanvas.height = UI_H
  const ui = uiCanvas.getContext('2d')!
  const uiTex = keep(new THREE.CanvasTexture(uiCanvas))
  uiTex.colorSpace = THREE.SRGBColorSpace
  uiTex.anisotropy = 8
  const worldRT = keep(new THREE.WebGLRenderTarget(mobile ? 960 : 1600, mobile ? 600 : 1000, { type: THREE.HalfFloatType, samples: 4 }))
  const screenUniforms = { uWorld: { value: worldRT.texture }, uMix: { value: 0 } }
  const screenMat = phys({
    color: 0x000000,
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    emissive: 0xffffff,
    emissiveMap: uiTex,
    emissiveIntensity: 0,
    envMapIntensity: 1,
  })
  screenMat.onBeforeCompile = (sh: Any) => {
    sh.uniforms.uWorld = screenUniforms.uWorld
    sh.uniforms.uMix = screenUniforms.uMix
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uWorld; uniform float uMix;')
      .replace(
        '#include <emissivemap_fragment>',
        `#ifdef USE_EMISSIVEMAP
          vec3 uiC = texture2D( emissiveMap, vEmissiveMapUv ).rgb;
          vec3 wC = texture2D( uWorld, vEmissiveMapUv ).rgb;
          totalEmissiveRadiance *= mix( uiC, wC, uMix );
        #endif`,
      )
  }
  const screen = mesh(keep(new THREE.PlaneGeometry(SW, SH)), screenMat, lid, 0, LIDH / 2 + 0.0035, 0.0006, false, false)
  // charging cable
  {
    const path = new THREE.CatmullRomCurve3([V(0.2, 0.756, -0.49), V(0.27, 0.755, -0.5), V(0.35, 0.755, -0.62), V(0.42, 0.754, -0.8), V(0.44, 0.7, -0.875), V(0.45, 0.3, -0.88), V(0.47, 0.01, -0.86)])
    mesh(keep(new THREE.TubeGeometry(path, 120, 0.0022, 8, false)), std({ color: 0xeeeeea, roughness: 0.45 }), room)
  }

  // ---- Lamp (brass + white dome)
  {
    const lamp = new THREE.Group()
    lamp.position.set(0.6, DESK_Y, -0.72)
    room.add(lamp)
    mesh(lathe([[0, 0], [0.075, 0], [0.078, 0.004], [0.072, 0.014], [0.02, 0.018], [0, 0.018]]), brass, lamp)
    mesh(keep(new THREE.CylinderGeometry(0.0055, 0.0055, 0.43, 16)), brass, lamp, 0, 0.23, 0)
    const shadeM = phys({ color: 0xf4efe6, roughness: 0.5, clearcoat: 0.4, side: THREE.DoubleSide, envMapIntensity: 0.8 })
    const dome = lathe(Array.from({ length: 18 }, (_, i) => { const a = (i / 17) * Math.PI / 2; return [Math.sin(a) * 0.13, Math.cos(a) * 0.085] }))
    mesh(dome, shadeM, lamp, 0, 0.405, 0)
    const inner = new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.6, 1.15, 0.7), side: THREE.BackSide }))
    inner.scale.setScalar(0.985)
    inner.position.y = 0.405
    lamp.add(inner)
    const bulb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.026, 24, 12)), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(24, 16, 9) }))
    bulb.position.y = 0.41
    lamp.add(bulb)
    const spot = new THREE.SpotLight(new THREE.Color().setRGB(1, 0.7, 0.42), 1.5, 2.2, 0.82, 1.0, 2)
    spot.position.set(0, 0.4, 0)
    spot.target.position.set(0, -1, 0)
    spot.castShadow = true
    spot.shadow.mapSize.set(1024, 1024)
    spot.shadow.radius = 8
    spot.shadow.bias = -0.0008
    lamp.add(spot, spot.target)
  }

  // ---- Mug with coffee
  {
    const mug = new THREE.Group()
    mug.position.set(0.37, DESK_Y, -0.33)
    room.add(mug)
    const outer: number[][] = [[0, 0], [0.036, 0], [0.039, 0.004], [0.041, 0.05], [0.042, 0.09], [0.04, 0.092], [0.038, 0.09], [0.037, 0.05], [0.035, 0.008], [0, 0.008]]
    mesh(lathe(outer, 56), ceramic, mug)
    const coffee = mesh(keep(new THREE.CircleGeometry(0.0375, 40)), phys({ color: 0x1c0d06, roughness: 0.08, clearcoat: 1 }), mug, 0, 0.078, 0, false, true)
    coffee.rotation.x = -Math.PI / 2
    const handle = mesh(keep(new THREE.TorusGeometry(0.022, 0.0055, 14, 32, Math.PI * 1.15)), ceramic, mug, 0.045, 0.048, 0)
    handle.rotation.z = -Math.PI * 0.575
  }

  // ---- Books, vase with dried branches, notebook + pencil
  {
    const bookCols = [0x2f4a63, 0xc6c0b2, 0x8e3b2b, 0x2e3a2c]
    let y = DESK_Y
    ;[[0.24, 0.032, 0.17, 0.05], [0.22, 0.026, 0.155, -0.08], [0.205, 0.03, 0.145, 0.12]].forEach(([w, h, d, r], i) => {
      const b = new THREE.Group()
      b.position.set(-0.43, y, -0.66)
      b.rotation.y = r
      room.add(b)
      mesh(roundedBox(w, h, d, 0.004, 0.0015, 2), std({ color: bookCols[i], roughness: 0.85, envMapIntensity: 0.5 }), b, 0, h / 2, 0)
      mesh(keep(new THREE.BoxGeometry(w - 0.01, h - 0.006, d - 0.004)), std({ color: 0xefe8da, roughness: 0.95 }), b, 0.006, h / 2, 0)
      y += h
    })
    const vase = new THREE.Group()
    vase.position.set(-0.45, y, -0.66)
    room.add(vase)
    mesh(lathe([[0, 0], [0.04, 0], [0.062, 0.03], [0.068, 0.07], [0.058, 0.12], [0.03, 0.17], [0.022, 0.2], [0.026, 0.21], [0.02, 0.212], [0.016, 0.2], [0, 0.2]], 48), matteCeramic, vase)
    const twig = std({ color: 0x5c4434, roughness: 0.9 })
    const bud = std({ color: 0xe9dfcf, roughness: 0.9 })
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9, lean = 0.12 + (i % 3) * 0.06
      const pts = [V(0, 0.15, 0), V(Math.cos(a) * lean * 0.3, 0.38, Math.sin(a) * lean * 0.3), V(Math.cos(a) * lean * 0.8, 0.62 + (i % 2) * 0.08, Math.sin(a) * lean * 0.8), V(Math.cos(a) * lean * 1.3, 0.8 + (i % 3) * 0.06, Math.sin(a) * lean * 1.3)]
      const c = new THREE.CatmullRomCurve3(pts)
      mesh(keep(new THREE.TubeGeometry(c, 40, 0.0028 - i * 0.0001, 5, false)), twig, vase)
      for (let j = 0; j < 9; j++) {
        const p = c.getPoint(0.45 + j * 0.06)
        mesh(keep(new THREE.SphereGeometry(0.006 + (j % 3) * 0.002, 8, 6)), bud, vase, p.x + Math.sin(j * 5) * 0.012, p.y, p.z + Math.cos(j * 5) * 0.012)
      }
    }
    const nb = new THREE.Group()
    nb.position.set(0.44, DESK_Y, -0.13)
    nb.rotation.y = -0.32
    room.add(nb)
    mesh(roundedBox(0.15, 0.012, 0.21, 0.006, 0.002, 2), std({ color: 0x23231f, roughness: 0.8 }), nb, 0, 0.006, 0)
    const pencil = mesh(keep(new THREE.CylinderGeometry(0.0035, 0.0035, 0.17, 6)), std({ color: 0xd9a441, roughness: 0.6 }), nb, 0.03, 0.0155, 0)
    pencil.rotation.set(Math.PI / 2, 0, 0.25)
  }

  // ---- Poster
  {
    const art = canvasTex(512, 680, (img, w, h) => {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let c = [238, 230, 216]
          const dx = x - 256, dy = y - 250
          if (dx * dx + dy * dy < 98 * 98) c = [198, 70, 48]
          const hill = 470 + Math.sin(x / 70) * 30 + Math.sin(x / 23 + 1) * 8
          if (y > hill) c = [30, 37, 50]
          if (y > 520 + Math.sin(x / 50 + 2) * 18) c = [52, 62, 78]
          if (x < 36 || x > w - 36 || y < 36 || y > h - 36) c = [244, 239, 230]
          const n = 0.94 + noise2(x * 0.8, y * 0.8) * 0.08
          put(img, (y * w + x) * 4, c[0] * n, c[1] * n, c[2] * n)
        }
    })
    const g = new THREE.Group()
    g.position.set(-0.2, 1.72, -0.88)
    room.add(g)
    mesh(roundedBox(0.5, 0.025, 0.66, 0.003, 0.002, 2), std({ color: 0x9b7346, roughness: 0.6 }), g, 0, 0, 0).rotation.x = Math.PI / 2
    const p = mesh(keep(new THREE.PlaneGeometry(0.46, 0.62)), std({ map: art, roughness: 0.9 }), g, 0, 0, 0.013, false, true)
    void p
    const glass = mesh(keep(new THREE.PlaneGeometry(0.46, 0.62)), phys({ color: 0xffffff, transparent: true, opacity: 0.06, roughness: 0.03, envMapIntensity: 1.2 }), g, 0, 0, 0.0145, false, false)
    void glass
  }

  // ---- Shelf + books
  {
    const sh = new THREE.Group()
    sh.position.set(0.95, 2.02, -0.79)
    room.add(sh)
    mesh(roundedBox(0.92, 0.028, 0.2, 0.004, 0.002, 2), deskMat, sh, 0, 0, 0)
    const cols = [0xb6412e, 0xe1b450, 0x2b4767, 0x3f6a4c, 0xe6dfd2, 0x7f3427, 0x232e3d, 0xc9a77c, 0x5d6b73]
    let x = -0.34
    cols.forEach((c, i) => {
      const w = 0.028 + (i % 3) * 0.008, hgt = 0.2 + ((i * 37) % 9) / 100
      const b = mesh(roundedBox(w, hgt, 0.15, 0.003, 0.0015, 2), std({ color: c, roughness: 0.82, envMapIntensity: 0.5 }), sh, x + w / 2, 0.014 + hgt / 2, 0)
      if (i === 6) b.rotation.z = -0.18
      x += w + 0.004
    })
    const v = mesh(lathe([[0, 0], [0.03, 0], [0.045, 0.04], [0.035, 0.09], [0.018, 0.12], [0, 0.12]]), std({ color: 0xc66a48, roughness: 0.7 }), sh, 0.3, 0.014, 0.01)
    void v
  }

  // ---- Floor plant (leaves cast shadows on the wall)
  {
    const plant = new THREE.Group()
    plant.position.set(-1.45, 0, -0.5)
    room.add(plant)
    mesh(lathe([[0, 0], [0.13, 0], [0.165, 0.33], [0.172, 0.34], [0.16, 0.345], [0, 0.32]]), std({ color: 0xcfc6b8, roughness: 0.85 }), plant)
    const leafShape = new THREE.Shape()
    leafShape.moveTo(0, 0)
    leafShape.bezierCurveTo(0.1, 0.02, 0.13, 0.17, 0.0, 0.27)
    leafShape.bezierCurveTo(-0.13, 0.17, -0.1, 0.02, 0, 0)
    const leafG = keep(new THREE.ShapeGeometry(leafShape, 12))
    {
      const p = leafG.attributes.position
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i)
        p.setZ(i, -x * x * 2.2 + y * y * 0.5 + Math.sin(x * 60) * 0.002) // cupped + arched leaf
      }
      leafG.computeVertexNormals()
    }
    const leafM = phys({ color: 0x3b6b30, roughness: 0.45, side: THREE.DoubleSide, envMapIntensity: 0.7, sheen: 0.4, sheenColor: 0x9fcf6a, emissive: 0x0e1a06 })
    const stemM = std({ color: 0x4d5e35, roughness: 0.8 })
    for (let i = 0; i < 22; i++) {
      const a = i * 2.39996, r = 0.05 + (i % 5) * 0.02
      const top = V(Math.cos(a) * (0.18 + (i % 4) * 0.07), 0.6 + (i % 7) * 0.13, Math.sin(a) * (0.18 + (i % 4) * 0.07))
      const stem = new THREE.CatmullRomCurve3([V(Math.cos(a) * r * 0.3, 0.3, Math.sin(a) * r * 0.3), V(top.x * 0.5, top.y * 0.75, top.z * 0.5), top])
      mesh(keep(new THREE.TubeGeometry(stem, 16, 0.004, 5, false)), stemM, plant)
      const leaf = new THREE.Mesh(leafG, leafM)
      leaf.position.copy(top)
      leaf.lookAt(top.clone().multiplyScalar(2).setY(top.y + 0.6))
      leaf.rotateX(-Math.PI / 2 + 0.5)
      leaf.scale.setScalar(0.9 + (i % 3) * 0.25)
      leaf.castShadow = true
      leaf.receiveShadow = true
      plant.add(leaf)
    }
  }

  // ---- Chair (mid-century, walnut)
  {
    const chair = new THREE.Group()
    chair.position.set(-0.78, 0, 0.05)
    chair.rotation.y = 0.55
    room.add(chair)
    const cw = phys({ map: walnut.color, roughnessMap: walnut.rough, roughness: 1, clearcoat: 0.2, envMapIntensity: 0.7 })
    mesh(roundedBox(0.44, 0.04, 0.42, 0.06, 0.012), cw, chair, 0, 0.45, 0)
    const back = mesh(roundedBox(0.42, 0.025, 0.16, 0.05, 0.01), cw, chair, 0, 0.8, 0.205)
    back.rotation.x = Math.PI / 2 - 0.12
    const legG = keep(new THREE.CylinderGeometry(0.014, 0.01, 0.45, 12))
    ;[[-0.18, -0.17, 0.08], [0.18, -0.17, 0.08], [-0.18, 0.17, -0.1], [0.18, 0.17, -0.1]].forEach(([x, z, tilt]) => {
      const l = mesh(legG, cw, chair, x, 0.225, z)
      l.rotation.x = tilt
    })
    ;[-0.17, 0.17].forEach((x) => mesh(keep(new THREE.CylinderGeometry(0.01, 0.012, 0.36, 10)), cw, chair, x, 0.63, 0.2))
  }

  // ---- Rug
  {
    const rug = mesh(keep(new THREE.PlaneGeometry(2.2, 1.5)), std({ map: rugTex, roughness: 1, envMapIntensity: 0.4 }), room, -0.25, 0.004, 0.35, false, true)
    rug.rotation.x = -Math.PI / 2
  }

  /* ================================================================ */
  /*  THE WORLD INSIDE THE SCREEN                                     */
  /* ================================================================ */
  const world = new THREE.Scene()
  // Golden hour behind the camera: the peaks ahead catch alpenglow, the sky ahead shows the pink "belt of Venus".
  const wSunDir = V(-0.93, 0.12, 0.34).normalize()
  const SKY_GLSL = `
    uniform vec3 uSunDir; uniform float uTime;
    float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      return mix(mix(h21(i), h21(i+vec2(1.,0.)), f.x), mix(h21(i+vec2(0.,1.)), h21(i+vec2(1.,1.)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0., a = 0.5; for (int i = 0; i < 6; i++){ s += a*vn(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
    vec3 skyColor(vec3 d){
      float y = max(d.y, 0.);
      float s = max(dot(d, uSunDir), 0.);
      vec3 zen = vec3(0.12, 0.2, 0.46);
      vec3 belt = vec3(1.0, 0.64, 0.6);
      vec3 shade = vec3(0.4, 0.43, 0.6);
      vec3 c = mix(belt, zen, smoothstep(0.03, 0.45, y));
      c = mix(shade, c, smoothstep(0.0, 0.035, y));
      c = mix(c, vec3(1.7, 0.95, 0.5), pow(s, 3.) * 0.85);
      c += vec3(2.5, 1.5, 0.8) * pow(s, 40.);
      c += vec3(40., 28., 16.) * smoothstep(0.9993, 0.9997, s);
      if (d.y > 0.008) {
        vec2 q = d.xz / d.y * vec2(0.5, 1.1) + vec2(uTime * 0.003, 0.);
        float n = fbm(q * 1.2);
        float cov = smoothstep(0.46, 0.86, n) * smoothstep(0.008, 0.16, d.y);
        float lit = fbm(q * 2.4 + 3.1);
        vec3 cc = mix(vec3(0.5, 0.42, 0.55), vec3(1.55, 0.95, 0.78), smoothstep(0.3, 0.75, lit));
        c = mix(c, cc, cov * 0.6);
      }
      return c;
    }`
  const skyMat = keep(
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uSunDir: { value: wSunDir }, uTime: { value: 0 } },
      vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`,
      fragmentShader: `varying vec3 vD; ${SKY_GLSL} void main(){ gl_FragColor = vec4(skyColor(normalize(vD)), 1.); }`,
    }),
  )
  const skyDome = new THREE.Mesh(keep(new THREE.SphereGeometry(8000, 64, 32)), skyMat)
  skyDome.frustumCulled = false
  world.add(skyDome)
  const HAZE = new THREE.Color().setRGB(0.55, 0.6, 0.78)
  const HAZE_DENSITY = 0.00016
  world.fog = new THREE.FogExp2(HAZE, HAZE_DENSITY)
  const wSun = new THREE.DirectionalLight(new THREE.Color().setRGB(1.0, 0.58, 0.32), 7)
  wSun.position.copy(wSunDir).multiplyScalar(1000)
  world.add(wSun)
  world.add(new THREE.HemisphereLight(new THREE.Color().setRGB(0.45, 0.52, 0.85), new THREE.Color().setRGB(0.16, 0.12, 0.08), 1.7))

  // ---- terrain helpers
  const ridged = (x: number, z: number, oct: number) => {
    let s = 0, a = 0.5, f = 1, w = 1
    for (let i = 0; i < oct; i++) {
      let n = 1 - Math.abs(noise2(x * f + i * 17.3, z * f - i * 9.1) * 2 - 1)
      n = n * n * w
      w = clamp01(n * 1.6)
      s += n * a
      a *= 0.5
      f *= 2.03
    }
    return s
  }
  const terrainMat = std({ vertexColors: true, roughness: 0.95, envMapIntensity: 0 })
  // Fine surface detail (tree canopy / rock grain) added in the shader, from world position
  const addDetail = (sh: Any) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvec4 twp = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\ntwp = instanceMatrix * twp;\n#endif\nvTW = (modelMatrix * twp).xyz;')
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vTW;
        float th(vec2 p){ p = fract(p*vec2(233.34, 851.73)); p += dot(p, p+23.45); return fract(p.x*p.y); }
        float tn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
          return mix(mix(th(i), th(i+vec2(1.,0.)), f.x), mix(th(i+vec2(0.,1.)), th(i+vec2(1.,1.)), f.x), f.y); }
        float tf(vec2 p){ float s = 0., a = 0.5; for (int i = 0; i < 5; i++){ s += a*tn(p); p = p*2.07 + 3.1; a *= 0.5; } return s; }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float dist = length(vTW - cameraPosition);
        float fadeD = 1. - smoothstep(600., 3500., dist);
        float canopy = tf(vTW.xz * 0.11);
        float grain = tf(vTW.xz * 0.02 + 7.);
        float snowy = smoothstep(0.55, 0.75, dot(diffuseColor.rgb, vec3(0.333)));
        diffuseColor.rgb *= mix(1., mix(0.3 + pow(canopy, 1.6) * 1.9, 0.85 + canopy * 0.3, snowy) * (0.8 + grain * 0.4), max(fadeD, 0.35));
        vec3 wn = normalize(cross(dFdx(vTW), dFdy(vTW)));
        float slopeF = 1. - abs(wn.y);
        float gully = smoothstep(0.48, 0.78, tf(vec2((vTW.x + vTW.z) * 0.012, vTW.y * 0.004)));
        diffuseColor.rgb *= mix(1., 0.28, gully * snowy * smoothstep(0.3, 0.65, slopeF));`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          float hgt = tf(vTW.xz * 0.11) * 3.0 + tf(vTW.xz * 0.025) * 10.0;
          vec3 sp = -vViewPosition; vec3 dpx = dFdx(sp), dpy = dFdy(sp);
          float hx = dFdx(hgt), hy = dFdy(hgt);
          vec3 r1 = cross(dpy, normal), r2 = cross(normal, dpx);
          float det = dot(dpx, r1);
          vec3 grad = sign(det) * (hx * r1 + hy * r2);
          normal = normalize(abs(det) * normal - grad * 0.6);
        }`,
      )
  }
  terrainMat.onBeforeCompile = addDetail
  function terrain(w: number, d: number, sx: number, sz: number, cx: number, cz: number, H: (x: number, z: number) => number, C: (x: number, y: number, z: number, slope: number) => number[]) {
    const g = new THREE.PlaneGeometry(w, d, sx, sz)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + cx, z = p.getZ(i) + cz
      p.setXYZ(i, x, H(x, z), z)
    }
    g.computeVertexNormals()
    const nrm = g.attributes.normal
    const col = new Float32Array(p.count * 3)
    for (let i = 0; i < p.count; i++) col.set(C(p.getX(i), p.getY(i), p.getZ(i), 1 - nrm.getY(i)), i * 3)
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const m = new THREE.Mesh(keep(g), terrainMat)
    world.add(m)
    return m
  }
  // Lake valley: water down the middle, forested hills either side, a ridge at the far end
  const lakeEdge = (x: number, z: number) => {
    const halfW = 150 + Math.max(0, 120 - z) * 0.09 + (fbm2(z / 260, 3.3, 3) - 0.5) * 120
    const side = Math.abs(x - Math.sin(z / 420) * 60) - halfW
    const end = -980 - z + (fbm2(x / 200, 7.7, 3) - 0.5) * 160
    return Math.max(side, end)
  }
  const nearH = (x: number, z: number) => {
    const s = lakeEdge(x, z)
    if (s < 0) return -10 + s * 0.02
    const rise = 1 - Math.exp(-s / 140)
    const hill = 60 + ridged(x / 520, z / 520, 6) * 330
    return -1 + rise * hill + fbm2(x / 30, z / 30, 3) * 6 * rise
  }
  const nearTerrain = terrain(3600, 2000, 360, 200, 0, -560, nearH, (x, y, z, sl) => {
    const n = fbm2(x / 70, z / 70, 4)
    const fine = noise2(x / 9, z / 9)
    if (y < 1.6) return mixc([0.045, 0.042, 0.038], [0.07, 0.065, 0.055], fine)
    let c = mixc([0.01, 0.026, 0.02], [0.03, 0.055, 0.032], n * 0.8 + fine * 0.4) // forest canopy
    const field = clamp01((fbm2(x / 160, z / 160, 3) - 0.55) * 6) * clamp01((0.32 - sl) * 5) * clamp01((90 - y) / 40)
    c = mixc(c, mixc([0.05, 0.08, 0.03], [0.08, 0.1, 0.04], fine), field * 0.7) // terraces and clearings
    if (sl > 0.55) c = mixc(c, [0.06, 0.06, 0.055], clamp01((sl - 0.55) * 4))
    return c
  })
  // The Himalaya: far, huge and snow-capped
  const peak = (x: number, z: number, px: number, pz: number, hgt: number, r: number, sharp: number) => {
    const d = Math.hypot(x - px, (z - pz) * 1.2) / r
    return hgt * Math.pow(Math.max(0, 1 - d), sharp)
  }
  const farH = (x: number, z: number) => {
    const base = ridged(x / 1300, z / 1300, 5)
    const front = clamp01((-z - 3000) / 1000)
    let h = 200 + Math.pow(base, 1.5) * 620 * front
    h += peak(x, z, 520, -4800, 1150, 1800, 1.25) * (0.75 + base * 0.5) // fishtail-like summit
    h += peak(x, z, -1900, -5300, 900, 2000, 1.25) * (0.7 + base * 0.6)
    h += peak(x, z, 2700, -5500, 820, 1900, 1.25) * (0.7 + base * 0.6)
    return h
  }
  terrain(12000, 3600, 560, 180, 0, -4700, farH, (x, y, z, sl) => {
    const n = fbm2(x / 120, z / 120, 4)
    const snowLine = 640 + (n - 0.5) * 160
    let c = mixc([0.03, 0.055, 0.03], [0.06, 0.075, 0.05], n)
    c = mixc(c, mixc([0.06, 0.06, 0.07], [0.12, 0.115, 0.12], n), clamp01((y - 420) / 200))
    const rib = ridged(x / 160 + 3, z / 160, 3)
    let snow = clamp01((y - snowLine) / 120) * clamp01((0.97 - sl) * 6)
    snow *= 1 - clamp01((sl - 0.32) * 2.5) * clamp01((rib - 0.4) * 2.6) // dark rock ribs on steep faces
    return mixc(c, [0.62, 0.63, 0.68], snow)
  })

  // ---- forest: thousands of instanced tree crowns on the hills (they also reflect in the lake)
  {
    const N = mobile ? 9000 : 38000
    const broadG = new THREE.IcosahedronGeometry(1, 1)
    {
      const p = broadG.attributes.position, v = V(0, 0, 0)
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i)
        const k = 1 + (noise2(v.x * 3 + 5, v.y * 3 + v.z * 2) - 0.5) * 0.5
        p.setXYZ(i, v.x * k, v.y * 0.8 * k, v.z * k)
      }
      broadG.translate(0, 0.75, 0)
      broadG.computeVertexNormals()
    }
    const conG = new THREE.ConeGeometry(0.5, 2.4, 7)
    conG.translate(0, 1.2, 0)
    const treeMat = std({ color: 0xffffff, roughness: 0.9, envMapIntensity: 0 })
    treeMat.onBeforeCompile = addDetail
    const broad = new THREE.InstancedMesh(keep(broadG), treeMat, N)
    const con = new THREE.InstancedMesh(keep(conG), treeMat, Math.floor(N * 0.3))
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(0, 1, 0), col = new THREE.Color()
    let bi = 0, ci = 0, tries = 0
    while (bi < N && tries < N * 12) {
      tries++
      const x = (Math.random() - 0.5) * 3300, z = -1480 + Math.random() * 1880
      const sEdge = lakeEdge(x, z)
      if (sEdge < 7) continue
      const h = nearH(x, z)
      const sl = Math.hypot(nearH(x + 5, z) - h, nearH(x, z + 5) - h) / 5
      if (sl > 1.2) continue
      const fieldM = clamp01((fbm2(x / 160, z / 160, 3) - 0.55) * 6) * clamp01((0.32 - sl / 2) * 5) * clamp01((90 - h) / 40)
      if (fieldM > 0.4 && Math.random() < 0.9) continue
      const conifer = h > 150 && ci < con.count && Math.random() < 0.55
      const r = conifer ? 2 + Math.random() * 1.6 : 2.4 + Math.random() * 2.8
      q.setFromAxisAngle(up, Math.random() * 6.283)
      m4.compose(V(x, h - 0.6, z), q, V(r, r * (0.75 + Math.random() * 0.6), r))
      const g = Math.random()
      if (conifer) {
        col.setRGB(0.03 + g * 0.02, 0.065 + g * 0.03, 0.045 + g * 0.02)
        con.setMatrixAt(ci, m4)
        con.setColorAt(ci++, col)
      } else {
        col.setRGB(0.05 + g * 0.05, 0.095 + g * 0.07, 0.04 + g * 0.03)
        broad.setMatrixAt(bi, m4)
        broad.setColorAt(bi++, col)
      }
    }
    broad.count = bi
    con.count = ci
    ;[broad, con].forEach((m) => {
      m.castShadow = true
      m.receiveShadow = true
      m.frustumCulled = false
      world.add(m)
    })
  }
  // sun shadows over the valley
  nearTerrain.castShadow = true
  nearTerrain.receiveShadow = true
  wSun.castShadow = true
  wSun.shadow.mapSize.set(mobile ? 2048 : 4096, mobile ? 2048 : 4096)
  wSun.target.position.set(0, 0, -520)
  wSun.position.copy(wSun.target.position).addScaledVector(wSunDir, 3000)
  Object.assign(wSun.shadow.camera, { left: -1900, right: 1900, top: 1300, bottom: -1300, near: 100, far: 6500 })
  wSun.shadow.bias = -0.0005
  wSun.shadow.radius = 3
  wSun.shadow.autoUpdate = false // static valley: render the shadow map once
  wSun.shadow.needsUpdate = true
  world.add(wSun.target)

  // ---- painted wooden boats on the lake
  const boats: Any[] = []
  {
    const s = new THREE.Shape()
    s.moveTo(-3.1, 0)
    s.quadraticCurveTo(-1.6, 0.85, 0, 0.9)
    s.quadraticCurveTo(1.6, 0.85, 3.1, 0)
    s.quadraticCurveTo(1.6, -0.85, 0, -0.9)
    s.quadraticCurveTo(-1.6, -0.85, -3.1, 0)
    const hullG = keep(new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 16 }))
    hullG.rotateX(-Math.PI / 2)
    {
      const p = hullG.attributes.position
      for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + Math.pow(Math.abs(p.getX(i)) / 3.1, 3) * 0.5) // raised bow and stern
      hullG.computeVertexNormals()
    }
    const innerG = keep(new THREE.ShapeGeometry(s, 16))
    innerG.rotateX(-Math.PI / 2)
    const paints = [0x9c2a22, 0x23477f, 0xb98a2a, 0x2c6a45, 0xa8402e, 0x2d5f92, 0xc39a3c]
    const spots = [[-14, 128, 0.4], [10, 104, -0.6], [-26, 78, 1.2], [22, 58, 0.2], [-62, 6, -1.1], [36, -20, 0.8], [-40, -60, -0.3], [8, -110, 1.6], [55, -180, 0.5]]
    spots.forEach(([x, z, r], i) => {
      const b = new THREE.Group()
      b.position.set(x, -0.18, z)
      b.rotation.y = r
      const sc = 0.7 + h2(i, 3) * 0.2
      b.scale.set(sc, sc, sc)
      world.add(b)
      b.add(new THREE.Mesh(hullG, std({ color: paints[i % paints.length], roughness: 0.55, envMapIntensity: 0 })))
      const floorM = new THREE.Mesh(innerG, std({ color: 0x3a2a1e, roughness: 0.9, envMapIntensity: 0 }))
      floorM.scale.set(0.9, 1, 0.82)
      floorM.position.y = 0.5
      b.add(floorM)
      const trim = new THREE.Mesh(keep(new THREE.TorusGeometry(1, 0.04, 6, 40)), std({ color: 0xf1ede4, roughness: 0.6, envMapIntensity: 0 }))
      trim.rotation.x = Math.PI / 2
      trim.scale.set(3.05, 0.88, 1)
      trim.position.y = 0.62
      b.add(trim)
      if (i % 4 === 3) {
        const canopy = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 16, 1, true, 0, Math.PI)), std({ color: 0xe6dccb, roughness: 0.8, side: THREE.DoubleSide, envMapIntensity: 0 }))
        canopy.rotation.z = Math.PI / 2
        canopy.position.y = 0.7
        b.add(canopy)
      }
      ;[-1.1, 1.1].forEach((sx) => {
        const seat = new THREE.Mesh(keep(new THREE.BoxGeometry(0.16, 0.05, 1.45)), std({ color: 0x6b4a32, roughness: 0.8, envMapIntensity: 0 }))
        seat.position.set(sx, 0.52, 0)
        b.add(seat)
      })
      boats.push(b)
    })
  }

  // water with planar reflection
  const reflRT = keep(new THREE.WebGLRenderTarget(mobile ? 640 : 1280, mobile ? 400 : 800, { type: THREE.HalfFloatType }))
  const reflCam = new THREE.PerspectiveCamera()
  const waterMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        tRefl: { value: reflRT.texture },
        uReflMat: { value: new THREE.Matrix4() },
        uSunDir: { value: wSunDir },
        uFog: { value: HAZE },
        uDensity: { value: HAZE_DENSITY },
      },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `
        uniform sampler2D tRefl; uniform mat4 uReflMat; uniform vec3 uFog; uniform float uDensity;
        varying vec3 vW; ${SKY_GLSL}
        void main(){
          vec2 p = vW.xz; vec2 g = vec2(0.);
          for (int i = 0; i < 7; i++){
            float fi = float(i);
            vec2 dir = normalize(vec2(sin(fi*1.7+0.3), cos(fi*2.3+0.7)));
            float fr = 0.9 + fi*0.9; float amp = 0.016/(1.+fi*0.7);
            float ph = dot(dir, p)*fr + uTime*(0.5+fi*0.3);
            g += dir * cos(ph) * fr * amp;
          }
          float dist = length(cameraPosition - vW);
          g *= 1. / (1. + dist * 0.004);                       // calmer in the distance
          vec3 n = normalize(vec3(-g.x, 1., -g.y));
          vec3 v = normalize(cameraPosition - vW);
          float fres = 0.02 + 0.98*pow(1. - max(dot(n, v), 0.), 5.);
          vec4 rp = uReflMat * vec4(vW, 1.);
          vec2 ruv = rp.xy / rp.w * 0.5 + 0.5 + n.xz * 0.035;
          vec3 refl = texture2D(tRefl, ruv).rgb;
          vec3 deep = vec3(0.012, 0.03, 0.03);
          vec3 col = mix(deep, refl * 0.92, clamp(fres * 1.15 + 0.12, 0., 1.));
          float f = 1. - exp(-pow(dist * uDensity, 2.));
          col = mix(col, uFog, f);
          gl_FragColor = vec4(col, 1.);
        }`,
    }),
  )
  const water = new THREE.Mesh(keep(new THREE.PlaneGeometry(8000, 8000)), waterMat)
  water.rotation.x = -Math.PI / 2
  world.add(water)
  const clipAbove = [new THREE.Plane(V(0, 1, 0), 0.8)]
  const innerCam = new THREE.PerspectiveCamera(44, SW / SH, 0.5, 9000)

  /* ================================================================ */
  /*  POST-PROCESSING (bloom + depth of field + filmic grade)         */
  /* ================================================================ */
  const mainRT = keep(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: mobile ? 0 : 4 }))
  mainRT.depthTexture = new THREE.DepthTexture(4, 4)
  const LEVELS = 6
  const bloomDown: Any[] = [], bloomUp: Any[] = []
  for (let i = 0; i < LEVELS; i++) {
    bloomDown.push(keep(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false })))
    bloomUp.push(keep(new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false })))
  }
  const fsScene = new THREE.Scene()
  const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const fsGeo = keep(new THREE.BufferGeometry())
  fsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
  fsGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2))
  const fsQuad = new THREE.Mesh(fsGeo)
  fsQuad.frustumCulled = false
  fsScene.add(fsQuad)
  const FS_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`
  const brightMat = keep(new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uThreshold: { value: 1.0 } },
    vertexShader: FS_VERT,
    fragmentShader: `uniform sampler2D tSrc; uniform float uThreshold; varying vec2 vUv;
      void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b));
        float k = clamp(l - uThreshold, 0., 50.); k = k*k/(k + 0.5); gl_FragColor = vec4(c * (k / max(l, 1e-4)), 1.); }`,
  }))
  const downMat = keep(new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } },
    vertexShader: FS_VERT,
    fragmentShader: `uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
      void main(){ vec2 t = uTexel;
        vec3 c = texture2D(tSrc, vUv).rgb * 0.5;
        c += texture2D(tSrc, vUv + vec2(-t.x, -t.y)).rgb * 0.125; c += texture2D(tSrc, vUv + vec2(t.x, -t.y)).rgb * 0.125;
        c += texture2D(tSrc, vUv + vec2(-t.x, t.y)).rgb * 0.125;  c += texture2D(tSrc, vUv + vec2(t.x, t.y)).rgb * 0.125;
        gl_FragColor = vec4(c, 1.); }`,
  }))
  const upMat = keep(new THREE.ShaderMaterial({
    uniforms: { tSmall: { value: null }, tCur: { value: null }, uTexel: { value: new THREE.Vector2() } },
    vertexShader: FS_VERT,
    fragmentShader: `uniform sampler2D tSmall; uniform sampler2D tCur; uniform vec2 uTexel; varying vec2 vUv;
      void main(){ vec2 t = uTexel; vec3 s = vec3(0.);
        s += texture2D(tSmall, vUv + vec2(-t.x, -t.y)).rgb; s += texture2D(tSmall, vUv + vec2(0., -t.y)).rgb * 2.; s += texture2D(tSmall, vUv + vec2(t.x, -t.y)).rgb;
        s += texture2D(tSmall, vUv + vec2(-t.x, 0.)).rgb * 2.; s += texture2D(tSmall, vUv).rgb * 4.; s += texture2D(tSmall, vUv + vec2(t.x, 0.)).rgb * 2.;
        s += texture2D(tSmall, vUv + vec2(-t.x, t.y)).rgb; s += texture2D(tSmall, vUv + vec2(0., t.y)).rgb * 2.; s += texture2D(tSmall, vUv + vec2(t.x, t.y)).rgb;
        gl_FragColor = vec4(texture2D(tCur, vUv).rgb + s / 16., 1.); }`,
  }))
  const aoRT = keep(new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false }))
  const aoMat = keep(new THREE.ShaderMaterial({
    uniforms: { tDepth: { value: mainRT.depthTexture }, uProj: { value: new THREE.Matrix4() }, uProjInv: { value: new THREE.Matrix4() }, uRes: { value: new THREE.Vector2() }, uRadius: { value: 0.12 } },
    vertexShader: FS_VERT,
    fragmentShader: `uniform sampler2D tDepth; uniform mat4 uProj; uniform mat4 uProjInv; uniform vec2 uRes; uniform float uRadius; varying vec2 vUv;
      vec3 vpos(vec2 uv){ float d = texture2D(tDepth, uv).r; vec4 p = uProjInv * vec4(uv*2.-1., d*2.-1., 1.); return p.xyz / p.w; }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        float d0 = texture2D(tDepth, vUv).r;
        if (d0 >= 0.9999) { gl_FragColor = vec4(1.); return; }
        vec3 P = vpos(vUv);
        vec2 px = 1. / uRes;
        vec3 N = normalize(cross(vpos(vUv + vec2(px.x, 0.)) - P, vpos(vUv + vec2(0., px.y)) - P));
        if (dot(N, -P) < 0.) N = -N;
        vec2 ip = mod(floor(vUv*uRes), 4.); float ign = fract(52.9829189 * fract(dot(ip, vec2(0.06711056, 0.00583715)) * 4.0 + 0.11));
        vec3 rnd = vec3(cos(ign*6.2832), sin(ign*6.2832), 0.);
        vec3 T = normalize(rnd - N * dot(rnd, N)); vec3 B = cross(N, T);
        float occ = 0.;
        for (int i = 0; i < 14; i++) {
          float fi = float(i);
          float a = fi * 2.39996 + ign * 6.28;
          float z = fract(fi * 0.618 + 0.1);
          float r = sqrt(1. - z*z);
          vec3 k = vec3(cos(a)*r, sin(a)*r, z);
          float sc = mix(0.1, 1., pow((fi + 1.) / 14., 2.));
          vec3 S = P + (T*k.x + B*k.y + N*k.z) * uRadius * sc;
          vec4 c = uProj * vec4(S, 1.);
          vec2 suv = c.xy / c.w * 0.5 + 0.5;
          float sz = vpos(suv).z;
          float range = smoothstep(0., 1., uRadius / max(abs(P.z - sz), 1e-4));
          occ += step(S.z + 0.01 + 0.004 * -P.z, sz) * range;
        }
        gl_FragColor = vec4(vec3(1. - occ / 14.), 1.);
      }`,
  }))
  const finalMat = keep(new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: mainRT.texture }, tDepth: { value: mainRT.depthTexture }, tBloom: { value: null }, tAO: { value: aoRT.texture }, uAO: { value: 1 },
      uRes: { value: new THREE.Vector2() }, uNear: { value: 0.1 }, uFar: { value: 40 }, uFocus: { value: 1 },
      uAperture: { value: 0.02 }, uMaxBlur: { value: 10 }, uBloom: { value: 0.08 }, uExposure: { value: 1 },
      uTime: { value: 0 }, uFade: { value: 0 }, uVignette: { value: 0.35 },
    },
    vertexShader: FS_VERT,
    fragmentShader: `
      uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tBloom; uniform sampler2D tAO; uniform float uAO; uniform vec2 uRes;
      uniform float uNear, uFar, uFocus, uAperture, uMaxBlur, uBloom, uExposure, uTime, uFade, uVignette;
      varying vec2 vUv;
      float linZ(float d){ float z = d*2. - 1.; return 2.*uNear*uFar / (uFar + uNear - z*(uFar - uNear)); }
      float coc(float z){ return clamp(abs(1./uFocus - 1./z) * uAperture * uRes.y, 0., uMaxBlur); }
      const mat3 R2020 = mat3(vec3(1.6605,-0.1246,-0.0182), vec3(-0.5876,1.1329,-0.1006), vec3(-0.0728,-0.0083,1.1187));
      const mat3 TO2020 = mat3(vec3(0.6274,0.0691,0.0164), vec3(0.3293,0.9195,0.0880), vec3(0.0433,0.0113,0.8956));
      vec3 agxC(vec3 x){ vec3 x2=x*x; vec3 x4=x2*x2; return 15.5*x4*x2 - 40.14*x4*x + 31.96*x4 - 6.868*x2*x + 0.4298*x2 + 0.1191*x - 0.00232; }
      vec3 agx(vec3 c){
        const mat3 inset = mat3(vec3(0.856627153315983,0.137318972929847,0.11189821299995), vec3(0.0951212405381588,0.761241990602591,0.0767994186031903), vec3(0.0482516061458583,0.101439036467562,0.811302368396859));
        const mat3 outset = mat3(vec3(1.1271005818144368,-0.1413297634984383,-0.14132976349843826), vec3(-0.11060664309660323,1.157823702216272,-0.11060664309660294), vec3(-0.016493938717834573,-0.016493938717834257,1.2519364065950405));
        c = TO2020 * c; c *= uExposure; c = inset * c;
        c = clamp((log2(max(c, 1e-10)) + 12.47393) / 16.5, 0., 1.);
        c = agxC(c);
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = pow(max(c, 0.), vec3(1.15)); c = l + 1.32*(c - l);          // gentle "punchy" look
        c = smoothstep(0.0, 1.0, c) * 0.35 + c * 0.65;              // a touch more contrast
        c = outset * c; c = pow(max(vec3(0.), c), vec3(2.2)); return R2020 * c;
      }
      vec3 toSRGB(vec3 c){ c = clamp(c, 0., 1.); return mix(c*12.92, 1.055*pow(c, vec3(1./2.4)) - 0.055, step(0.0031308, c)); }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        float z = linZ(texture2D(tDepth, vUv).r);
        float r = coc(z);
        vec3 col = texture2D(tColor, vUv).rgb; float wsum = 1.;
        if (r > 0.6) {
          const float GA = 2.39996323;
          for (int i = 1; i < 40; i++) {
            float fi = float(i); float rr = sqrt(fi / 40.) * r;
            vec2 o = vec2(cos(fi*GA), sin(fi*GA)) * rr / uRes;
            vec2 uv = vUv + o;
            float zs = linZ(texture2D(tDepth, uv).r);
            float rs = coc(zs);
            float w = smoothstep(rr - 1.5, rr, max(rs, zs > z ? r : rs));
            col += texture2D(tColor, uv).rgb * w; wsum += w;
          }
          col /= wsum;
        }
        float ao = 0.;
        for (int ax = -2; ax < 2; ax++) for (int ay = -2; ay < 2; ay++) ao += texture2D(tAO, vUv + (vec2(float(ax), float(ay)) + 0.5) * 2. / uRes).r;
        ao /= 16.;
        col *= mix(1., pow(ao, 1.6), uAO);
        col += texture2D(tBloom, vUv).rgb * uBloom;
        col = agx(col);
        vec2 q = vUv - 0.5; q.x *= uRes.x / uRes.y;
        col *= 1. - uVignette * smoothstep(0.35, 1.05, length(q));
        col = toSRGB(col);
        col += (hash(vUv * uRes + fract(uTime) * 91.7) - 0.5) * 0.035;
        gl_FragColor = vec4(col * uFade, 1.);
      }`,
  }))

  /* ================================================================ */
  /*  SCREEN UI (2D canvas)                                            */
  /* ================================================================ */
  let lastUIKey = ''
  function drawPin(x: number, y: number, s: number, color: string) {
    ui.fillStyle = color
    ui.beginPath()
    ui.arc(x, y - s * 0.35, s * 0.42, Math.PI, 0)
    ui.quadraticCurveTo(x + s * 0.42, y + s * 0.1, x, y + s * 0.62)
    ui.quadraticCurveTo(x - s * 0.42, y + s * 0.1, x - s * 0.42, y - s * 0.35)
    ui.fill()
    ui.fillStyle = '#2a282e'
    ui.beginPath()
    ui.arc(x, y - s * 0.35, s * 0.16, 0, 7)
    ui.fill()
  }
  function drawUI(t: number, time: number) {
    const boot = seg(t, T.powerStart, T.powerStart + 0.3) * (1 - seg(t, T.barStart - 0.2, T.barStart + 0.2))
    const a = ease.out(seg(t, T.barStart, T.barEnd))
    const n = Math.round(opts.query.length * seg(t, T.typeStart, T.typeEnd))
    const blink = t < T.typeStart || t > T.typeEnd ? Math.floor(time * 2.2) % 2 : 1
    const hot = t >= T.enter ? 1 - seg(t, T.enter + 0.1, T.enter + 0.8) : 0
    const op = seg(t, T.enter + 0.1, T.enter + 0.3)
    const prog = seg(t, T.enter + 0.1, T.worldFadeEnd)
    const key = [boot.toFixed(2), a.toFixed(3), n, blink, hot.toFixed(2), op.toFixed(2), prog.toFixed(2), t >= T.enter && t < T.enter + 0.18].join('|')
    if (key === lastUIKey) return
    lastUIKey = key
    ui.setTransform(2, 0, 0, 2, 0, 0)
    const W = 1024, H = 640
    const bg = ui.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#24242b')
    bg.addColorStop(1, '#141419')
    ui.fillStyle = bg
    ui.fillRect(0, 0, W, H)
    const glow = ui.createRadialGradient(W * 0.5, H * 0.38, 10, W * 0.5, H * 0.38, 560)
    glow.addColorStop(0, 'rgba(120,160,220,0.10)')
    glow.addColorStop(1, 'rgba(120,160,220,0)')
    ui.fillStyle = glow
    ui.fillRect(0, 0, W, H)
    // window chrome
    ui.fillStyle = 'rgba(255,255,255,.04)'
    ui.fillRect(0, 0, W, 24)
    ;['#fe5f57', '#ffbc2e', '#28c840'].forEach((c, i) => {
      ui.fillStyle = c
      ui.beginPath()
      ui.arc(20 + i * 17, 12, 4.6, 0, 7)
      ui.fill()
    })
    ui.fillStyle = 'rgba(255,255,255,.45)'
    ui.font = '500 11px "Inter Tight", system-ui, sans-serif'
    ui.textAlign = 'right'
    ui.fillText('Thu 7:42 PM', W - 16, 16)
    if (boot > 0) {
      ui.globalAlpha = boot
      drawPin(W / 2, H / 2, 46, '#e07a54')
      ui.globalAlpha = 1
    }
    if (a <= 0) {
      uiTex.needsUpdate = true
      return
    }
    ui.globalAlpha = a
    // site header
    drawPin(46, 58, 20, '#e07a54')
    ui.textAlign = 'left'
    ui.fillStyle = '#f1ece4'
    ui.font = '600 17px "Inter Tight", system-ui, sans-serif'
    ui.fillText('Worldline Trips', 62, 64)
    ui.fillStyle = 'rgba(241,236,228,.6)'
    ui.font = '500 14px "Inter Tight", system-ui, sans-serif'
    ;['Tours', 'Flights', 'Hotels', 'Visa'].forEach((l, i) => ui.fillText(l, W - 300 + i * 70, 64))
    // headline
    ui.fillStyle = '#efe8df'
    ui.textAlign = 'center'
    ui.font = '84px "Instrument Serif", Georgia, serif'
    ui.fillText('Where to next?', W / 2, 228 - (1 - a) * 12)
    ui.fillStyle = 'rgba(239,233,223,.55)'
    ui.font = '19px "Inter Tight", system-ui, sans-serif'
    ui.fillText('Tours, stays and guides in 120 countries', W / 2, 268 - (1 - a) * 12)
    // search bar
    const pressed = t >= T.enter && t < T.enter + 0.18
    const s = (0.96 + 0.04 * a) * (pressed ? 0.985 : 1)
    const bw = 840 * s, bh = 104 * s, bx = (W - bw) / 2, by = 306 + (1 - a) * 16
    ui.shadowColor = 'rgba(0,0,0,.5)'
    ui.shadowBlur = 40
    ui.shadowOffsetY = 10
    ui.fillStyle = '#2b2d32'
    ui.beginPath()
    ui.roundRect(bx, by, bw, bh, 26)
    ui.fill()
    ui.shadowColor = 'transparent'
    ui.lineWidth = 2
    ui.strokeStyle = hot > 0 ? `rgba(224,122,85,${0.4 + hot * 0.6})` : 'rgba(255,255,255,.09)'
    ui.stroke()
    drawPin(bx + 44, by + bh / 2 + 4, 26, n ? '#e07a54' : '#6c6a72')
    const txt = opts.query.slice(0, n)
    ui.textAlign = 'left'
    ui.font = '500 34px "Inter Tight", system-ui, sans-serif'
    const tx = bx + 76, ty = by + bh / 2 + 12
    ui.fillStyle = n ? '#f2eee8' : '#76737c'
    ui.fillText(n ? txt : 'Search destinations, tours, dates…', tx, ty)
    if (blink && t < T.enter + 0.1) {
      ui.fillStyle = '#e07a54'
      ui.fillRect(tx + (n ? ui.measureText(txt).width : 0) + 4, ty - 30, 3.5, 38)
    }
    // search button
    const done = n === opts.query.length
    ui.fillStyle = done ? '#e07a54' : '#44434a'
    ui.beginPath()
    ui.roundRect(bx + bw - 150, by + 18, 132, bh - 36, 18)
    ui.fill()
    ui.fillStyle = '#fff'
    ui.font = '600 22px "Inter Tight", system-ui, sans-serif'
    ui.textAlign = 'center'
    ui.fillText('Search', bx + bw - 84, by + bh / 2 + 8)
    // popular chips / searching state
    if (op <= 0) {
      ui.font = '500 17px "Inter Tight", system-ui, sans-serif'
      const chips = ['Lake Brienz', 'Geiranger', 'Reykjavik', 'Dolomites', 'Bali']
      let cx = W / 2 - 330
      ui.textAlign = 'left'
      chips.forEach((c) => {
        const w = ui.measureText(c).width + 36
        ui.fillStyle = 'rgba(255,255,255,.06)'
        ui.beginPath()
        ui.roundRect(cx, by + bh + 30, w, 38, 19)
        ui.fill()
        ui.fillStyle = 'rgba(241,236,228,.75)'
        ui.fillText(c, cx + 18, by + bh + 55)
        cx += w + 12
      })
    } else {
      ui.globalAlpha = a * op
      ui.fillStyle = '#d9d5dd'
      ui.textAlign = 'center'
      ui.font = '22px "Inter Tight", system-ui, sans-serif'
      ui.fillText(`Searching 128 tours for “${opts.query.split(',')[0]}”…`, W / 2, by + bh + 58)
      ui.fillStyle = 'rgba(255,255,255,.1)'
      ui.beginPath()
      ui.roundRect(W / 2 - 200, by + bh + 82, 400, 6, 3)
      ui.fill()
      ui.fillStyle = '#e07a54'
      ui.beginPath()
      ui.roundRect(W / 2 - 200, by + bh + 82, Math.max(6, 400 * prog), 6, 3)
      ui.fill()
    }
    ui.globalAlpha = 1
    uiTex.needsUpdate = true
  }

  /* ================================================================ */
  /*  CAMERA                                                          */
  /* ================================================================ */
  const camPath = new THREE.CatmullRomCurve3([V(1.25, 1.36, 2.75), V(0.62, 1.2, 1.35), V(0.16, 1.04, 0.36), V(0.04, 0.98, -0.02)])
  const lookPath = new THREE.CatmullRomCurve3([V(-0.25, 1.05, -0.6), V(-0.05, 0.95, -0.55), V(0.03, 0.87, -0.56), V(0.04, 0.87, -0.58)])
  const tmpC = V(0, 0, 0), tmpN = V(0, 0, 0), tmpUp = V(0, 0, 0)
  function fillDistance() {
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    return Math.min(SH / (2 * tanH), SW / (2 * tanH * camera.aspect))
  }
  const innerBase = 44
  function matchInnerFov(aspect: number, t: number) {
    const rtAspect = SW / SH
    if (aspect > rtAspect) {
      const tanHalfH = Math.tan(THREE.MathUtils.degToRad(innerBase / 2)) * rtAspect
      innerCam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanHalfH / aspect))
    } else innerCam.fov = innerBase + (aspect < 1 ? 20 * ease.inOut(seg(t, T.diveEnd, T.diveEnd + 3)) : 0)
    innerCam.aspect = aspect
    innerCam.updateProjectionMatrix()
  }
  function innerPose(t: number, time: number, out: Any, look: Any) {
    const p = ease.inOut(seg(t, T.diveEnd - 0.6, T.innerEnd))
    const drift = Math.min(t, T.diveEnd) * 0.8
    out.lerpVectors(V(-4, 7.5, 190 - drift), V(-10, 9.5, 66), p)
    out.y += Math.sin(time * 0.35) * 0.08
    look.lerpVectors(V(60, 40, -3000), V(100, 95, -3200), p)
  }


  /* ================================================================ */
  /*  FRAME                                                           */
  /* ================================================================ */
  let fade = 0
  let W = 1, H = 1
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(w, h, false)
    W = Math.floor(w * pixelRatio)
    H = Math.floor(h * pixelRatio)
    camera.aspect = w / h
    camera.fov = camera.aspect < 1 ? 56 : 36
    camera.updateProjectionMatrix()
    mainRT.setSize(W, H)
    mainRT.depthTexture.image.width = W
    mainRT.depthTexture.image.height = H
    let bw = W, bh = H
    for (let i = 0; i < LEVELS; i++) {
      bw = Math.max(1, bw >> 1)
      bh = Math.max(1, bh >> 1)
      bloomDown[i].setSize(bw, bh)
      bloomUp[i].setSize(bw, bh)
    }
    finalMat.uniforms.uRes.value.set(W, H)
    aoRT.setSize(Math.max(1, W >> 1), Math.max(1, H >> 1))
    aoMat.uniforms.uRes.value.set(Math.max(1, W >> 1), Math.max(1, H >> 1))
  }

  function pass(mat: Any, target: Any) {
    fsQuad.material = mat
    renderer.setRenderTarget(target)
    renderer.render(fsScene, fsCam)
  }

  function renderWorldInto(target: Any, cam: Any) {
    // planar reflection from a mirrored camera
    reflCam.copy(cam)
    reflCam.position.set(cam.position.x, -cam.position.y, cam.position.z)
    const look = V(0, 0, -1).applyQuaternion(cam.quaternion).add(cam.position)
    reflCam.up.set(0, 1, 0)
    reflCam.lookAt(look.x, -look.y, look.z)
    reflCam.updateMatrixWorld()
    reflCam.updateProjectionMatrix()
    water.visible = false
    renderer.clippingPlanes = clipAbove
    renderer.setRenderTarget(reflRT)
    renderer.render(world, reflCam)
    renderer.clippingPlanes = []
    water.visible = true
    waterMat.uniforms.uReflMat.value.multiplyMatrices(reflCam.projectionMatrix, reflCam.matrixWorldInverse)
    renderer.setRenderTarget(target)
    renderer.render(world, cam)
  }

  let dtAvg = 1 / 60
  function render(t: number, time: number, dt: number) {
    dtAvg = dtAvg * 0.95 + dt * 0.05
    // adaptive resolution for slower GPUs
    if (dtAvg > 1 / 32 && pixelRatio > 0.75 && time > 3) {
      pixelRatio = Math.max(0.75, pixelRatio - 0.25)
      dtAvg = 1 / 60
      resize()
    }

    // --- laptop
    lid.rotation.x = THREE.MathUtils.lerp(LID_CLOSED, LID_OPEN, ease.inOut(seg(t, T.lidStart, T.lidEnd)))
    let power = ease.out(seg(t, T.powerStart, T.powerEnd))
    if (t > T.powerStart && t < T.powerStart + 0.25) power *= 0.6 + 0.4 * Math.sin(time * 90) ** 2
    const dp = ease.in(seg(t, T.diveStart, T.diveEnd))
    screenMat.emissiveIntensity = power * 1.25
    screenUniforms.uMix.value = ease.smooth(seg(t, T.worldFadeStart, T.worldFadeEnd))
    screenMat.envMapIntensity = 1 - dp
    screenMat.clearcoat = 1 - dp
    drawUI(t, time)

    lid.updateWorldMatrix(true, false)
    screen.updateWorldMatrix(false, false)
    screen.getWorldPosition(tmpC)
    tmpN.set(0, 0, 1).transformDirection(screen.matrixWorld)
    tmpUp.set(0, 1, 0).transformDirection(screen.matrixWorld)

    // --- main camera: glide in, then dive into the screen
    const ap = ease.out(seg(t, 0, T.approachEnd))
    const pos = camPath.getPointAt(ap), look = lookPath.getPointAt(ap)
    if (camera.aspect < 1) pos.sub(look).multiplyScalar(1.75).add(look) // portrait: step back so the laptop fits
    // handheld breathing (fades out during the dive)
    const hh = (1 - dp) * 0.006
    pos.x += Math.sin(time * 0.71) * hh
    pos.y += Math.sin(time * 0.53 + 1) * hh
    if (dp > 0) {
      pos.lerp(tmpC.clone().addScaledVector(tmpN, fillDistance()), dp)
      look.lerp(tmpC, dp)
    }
    camera.position.copy(pos)
    camera.up.set(0, 1, 0).lerp(tmpUp, dp).normalize()
    camera.lookAt(look)
    camera.updateMatrixWorld()

    // --- animated bits
    shaftMat.uniforms.uTime.value = time
    dustMat.uniforms.uTime.value = time
    dustMat.uniforms.uPR.value = pixelRatio * (H / pixelRatio / 900) * 2.4
    waterMat.uniforms.uTime.value = time
    skyMat.uniforms.uTime.value = time
    boats.forEach((b, i) => {
      b.position.y = -0.18 + Math.sin(time * 1.1 + i * 1.7) * 0.05
      b.rotation.z = Math.sin(time * 0.9 + i) * 0.025
    })

    const il = V(0, 0, 0)
    innerPose(t, time, innerCam.position, il)
    innerCam.up.set(0, 1, 0)
    innerCam.lookAt(il)

    const inside = t >= T.diveEnd
    if (!inside) {
      if (power > 0.001 && screenUniforms.uMix.value > 0.001) {
        innerCam.fov = innerBase
        innerCam.aspect = SW / SH
        innerCam.updateProjectionMatrix()
        innerCam.updateMatrixWorld()
        renderWorldInto(worldRT, innerCam)
      }
      renderWorldTargetRoom()
    } else {
      matchInnerFov(camera.aspect, t)
      innerCam.updateMatrixWorld()
      renderWorldInto(mainRT, innerCam)
    }

    // --- post
    const fu = finalMat.uniforms
    if (!inside) {
      fu.uNear.value = camera.near
      fu.uFar.value = camera.far
      const focusTarget = ap < 0.35 ? camera.position.distanceTo(V(0.04, 0.86, -0.55)) : camera.position.distanceTo(tmpC)
      fu.uFocus.value = focusTarget
      fu.uAperture.value = THREE.MathUtils.lerp(0.012, 0.0045, ap) * (1 - dp)
      fu.uMaxBlur.value = 12
    } else {
      fu.uNear.value = innerCam.near
      fu.uFar.value = innerCam.far
      fu.uFocus.value = 1800
      fu.uAperture.value = 0.004 * seg(t, T.diveEnd, T.diveEnd + 1.2)
      fu.uMaxBlur.value = 8
    }
    // ambient occlusion (room only)
    fu.uAO.value = inside ? 0 : 1
    if (!inside) {
      aoMat.uniforms.uProj.value.copy(camera.projectionMatrix)
      aoMat.uniforms.uProjInv.value.copy(camera.projectionMatrixInverse)
      pass(aoMat, aoRT)
    }
    // bloom
    brightMat.uniforms.tSrc.value = mainRT.texture
    brightMat.uniforms.uThreshold.value = inside || screenUniforms.uMix.value > 0.5 ? 2.6 : 1.4
    pass(brightMat, bloomDown[0])
    for (let i = 1; i < LEVELS; i++) {
      downMat.uniforms.tSrc.value = bloomDown[i - 1].texture
      downMat.uniforms.uTexel.value.set(1 / bloomDown[i - 1].width, 1 / bloomDown[i - 1].height)
      pass(downMat, bloomDown[i])
    }
    let small = bloomDown[LEVELS - 1]
    for (let i = LEVELS - 2; i >= 0; i--) {
      upMat.uniforms.tSmall.value = small.texture
      upMat.uniforms.tCur.value = bloomDown[i].texture
      upMat.uniforms.uTexel.value.set(1 / small.width, 1 / small.height)
      pass(upMat, bloomUp[i])
      small = bloomUp[i]
    }
    fu.tBloom.value = bloomUp[0].texture
    fu.uBloom.value = inside ? 0.12 : 0.1
    fu.uExposure.value = inside ? 1.55 : 1.3
    fu.uTime.value = time
    fu.uFade.value = fade
    fu.uVignette.value = 0.38
    pass(finalMat, null)
  }
  function renderWorldTargetRoom() {
    renderer.setRenderTarget(mainRT)
    renderer.render(room, camera)
  }

  return {
    render,
    resize,
    setFade: (f: number) => {
      fade = ease.smooth(clamp01(f))
    },
    dispose: () => {
      disposables.forEach((d) => d?.dispose?.())
      renderer.dispose()
    },
    gl: renderer.getContext(),
  }
}
