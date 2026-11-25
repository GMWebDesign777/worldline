/*
 * Destinations — a road trip from Dhaka: scrolling drives a car down a winding road, and each stop opens its tour card.
 * 100% self-contained.
 * Needs: only React 18 + Tailwind CSS. Fonts load from Google Fonts (no npm package).
 */
import { useEffect, useRef, useState } from 'react'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap'

const FRAME_H = 2200

/** Example tours and prices (USD) — replace with real packages.
 *  Photos: Wikimedia Commons (free licences, credited on the card). Image links are the CDN URLs below. */
const PLACES = [
  {
    name: 'Sajek Valley',
    route: 'About 9 hours by road from Dhaka',
    mode: 'road' as 'road' | 'air',
    img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Sajek_Valley_Bangladesh.jpg/960px-Sajek_Valley_Bangladesh.jpg',
    pos: '50% 35%',
    alt: "Clouds over the green hills of Sajek Valley",
    credit: { author: 'Zohrakeya', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Sajek_Valley_Bangladesh.jpg' },
    coord: '23.38° N · 92.29° E',
    country: 'Bangladesh',
    days: '3 days',
    note: 'A night in a hill cottage, so you are up for the clouds at 6 am.',
    light: 'Sunrise 6:05 am',
    temp: '18°C',
    price: '$159',
    sky: 'bg-[radial-gradient(80%_50%_at_30%_40%,#FFE7C2_0%,rgba(255,231,194,0)_60%),linear-gradient(180deg,#A9C2D6_0%,#E9E3D6_45%,#F4EEE6_58%,#6E8B63_70%,#2E4A31_100%)]',
  },
  {
    name: "Cox's Bazar",
    route: '1 hour by air, or overnight by bus',
    mode: 'air' as 'road' | 'air',
    img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Cox%27s_Bazar_sea_beach_01.jpg/960px-Cox%27s_Bazar_sea_beach_01.jpg',
    pos: '62% 50%',
    alt: "Sunset over the wet sand at Cox's Bazar sea beach",
    credit: { author: 'Tanweer Morshed', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Cox%27s_Bazar_sea_beach_01.jpg' },
    coord: '21.43° N · 92.01° E',
    country: 'Bangladesh',
    days: '3 days',
    note: 'Three nights near Kolatoli beach, with a day trip down to Inani.',
    light: 'Sunset 5:12 pm',
    temp: '27°C',
    price: '$189',
    sky: 'bg-[radial-gradient(90%_60%_at_50%_68%,#FFD39A_0%,rgba(255,211,154,0)_60%),linear-gradient(180deg,#5B6FA3_0%,#E59B78_55%,#F7C58C_64%,#2F5B6E_66%,#1E3442_100%)]',
  },
  {
    name: 'Pokhara',
    route: 'Fly via Kathmandu, about 3 hours',
    mode: 'air' as 'road' | 'air',
    img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Annapurna_range_from_Pokhara.jpg/960px-The_Annapurna_range_from_Pokhara.jpg',
    pos: '50% 40%',
    alt: "Phewa Lake and the Annapurna range above Pokhara",
    credit: { author: 'Jmhullot', license: 'CC BY 3.0', page: 'https://commons.wikimedia.org/wiki/File:The_Annapurna_range_from_Pokhara.jpg' },
    coord: '28.21° N · 83.99° E',
    country: 'Nepal',
    days: '5 days',
    note: 'Two nights at Lakeside, a boat on Phewa Lake and sunrise from Sarangkot.',
    light: 'Sunset 5:24 pm',
    temp: '19°C',
    price: '$449',
    sky: 'bg-[radial-gradient(120%_70%_at_70%_100%,#F3B79A_0%,rgba(243,183,154,0)_55%),linear-gradient(180deg,#2E3F6E_0%,#8C7FA6_48%,#E7B6A6_72%,#4B4E63_100%)]',
  },
  {
    name: 'Ubud',
    route: 'One stop via Kuala Lumpur or Singapore',
    mode: 'air' as 'road' | 'air',
    img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Rice_terraces%2C_Ubud%2C_Bali.jpg/960px-Rice_terraces%2C_Ubud%2C_Bali.jpg',
    pos: '35% 50%',
    alt: "Rice terraces and palm trees near Ubud",
    credit: { author: 'Vyacheslav Argenberg', license: 'CC BY 4.0', page: 'https://commons.wikimedia.org/wiki/File:Rice_terraces,_Ubud,_Bali.jpg' },
    coord: '8.51° S · 115.26° E',
    country: 'Bali, Indonesia',
    days: '6 days',
    note: 'Rice terraces, a cooking class and a morning at Tirta Empul.',
    light: 'Sunset 6:22 pm',
    temp: '28°C',
    price: '$799',
    sky: 'bg-[radial-gradient(70%_50%_at_75%_55%,#FFC27A_0%,rgba(255,194,122,0)_60%),linear-gradient(180deg,#3D5A6B_0%,#C99668_52%,#7C8A3E_68%,#2F4720_100%)]',
  },
]

const CREDITS =
  "Photos from Wikimedia Commons: Sajek Valley by Zohrakeya (CC BY-SA 4.0), Cox's Bazar by Tanweer Morshed (CC BY-SA 3.0), Pokhara by Jmhullot (CC BY 3.0), Ubud by Vyacheslav Argenberg (CC BY 4.0)."

export default function Destinations() {
  return <Responsive desktop={<Desktop />} mobile={<Mobile />} />
}

/* ------------------------------------------------------------------ */
/*  Desktop: a road winds down the page as you scroll. A small car     */
/*  drives along it, and each stop opens its tour card on arrival.     */
/* ------------------------------------------------------------------ */
const ROUTE: [number, number][] = [
  [800, 400], [960, 500], [900, 640], [640, 820], [700, 1020], [960, 1200], [900, 1400], [640, 1580], [700, 1780], [880, 1920], [800, 2040],
]
const STOP_POINTS = [2, 4, 6, 8] // indexes in ROUTE where the tours sit
const CARD_W = 480
const CARD_H = 300

function Desktop() {
  const sectionRef = useRef<HTMLElement>(null)
  const roadRef = useRef<SVGPathElement>(null)
  const doneRef = useRef<SVGPathElement>(null)
  const carRef = useRef<SVGGElement>(null)
  const [arrived, setArrived] = useState(-1) // last stop reached (-1 = still in Dhaka)
  const reduced = usePrefersReduced()
  const d = smoothPath(ROUTE)

  useEffect(() => {
    const section = sectionRef.current, road = roadRef.current, done = doneRef.current, car = carRef.current
    if (!section || !road || !done || !car) return
    const total = road.getTotalLength()
    // length → y lookup, and the length at which each stop sits
    const samples: { l: number; y: number }[] = []
    for (let l = 0; l <= total; l += 4) samples.push({ l, y: road.getPointAtLength(l).y })
    const stopLen = STOP_POINTS.map((i) => {
      const [sx, sy] = ROUTE[i]
      let best = 0, bd = Infinity
      for (let l = 0; l <= total; l += 2) {
        const p = road.getPointAtLength(l)
        const dd = (p.x - sx) ** 2 + (p.y - sy) ** 2
        if (dd < bd) { bd = dd; best = l }
      }
      return best
    })
    done.style.strokeDasharray = `${total} ${total}`
    let cur = reduced ? total : 0, target = cur, raf = 0, lastArrived = -2
    const lengthForY = (y: number) => {
      if (y <= samples[0].y) return 0
      for (let i = 1; i < samples.length; i++) if (samples[i].y >= y) return samples[i].l
      return total
    }
    const draw = () => {
      cur += (target - cur) * 0.08
      if (Math.abs(target - cur) < 0.2) cur = target
      done.style.strokeDashoffset = String(total - cur)
      const p = road.getPointAtLength(cur)
      const q = road.getPointAtLength(Math.min(total, cur + 2))
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
      car.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`)
      let a = -1
      stopLen.forEach((l, i) => { if (cur >= l - 6) a = i })
      if (a !== lastArrived) { lastArrived = a; setArrived(a) }
      raf = cur !== target ? requestAnimationFrame(draw) : 0
    }
    const onScroll = () => {
      if (reduced) return
      const r = section.getBoundingClientRect()
      const scale = r.width / 1600
      const designY = (window.innerHeight * 0.62 - r.top) / scale // the "camera line" in design units
      target = lengthForY(designY)
      if (!raf) raf = requestAnimationFrame(draw)
    }
    onScroll()
    draw()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduced])

  return (
    <Artboard height={FRAME_H} id="destinations" className="bg-[#1E3A2E]" sectionRef={sectionRef}>
      <Topo width={1600} height={FRAME_H} color="#EDEEE8" opacity={0.05} cx={260} cy={1500} rings={30} />
      <div style={at(120, 128)}>
        <Reveal>
          <Label light>Booked most this month</Label>
        </Reveal>
      </div>
      <div style={at(120, 178, 900)}>
        <Reveal delay={150}>
          <h2 className="font-['Outfit',system-ui,sans-serif] text-[92px] font-bold leading-[0.95] tracking-[-0.035em] text-[#EDEEE8]">
            Where people are
            <br />
            going <span className="text-[#F3A26B]">in November</span>
          </h2>
        </Reveal>
      </div>
      <div style={at(1060, 214, 420)}>
        <Reveal delay={250}>
          <p className="text-[18px] leading-[1.6] text-[#EDEEE8]/70">
            Four trips, starting from Dhaka. Scroll down the road to see each stop, what the tour includes and what it costs.
          </p>
        </Reveal>
      </div>

      {/* the road */}
      <svg style={at(0, 0, 1600, FRAME_H)} viewBox={`0 0 1600 ${FRAME_H}`} aria-hidden className="pointer-events-none">
        <path d={d} fill="none" stroke="#EDEEE8" strokeOpacity=".08" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={roadRef} d={d} fill="none" stroke="#17312A" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#EDEEE8" strokeOpacity=".28" strokeWidth="2.5" strokeDasharray="14 16" strokeLinecap="round" />
        <path ref={doneRef} d={d} fill="none" stroke="#E8824A" strokeWidth="5" strokeLinecap="round" />
        {/* start: Dhaka */}
        <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="13" fill="#EDEEE8" />
        <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="6" fill="#1E3A2E" />
        {/* stops */}
        {STOP_POINTS.map((idx, i) => {
          const [x, y] = ROUTE[idx]
          const on = arrived >= i
          const right = x > 800
          const x2 = right ? 1000 : 600
          return (
            <g key={idx}>
              <path
                d={`M${x} ${y} H${x2}`}
                stroke="#E8824A"
                strokeWidth="2"
                strokeDasharray="4 6"
                style={{ opacity: on ? 1 : 0, transition: 'opacity 500ms ease' }}
              />
              <circle cx={x} cy={y} r={on ? 26 : 18} fill="#E8824A" fillOpacity=".18" style={{ transition: 'r 600ms cubic-bezier(0.22,1,0.36,1)' }} />
              <circle cx={x} cy={y} r="15" fill={on ? '#E8824A' : '#17312A'} stroke={on ? '#E8824A' : '#EDEEE8'} strokeOpacity={on ? 1 : 0.35} strokeWidth="2" style={{ transition: 'fill 400ms ease' }} />
              <text x={x} y={y + 5} textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="15" fill={on ? '#14261E' : '#EDEEE8'}>
                {i + 1}
              </text>
            </g>
          )
        })}
        {/* end */}
        <circle cx={ROUTE[ROUTE.length - 1][0]} cy={ROUTE[ROUTE.length - 1][1]} r="13" fill="#EDEEE8" fillOpacity=".25" />
        {/* the car */}
        <g ref={carRef}>
          <ellipse cx="0" cy="3" rx="17" ry="9" fill="#000" fillOpacity=".25" />
          <rect x="-16" y="-9" width="32" height="18" rx="7" fill="#F6F9F4" />
          <rect x="3" y="-7" width="8" height="14" rx="3" fill="#1E3A2E" fillOpacity=".75" />
          <rect x="-12" y="-7" width="6" height="14" rx="2.5" fill="#1E3A2E" fillOpacity=".5" />
          <rect x="13" y="-7" width="3" height="4" rx="1" fill="#F3A26B" />
          <rect x="13" y="3" width="3" height="4" rx="1" fill="#F3A26B" />
        </g>
      </svg>

      {/* start / end labels */}
      <div style={at(ROUTE[0][0] + 26, ROUTE[0][1] - 13)} className="whitespace-nowrap text-[16px] font-medium text-[#EDEEE8]/80">
        Leaving from Dhaka
      </div>
      <div style={at(ROUTE[ROUTE.length - 1][0] + 48, ROUTE[ROUTE.length - 1][1] - 16)}>
        <ArrowLink href="#start">40 more destinations</ArrowLink>
      </div>

      {/* how you get there, on the empty side of each stop */}
      {PLACES.map((p, i) => {
        const [x, y] = ROUTE[STOP_POINTS[i]]
        const right = x > 800
        const on = arrived >= i
        return (
          <div
            key={p.name + '-route'}
            style={{
              ...at(right ? x - 420 : x + 50, y - 22, 370, 44),
              opacity: on ? 1 : 0,
              transition: 'opacity 700ms ease 250ms',
            }}
            className={`flex items-center gap-[10px] text-[16px] text-[#EDEEE8]/75 ${right ? 'flex-row-reverse text-right' : ''}`}
          >
            <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-[#EDEEE8]/20 text-[#F3A26B]">
              {p.mode === 'road' ? <CarIcon /> : <PlaneIcon />}
            </span>
            {p.route}
          </div>
        )
      })}

      {/* tour cards, one per stop */}
      {PLACES.map((p, i) => {
        const [x, y] = ROUTE[STOP_POINTS[i]]
        const right = x > 800
        const on = arrived >= i
        return (
          <div
            key={p.name}
            style={{
              ...at(right ? 1000 : 600 - CARD_W, y - CARD_H / 2, CARD_W, CARD_H),
              opacity: on ? 1 : 0,
              transform: on ? 'none' : `translate3d(${right ? 40 : -40}px, 16px, 0) scale(0.97)`,
              transition: 'opacity 600ms ease, transform 900ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <StopCard place={p} n={i + 1} shown={on} />
          </div>
        )
      })}

      <div style={at(120, FRAME_H - 96, 1360)} className="text-[15px] leading-[1.6] text-[#EDEEE8]/55">
        Prices are per person in US dollars and include stays, local transport and a guide. International flights are extra.
        <br />
        <span className="text-[#EDEEE8]/40">{CREDITS}</span>
      </div>
    </Artboard>
  )
}

function StopCard({ place, n, shown }: { place: (typeof PLACES)[number]; n: number; shown: boolean }) {
  return (
    <a
      href="#start"
      className="group flex h-full gap-[18px] rounded-[22px] bg-[#F6F9F4] p-[12px] text-[#18231C] shadow-[0_30px_60px_-30px_rgba(0,0,0,.65)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[4px]"
    >
      <div className="relative w-[190px] shrink-0 overflow-hidden rounded-[14px]">
        <div className={`absolute inset-0 ${place.sky}`} />
        <img
          src={place.img}
          alt={place.alt}
          loading="lazy"
          style={{ objectPosition: place.pos, transform: shown ? 'scale(1)' : 'scale(1.12)', transition: 'transform 1800ms cubic-bezier(0.22,1,0.36,1)' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-[8px] pr-[8px]">
        <div className="text-[15px] font-medium text-[#C35F2D]">Stop {n} · {place.country}</div>
        <h3 className="mt-[6px] font-['Outfit',system-ui,sans-serif] text-[30px] font-semibold leading-none tracking-[-0.02em] text-[#1E3A2E]">{place.name}</h3>
        <p className="mt-[12px] text-[16px] leading-[1.5] text-[#18231C]/75">{place.note}</p>
        <div className="mt-auto flex items-end justify-between border-t border-[#1E3A2E]/10 pt-[12px]">
          <div className="text-[15px] text-[#18231C]/60">
            {place.days} · from <span className="font-['Outfit',system-ui,sans-serif] text-[22px] font-semibold text-[#1E3A2E]">{place.price}</span>
          </div>
          <span className="flex items-center gap-[4px] text-[15px] font-semibold text-[#C35F2D]">
            Tour
            <Arrow />
          </span>
        </div>
      </div>
    </a>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile: a straight road down the left edge fills as you scroll;   */
/*  each card opens when the road reaches its pin.                    */
/* ------------------------------------------------------------------ */
function Mobile() {
  const listRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const pinRefs = useRef<(HTMLDivElement | null)[]>([])
  const [arrived, setArrived] = useState(-1)
  const reduced = usePrefersReduced()
  useEffect(() => {
    const list = listRef.current, fill = fillRef.current
    if (!list || !fill) return
    let cur = 0, target = 0, raf = 0, last = -2
    const draw = () => {
      cur += (target - cur) * 0.1
      if (Math.abs(target - cur) < 0.5) cur = target
      fill.style.height = `${cur}px`
      let a = -1
      pinRefs.current.forEach((p, i) => { if (p && cur >= p.offsetTop + 10) a = i })
      if (a !== last) { last = a; setArrived(a) }
      raf = cur !== target ? requestAnimationFrame(draw) : 0
    }
    const onScroll = () => {
      const r = list.getBoundingClientRect()
      target = reduced ? r.height : Math.max(0, Math.min(r.height, window.innerHeight * 0.7 - r.top))
      if (!raf) raf = requestAnimationFrame(draw)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced])
  return (
    <section id="destinations" className="relative overflow-hidden bg-[#1E3A2E] px-5 py-20">
      <Topo width={390} height={1400} color="#EDEEE8" opacity={0.05} cx={60} cy={1200} rings={18} />
      <div className="relative">
        <Reveal>
          <Label light>Booked most this month</Label>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="mt-5 font-['Outfit',system-ui,sans-serif] text-[48px] font-bold leading-[0.95] tracking-[-0.035em] text-[#EDEEE8]">
            Where people are going <span className="text-[#F3A26B]">in November</span>
          </h2>
        </Reveal>
        <p className="mt-5 text-[16px] leading-[1.6] text-[#EDEEE8]/70">Four trips, starting from Dhaka.</p>
        <div ref={listRef} className="relative mt-10 pl-[46px]">
          {/* road */}
          <div className="absolute bottom-0 left-[11px] top-0 w-[22px] rounded-full bg-[#17312A]" />
          <div className="absolute bottom-0 left-[21px] top-0 w-[2px] bg-[repeating-linear-gradient(180deg,rgba(236,238,232,.3)_0_10px,transparent_10px_22px)]" />
          <div ref={fillRef} className="absolute left-[20px] top-0 w-[4px] rounded-full bg-[#E8824A]" />
          <div className="mb-8 flex items-center gap-3 text-[16px] text-[#EDEEE8]/80">
            <span className="absolute left-[12px] h-[20px] w-[20px] rounded-full border-[5px] border-[#EDEEE8] bg-[#1E3A2E]" />
            Leaving from Dhaka
          </div>
          <div className="flex flex-col gap-8">
            {PLACES.map((p, i) => {
              const on = arrived >= i
              return (
                <div key={p.name} className="relative">
                  <div
                    ref={(el) => { pinRefs.current[i] = el }}
                    className={`absolute -left-[46px] top-[14px] flex h-[30px] w-[30px] items-center justify-center rounded-full text-[15px] font-bold transition-colors duration-500 ${
                      on ? 'bg-[#E8824A] text-[#14261E]' : 'border-2 border-[#EDEEE8]/35 bg-[#17312A] text-[#EDEEE8]'
                    } ml-[7px]`}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      opacity: on ? 1 : 0.15,
                      transform: on ? 'none' : 'translate3d(24px, 12px, 0)',
                      transition: 'opacity 600ms ease, transform 900ms cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    <MobileCard place={p} n={i + 1} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="mt-8 text-[15px] leading-[1.6] text-[#EDEEE8]/55">
          Prices are per person in US dollars and include stays, local transport and a guide.
          <br />
          <span className="text-[#EDEEE8]/40">{CREDITS}</span>
        </p>
        <div className="mt-6">
          <ArrowLink href="#start">40 more destinations</ArrowLink>
        </div>
      </div>
    </section>
  )
}

function MobileCard({ place, n }: { place: (typeof PLACES)[number]; n: number }) {
  return (
    <a href="#start" className="block rounded-[20px] bg-[#F6F9F4] p-[10px] text-[#18231C]">
      <div className="px-[6px] pt-[6px]">
        <div className="text-[15px] font-medium text-[#C35F2D]">Stop {n} · {place.country}</div>
        <h3 className="mt-[4px] font-['Outfit',system-ui,sans-serif] text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#1E3A2E]">{place.name}</h3>
        <p className="mt-[10px] text-[16px] leading-[1.5] text-[#18231C]/75">{place.note}</p>
        <div className="mt-[10px] flex items-center gap-[8px] text-[15px] text-[#1E3A2E]/70">
          {place.mode === 'road' ? <CarIcon /> : <PlaneIcon />}
          {place.route}
        </div>
        <div className="mb-[12px] mt-[8px] text-[15px] text-[#18231C]/60">
          {place.days} · from <span className="font-['Outfit',system-ui,sans-serif] text-[22px] font-semibold text-[#1E3A2E]">{place.price}</span>
        </div>
      </div>
      <div className="relative h-[190px] overflow-hidden rounded-[14px]">
        <div className={`absolute inset-0 ${place.sky}`} />
        <img src={place.img} alt={place.alt} loading="lazy" style={{ objectPosition: place.pos }} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </a>
  )
}

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M3 11h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="13.5" r="1" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1" fill="currentColor" />
    </svg>
  )
}
function PlaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  )
}

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
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
function Artboard({ height, children, id, className = '', sectionRef }: { height: number; children: React.ReactNode; id?: string; className?: string; sectionRef?: React.RefObject<HTMLElement | null> }) {
  const s = useDesignScale()
  return (
    <section ref={sectionRef} id={id} className={`relative overflow-hidden ${className}`} style={{ height: height * s }}>
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
    <span className={`inline-flex items-center gap-[10px] text-[16px] font-semibold ${light ? 'text-[#F3A26B]' : 'text-[#C35F2D]'}`}>
      <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
        <path d="M1 9 L7 3 L11 6 L15 1 L21 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  )
}
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-500 group-hover:-rotate-45">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-[3px] text-[17px] font-medium text-[#EDEEE8] transition-[background-size] duration-500 hover:bg-[length:100%_1px]"
    >
      {children}
      <span className="transition-transform duration-500 group-hover:translate-x-[3px]">
        <Arrow />
      </span>
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
