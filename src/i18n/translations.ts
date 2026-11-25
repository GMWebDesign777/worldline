export type Language = 'en' | 'ka';

export const DESTINATION_IMAGES = {
  brienz: '/src/assets/images/lake_brienz_switzerland_1795608395146.jpg',
  geiranger: '/src/assets/images/geirangerfjord_norway_1795608395531.jpg',
  vik: '/src/assets/images/vik_iceland_coast_1795608395624.jpg',
  dolomites: '/src/assets/images/dolomites_lake_como_1795608396330.jpg',
} as const;

export interface HeroTour {
  name: string;
  days: string;
  detail: string;
  price: string;
  rating: string;
}

export interface StepItem {
  wp: string;
  label: string;
  title: string;
  text: string;
  foot: string;
  art: 'search' | 'preview' | 'ticket';
}

export interface DestinationItem {
  name: string;
  route: string;
  mode: 'road' | 'air';
  img: string;
  pos: string;
  alt: string;
  coord: string;
  country: string;
  days: string;
  note: string;
  light: string;
  temp: string;
  price: string;
  sky: string;
}

export interface StatItem {
  value: string;
  suffix?: string;
  label: string;
  text: string;
  icon: 'check' | 'star' | 'tag' | 'globe' | 'phone' | 'cube';
  featured?: boolean;
}

export interface FooterColumn {
  title: string;
  links: string[];
}

export interface TranslationBundle {
  nav: {
    links: { label: string; href: string; dot?: boolean }[];
    newTag: string;
    cta: string;
    menuAria: string;
    langAria: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
    caption1: string;
    caption2: string;
    outroBadge: string;
    outroTitle: string;
    outroFrom: string;
    outroCta: string;
    fallbackAlt: string;
    tours: HeroTour[];
  };
  howItWorks: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    steps: StepItem[];
    artSearchTitle: string;
    artSearchQuery: string;
    artSearchButton: string;
    artSearchChips: [string, number][];
    artPreviewBadge: string;
    artPreviewAlt: string;
    artTicketFrom: string;
    artTicketTo: string;
    artTicketFields: [string, string, number][];
    artTicketConfirmed: string;
    artTicketPrice: string;
  };
  destinations: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    mobileDescription: string;
    leavingFrom: string;
    moreDestinations: string;
    stopPrefix: string;
    tourCta: string;
    fromPrefix: string;
    fromSuffix: string;
    footnote: string;
    mobileFootnote: string;
    places: DestinationItem[];
  };
  whyUs: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    stats: StatItem[];
    stages: string[];
  };
  footer: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    ideas: string[];
    tryPrefix: string;
    trySuffix: string;
    searchAria: string;
    searchButton: string;
    trustItems: string[];
    mobileTrust: string;
    coords: string;
    description: string;
    mobileDescription: string;
    emailPlaceholder: string;
    emailAria: string;
    subscribe: string;
    subscribed: string;
    columns: FooterColumn[];
    copyright: string;
    tagline: string;
    privacy: string;
    terms: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  en: {
    nav: {
      links: [
        { label: 'Destinations', href: '#destinations' },
        { label: 'How it works', href: '#how' },
        { label: 'Why us', href: '#numbers' },
        { label: 'Deals', href: '#start', dot: true },
      ],
      newTag: 'New',
      cta: 'Find a tour',
      menuAria: 'Menu',
      langAria: 'Switch language to Georgian',
    },
    hero: {
      badge: 'Your dream journey',
      titleLine1: 'Know the view',
      titleLine2: 'before you book.',
      description:
        'Every tour comes with a 3D preview of the actual place, so you can check the hotel view, the walk to the lake and the light at sunset before you pay.',
      ctaPrimary: 'Find a tour',
      ctaSecondary: 'Browse destinations',
      scrollHint: 'Scroll to begin',
      caption1: 'Most trips start at a desk like this one.',
      caption2: 'Type where you want to go, and when.',
      outroBadge: 'Lake Brienz, Switzerland · 4 tours for your dates',
      outroTitle: 'This is Brienci Lake at sunset.',
      outroFrom: 'from',
      outroCta: 'See all 4 tours',
      fallbackAlt: 'Lake Brienz and the Bernese Oberland peaks at sunset',
      tours: [
        {
          name: 'Lake Brienz & Bernese Oberland',
          days: '5 days',
          detail: 'Lakeside chalet · boat ride · local guide',
          price: '$890',
          rating: '4.9',
        },
        {
          name: 'Norwegian Fjords & Geiranger',
          days: '6 days',
          detail: 'Fjord cruise · mountain overlooks · transfers',
          price: '$1,190',
          rating: '4.9',
        },
        {
          name: 'Swiss Glacier Express & Zermatt',
          days: '7 days',
          detail: 'Panoramic train · alpine lodges · passes',
          price: '$1,450',
          rating: '4.8',
        },
        {
          name: 'Interlaken & Lauterbrunnen Valley',
          days: '4 days',
          detail: 'Waterfall trails · cable car · boutique stay',
          price: '$760',
          rating: '4.8',
        },
      ],
    },
    howItWorks: {
      label: 'How booking works',
      titleLine1: 'Three steps,',
      titleLine2: 'about ten minutes.',
      description:
        'Tell us where and when. Look around the place in 3D. If it looks right, book it, and we sort out the guide, the transfers and the tickets.',
      steps: [
        {
          wp: 'Step 1',
          label: 'Search',
          title: 'Pick a place and dates',
          text: 'Search by place, dates or budget. You see every tour that fits, with the full price in dollars.',
          foot: 'Takes about a minute',
          art: 'search',
        },
        {
          wp: 'Step 2',
          label: 'Preview',
          title: 'Look around first',
          text: 'Open the 3D preview to check the view from the hotel, the walk to the lake and how busy it gets at sunset.',
          foot: 'Available on every tour',
          art: 'preview',
        },
        {
          wp: 'Step 3',
          label: 'Book',
          title: 'Book and pack',
          text: 'Pay online. Your guide’s number, pickup time and tickets come by email and WhatsApp.',
          foot: 'Change dates free up to 7 days before',
          art: 'ticket',
        },
      ],
      artSearchTitle: 'Where to next?',
      artSearchQuery: 'Lake Brienz, Switzerland',
      artSearchButton: 'Search',
      artSearchChips: [
        ['Lakeside', 24],
        ['Alps', 100],
        ['With guide', 158],
        ['Fjords', 246],
      ],
      artPreviewBadge: '3D preview, sunset',
      artPreviewAlt: 'Lake Brienz and alpine peaks at sunset, Switzerland',
      artTicketFrom: 'TBS',
      artTicketTo: 'ZRH',
      artTicketFields: [
        ['Date', 'May 14', 18],
        ['Guests', '2', 98],
        ['Guide', 'Included', 158],
      ],
      artTicketConfirmed: '● Confirmed',
      artTicketPrice: '$890',
    },
    destinations: {
      label: 'Booked most this month',
      titleLine1: 'Where people are',
      titleLine2: 'going in November',
      description:
        'Your dream journey starting from Georgia. Scroll down the road to see each stop, what the tour includes and what it costs.',
      mobileDescription: 'Your dream journey starting from Georgia.',
      leavingFrom: 'Leaving from Georgia',
      moreDestinations: '40 more destinations',
      stopPrefix: 'Stop',
      tourCta: 'Tour',
      fromPrefix: 'from ',
      fromSuffix: '',
      footnote:
        'Prices are per person in US dollars and include stays, local transport and a guide. International flights are extra.',
      mobileFootnote:
        'Prices are per person in US dollars and include stays, local transport and a guide.',
      places: [
        {
          name: 'Lake Brienz & Interlaken',
          route: 'Fly from Tbilisi to Zurich, ~4.5h',
          mode: 'air',
          img: DESTINATION_IMAGES.brienz,
          pos: '50% 45%',
          alt: 'Turquoise waters of Lake Brienz surrounded by snow-dusted Bernese Alps at sunset',
          coord: '46.73° N · 7.97° E',
          country: 'Switzerland',
          days: '5 days',
          note: 'Alpine turquoise waters, snow-capped mountain peaks and two nights in a lakeside chalet.',
          light: 'Sunset 8:40 pm',
          temp: '16°C',
          price: '$890',
          sky: 'bg-[radial-gradient(80%_50%_at_30%_40%,#FFE7C2_0%,rgba(255,231,194,0)_60%),linear-gradient(180deg,#A9C2D6_0%,#E9E3D6_45%,#F4EEE6_58%,#3E7B78_70%,#1E3A3A_100%)]',
        },
        {
          name: 'Geirangerfjord & Lofoten',
          route: 'Fly from Tbilisi via Oslo, ~6h',
          mode: 'air',
          img: DESTINATION_IMAGES.geiranger,
          pos: '50% 50%',
          alt: 'Steep green cliffs and waterfalls cascading into Geirangerfjord in Norway',
          coord: '62.10° N · 7.20° E',
          country: 'Norway',
          days: '6 days',
          note: 'Dramatic Scandinavian fjords, waterfall boat cruises and crisp Nordic midnight sun.',
          light: 'Midnight sun',
          temp: '13°C',
          price: '$1,190',
          sky: 'bg-[radial-gradient(90%_60%_at_50%_68%,#C8E0EA_0%,rgba(200,224,234,0)_60%),linear-gradient(180deg,#4A617A_0%,#8FA5B5_55%,#2F5B6E_70%,#1E3442_100%)]',
        },
        {
          name: 'Vik & South Coast',
          route: 'Fly from Tbilisi to Keflavik, ~7h',
          mode: 'air',
          img: DESTINATION_IMAGES.vik,
          pos: '50% 50%',
          alt: 'Black volcanic sand beach and sea stacks at Vik along the South Coast of Iceland',
          coord: '63.42° N · 19.01° W',
          country: 'Iceland',
          days: '6 days',
          note: 'Black volcanic sand beaches, towering basalt sea stacks, waterfalls and glacier trails.',
          light: 'Sunset 9:15 pm',
          temp: '11°C',
          price: '$1,340',
          sky: 'bg-[radial-gradient(120%_70%_at_70%_100%,#F3B79A_0%,rgba(243,183,154,0)_55%),linear-gradient(180deg,#2E3F6E_0%,#8C7FA6_48%,#E7B6A6_72%,#2A303D_100%)]',
        },
        {
          name: 'Dolomites & Lake Como',
          route: 'Direct flight from Tbilisi to Milan, ~4h',
          mode: 'air',
          img: DESTINATION_IMAGES.dolomites,
          pos: '50% 45%',
          alt: 'Alpenglow on limestone peaks of the Italian Dolomites reflected in an alpine lake',
          coord: '46.54° N · 12.14° E',
          country: 'Italy',
          days: '5 days',
          note: 'Warm alpenglow peaks, quiet alpine villages and scenic mountain passes above emerald lakes.',
          light: 'Sunset 8:25 pm',
          temp: '20°C',
          price: '$940',
          sky: 'bg-[radial-gradient(70%_50%_at_75%_55%,#FFC27A_0%,rgba(255,194,122,0)_60%),linear-gradient(180deg,#3D5A6B_0%,#C99668_52%,#3E6B62_68%,#20372F_100%)]',
        },
      ],
    },
    whyUs: {
      label: 'Why people book with us',
      titleLine1: 'We do every tour',
      titleLine2: 'before we sell it.',
      description:
        'Someone from our team has stayed at the hotels and walked the routes before a tour goes on the site. The price you see includes everything on the itinerary.',
      stats: [
        {
          value: '4,800',
          label: 'Tours on the site',
          text: 'Each one checked by someone on our team before it goes live.',
          icon: 'check',
        },
        {
          value: '4.9',
          suffix: 'out of 5',
          label: 'Average tour rating',
          text: 'From travellers who finished a tour in the last 12 months.',
          icon: 'star',
        },
        {
          value: '$0',
          label: 'Booking fee',
          text: 'The price on the tour page is the price you pay.',
          icon: 'tag',
          featured: true,
        },
        {
          value: '120',
          label: 'Countries',
          text: 'Across Europe, Scandinavia and curated global routes.',
          icon: 'globe',
        },
        {
          value: '24/7',
          label: 'Help while you travel',
          text: 'Call or WhatsApp a real person, in Georgian or English.',
          icon: 'phone',
        },
        {
          value: '100%',
          label: 'Tours with a 3D preview',
          text: 'Look around the hotel and the route before you pay.',
          icon: 'cube',
        },
      ],
      stages: [
        'Paris',
        'Milan',
        'Berlin',
        'Zurich',
        'Oslo',
        'Stockholm',
        'Reykjavik',
        'Vienna',
        'Rome',
        'Amsterdam',
        'Bali',
        'Maldives',
        'Cappadocia',
        'Kyoto',
        'Santorini',
      ],
    },
    footer: {
      label: 'Start planning',
      titleLine1: 'Where do you',
      titleLine2: 'want to go next?',
      ideas: [
        'Lake Brienz, 5 days in May',
        'Geirangerfjord, Nordic summer',
        'Dolomites & Lake Como',
        'Vik Black Sand Coast, Iceland',
      ],
      tryPrefix: 'Try “',
      trySuffix: '”',
      searchAria: 'Where do you want to go?',
      searchButton: 'Search tours',
      trustItems: [
        'No booking fee',
        'Prices in US dollars',
        'Free date changes up to 7 days before',
      ],
      mobileTrust: 'No booking fees · Free date changes',
      coords: 'TBILISI · 41.71° N · 44.82° E',
      description:
        'Small-group tours with local guides, and a 3D preview of every place before you book. Our office is in Tbilisi.',
      mobileDescription:
        'Small-group tours with local guides. Our office is in Tbilisi.',
      emailPlaceholder: 'Email, for one deals email a month',
      emailAria: 'Email for travel deals',
      subscribe: 'Subscribe',
      subscribed: 'Subscribed',
      columns: [
        { title: 'Explore', links: ['Destinations', 'Tours', 'Deals', 'Gift cards'] },
        { title: 'Company', links: ['About us', 'Local partners', 'Careers', 'Journal'] },
        { title: 'Support', links: ['Help centre', 'Cancellations', 'Travel insurance', 'Contact'] },
      ],
      copyright: '© 2026 Worldline Trips',
      tagline: 'Curated journeys · 24/7 traveler support',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },
  ka: {
    nav: {
      links: [
        { label: 'მიმართულებები', href: '#destinations' },
        { label: 'როგორ მუშაობს', href: '#how' },
        { label: 'რატომ ჩვენ', href: '#numbers' },
        { label: 'შეთავაზებები', href: '#start', dot: true },
      ],
      newTag: 'ახალი',
      cta: 'ტურის პოვნა',
      menuAria: 'მენიუ',
      langAria: 'ენის შეცვლა ინგლისურზე',
    },
    hero: {
      badge: 'შენი სანატრელი მოგზაურობა',
      titleLine1: 'ნახე ხედი',
      titleLine2: 'დაჯავშნამდე.',
      description:
        'ყოველ ტურს ახლავს რეალური ადგილის 3D ნახვა — შეამოწმე სასტუმროს ხედი, ტბამდე ბილიკი და მზის ჩასვლის შუქი გადახდამდე.',
      ctaPrimary: 'ტურის პოვნა',
      ctaSecondary: 'მიმართულებები',
      scrollHint: 'ჩამოსქროლე დასაწყებად',
      caption1: 'მოგზაურობების უმეტესობა ასეთ მაგიდასთან იწყება.',
      caption2: 'ჩაწერე, სად და როდის გინდა წასვლა.',
      outroBadge: 'ბრიენცის ტბა, შვეიცარია · 4 ტური შენს თარიღებზე',
      outroTitle: 'ეს ბრიენცის ტბაა მზის ჩასვლისას.',
      outroFrom: 'ფასი',
      outroCta: 'ყველა 4 ტურის ნახვა',
      fallbackAlt: 'ბრიენცის ტბა და ბერნის ალპები მზის ჩასვლისას',
      tours: [
        {
          name: 'ბრიენცის ტბა და ბერნის ალპები',
          days: '5 დღე',
          detail: 'ტბისპირა შალე · ნავით გასეირნება · გიდი',
          price: '$890',
          rating: '4.9',
        },
        {
          name: 'ნორვეგიის ფიორდები და გეირანგერი',
          days: '6 დღე',
          detail: 'ფიორდების კრუიზი · პანორამული ხედები · ტრანსფერი',
          price: '$1,190',
          rating: '4.9',
        },
        {
          name: 'Glacier Express და ცერმატი',
          days: '7 დღე',
          detail: 'პანორამული მატარებელი · ალპური სასტუმრო · ბილეთები',
          price: '$1,450',
          rating: '4.8',
        },
        {
          name: 'ინტერლაკენი და ლაუტერბრუნენი',
          days: '4 დღე',
          detail: 'ჩანჩქერების ბილიკები · საბაგირო · ბუტიკ-სასტუმრო',
          price: '$760',
          rating: '4.8',
        },
      ],
    },
    howItWorks: {
      label: 'როგორ მუშაობს დაჯავშნა',
      titleLine1: 'სამი ნაბიჯი,',
      titleLine2: 'დაახლოებით ათი წუთი.',
      description:
        'გვითხარი სად და როდის. დაათვალიერე ადგილი 3D-ში. თუ მოგეწონება, დაჯავშნე — გიდს, ტრანსფერებსა და ბილეთებს ჩვენ მოვაგვარებთ.',
      steps: [
        {
          wp: 'ნაბიჯი 1',
          label: 'ძებნა',
          title: 'აირჩიე ადგილი და დრო',
          text: 'მოძებნე მიმართულების, თარიღების ან ბიუჯეტის მიხედვით. ნახავ ყველა შესაბამის ტურს სრული ფასით დოლარში.',
          foot: 'დაახლოებით ერთი წუთი სჭირდება',
          art: 'search',
        },
        {
          wp: 'ნაბიჯი 2',
          label: '3D ნახვა',
          title: 'ჯერ დაათვალიერე',
          text: 'გახსენი 3D ნახვა, რომ შეამოწმო ხედი სასტუმროდან, ტბამდე გზა და განწყობა მზის ჩასვლისას.',
          foot: 'ხელმისაწვდომია ყველა ტურზე',
          art: 'preview',
        },
        {
          wp: 'ნაბიჯი 3',
          label: 'დაჯავშნა',
          title: 'დაჯავშნე და ჩაალაგე',
          text: 'გადაიხადე ონლაინ. გიდის ნომერი, შეხვედრის დრო და ბილეთები ელფოსტასა და WhatsApp-ზე მოგივა.',
          foot: 'თარიღების უფასო შეცვლა 7 დღით ადრე',
          art: 'ticket',
        },
      ],
      artSearchTitle: 'სად მიდიხარ?',
      artSearchQuery: 'ბრიენცის ტბა, შვეიცარია',
      artSearchButton: 'ძებნა',
      artSearchChips: [
        ['ტბისპირა', 24],
        ['ალპები', 110],
        ['გიდით', 180],
        ['ფიორდები', 252],
      ],
      artPreviewBadge: '3D ნახვა, მზის ჩასვლა',
      artPreviewAlt: 'ბრიენცის ტბა და ალპური მწვერვალები მზის ჩასვლისას',
      artTicketFrom: 'TBS',
      artTicketTo: 'ZRH',
      artTicketFields: [
        ['თარიღი', '14 მაისი', 18],
        ['სტუმარი', '2', 102],
        ['გიდი', 'ჩართულია', 162],
      ],
      artTicketConfirmed: '● დადასტურებულია',
      artTicketPrice: '$890',
    },
    destinations: {
      label: 'თვის ყველაზე მოთხოვნადი',
      titleLine1: 'სად მიემგზავრებიან',
      titleLine2: 'ნოემბერში',
      description:
        'შენი საოცნებო მოგზაურობა საქართველოდან — ჩამოსქროლე გზას და ნახე თითოეული გაჩერება, რას მოიცავს ტური და რა ღირს.',
      mobileDescription: 'შენი საოცნებო მოგზაურობა საქართველოდან.',
      leavingFrom: 'გამგზავრება საქართველოდან',
      moreDestinations: 'კიდევ 40 მიმართულება',
      stopPrefix: 'გაჩერება',
      tourCta: 'ტური',
      fromPrefix: '',
      fromSuffix: '-დან',
      footnote:
        'ფასები მოცემულია ერთ ადამიანზე აშშ დოლარში და მოიცავს განთავსებას, ადგილობრივ ტრანსპორტსა და გიდს. საერთაშორისო ფრენები დამატებითია.',
      mobileFootnote:
        'ფასები მოცემულია ერთ ადამიანზე აშშ დოლარში და მოიცავს განთავსებას, ტრანსპორტსა და გიდს.',
      places: [
        {
          name: 'ბრიენცის ტბა და ინტერლაკენი',
          route: 'ფრენა თბილისიდან ციურიხში, ~4.5 სთ',
          mode: 'air',
          img: DESTINATION_IMAGES.brienz,
          pos: '50% 45%',
          alt: 'ბრიენცის ტბის ფირუზისფერი წყლები და ბერნის ალპები მზის ჩასვლისას',
          coord: '46.73° N · 7.97° E',
          country: 'შვეიცარია',
          days: '5 დღე',
          note: 'ფირუზისფერი ალპური წყლები, დათოვლილი მწვერვალები და ორი ღამე ტბისპირა შალეში.',
          light: 'მზის ჩასვლა 20:40',
          temp: '16°C',
          price: '$890',
          sky: 'bg-[radial-gradient(80%_50%_at_30%_40%,#FFE7C2_0%,rgba(255,231,194,0)_60%),linear-gradient(180deg,#A9C2D6_0%,#E9E3D6_45%,#F4EEE6_58%,#3E7B78_70%,#1E3A3A_100%)]',
        },
        {
          name: 'გეირანგერფიორდი და ლოფოტენი',
          route: 'ფრენა თბილისიდან ოსლოს გავლით, ~6 სთ',
          mode: 'air',
          img: DESTINATION_IMAGES.geiranger,
          pos: '50% 50%',
          alt: 'ნორვეგიის გეირანგერფიორდის მწვანე კლდეები და ჩანჩქერები',
          coord: '62.10° N · 7.20° E',
          country: 'ნორვეგია',
          days: '6 დღე',
          note: 'შთამბეჭდავი სკანდინავიური ფიორდები, ჩანჩქერების კრუიზი და ჩრდილოური თეთრი ღამეები.',
          light: 'თეთრი ღამეები',
          temp: '13°C',
          price: '$1,190',
          sky: 'bg-[radial-gradient(90%_60%_at_50%_68%,#C8E0EA_0%,rgba(200,224,234,0)_60%),linear-gradient(180deg,#4A617A_0%,#8FA5B5_55%,#2F5B6E_70%,#1E3442_100%)]',
        },
        {
          name: 'ვიკი და სამხრეთ სანაპირო',
          route: 'ფრენა თბილისიდან კეფლავიკში, ~7 სთ',
          mode: 'air',
          img: DESTINATION_IMAGES.vik,
          pos: '50% 50%',
          alt: 'ვიკის შავი ვულკანური ქვიშის სანაპირო და ბაზალტის კლდეები ისლანდიაში',
          coord: '63.42° N · 19.01° W',
          country: 'ისლანდია',
          days: '6 დღე',
          note: 'შავი ვულკანური ქვიშის პლაჟები, ბაზალტის კლდეები, ჩანჩქერები და მყინვარების ბილიკები.',
          light: 'მზის ჩასვლა 21:15',
          temp: '11°C',
          price: '$1,340',
          sky: 'bg-[radial-gradient(120%_70%_at_70%_100%,#F3B79A_0%,rgba(243,183,154,0)_55%),linear-gradient(180deg,#2E3F6E_0%,#8C7FA6_48%,#E7B6A6_72%,#2A303D_100%)]',
        },
        {
          name: 'დოლომიტები და კომოს ტბა',
          route: 'პირდაპირი ფრენა თბილისიდან მილანში, ~4 სთ',
          mode: 'air',
          img: DESTINATION_IMAGES.dolomites,
          pos: '50% 45%',
          alt: 'იტალიის დოლომიტების ვარდისფერი მწვერვალები და ალპური ტბა',
          coord: '46.54° N · 12.14° E',
          country: 'იტალია',
          days: '5 დღე',
          note: 'განთიადისფერი კლდოვანი მწვერვალები, ალპური სოფლები და თვალწარმტაცი უღელტეხილები.',
          light: 'მზის ჩასვლა 20:25',
          temp: '20°C',
          price: '$940',
          sky: 'bg-[radial-gradient(70%_50%_at_75%_55%,#FFC27A_0%,rgba(255,194,122,0)_60%),linear-gradient(180deg,#3D5A6B_0%,#C99668_52%,#3E6B62_68%,#20372F_100%)]',
        },
      ],
    },
    whyUs: {
      label: 'რატომ ჯავშნიან ჩვენთან',
      titleLine1: 'ყველა ტურს გავდივართ',
      titleLine2: 'გაყიდვამდე.',
      description:
        'ჩვენი გუნდის წევრი თავად რჩება სასტუმროებში და გადის მარშრუტებს ტურის გამოქვეყნებამდე. მითითებული ფასი მოიცავს პროგრამის ყველა ნაწილს.',
      stats: [
        {
          value: '4,800',
          label: 'ტური პლატფორმაზე',
          text: 'თითოეული შემოწმებულია ჩვენი გუნდის მიერ გამოქვეყნებამდე.',
          icon: 'check',
        },
        {
          value: '4.9',
          suffix: '5-დან',
          label: 'საშუალო შეფასება',
          text: 'ბოლო 12 თვეში დაბრუნებული მოგზაურების შეფასებებიდან.',
          icon: 'star',
        },
        {
          value: '$0',
          label: 'დაჯავშნის საკომისიო',
          text: 'ტურის გვერდზე მითითებული ფასი არის ზუსტად ის, რასაც იხდი.',
          icon: 'tag',
          featured: true,
        },
        {
          value: '120',
          label: 'ქვეყანა',
          text: 'ევროპაში, სკანდინავიასა და მსოფლიოს გამორჩეულ მარშრუტებზე.',
          icon: 'globe',
        },
        {
          value: '24/7',
          label: 'დახმარება მგზავრობისას',
          text: 'დაურეკე ან მისწერე რეალურ ადამიანს ქართულ და ინგლისურ ენებზე.',
          icon: 'phone',
        },
        {
          value: '100%',
          label: 'ტური 3D ნახვით',
          text: 'დაათვალიერე სასტუმრო და მარშრუტი გადახდამდე.',
          icon: 'cube',
        },
      ],
      stages: [
        'პარიზი',
        'მილანი',
        'ბერლინი',
        'ციურიხი',
        'ოსლო',
        'სტოკჰოლმი',
        'რეიკიავიკი',
        'ვენა',
        'რომი',
        'ამსტერდამი',
        'ბალი',
        'მალდივები',
        'კაპადოკია',
        'კიოტო',
        'სანტორინი',
      ],
    },
    footer: {
      label: 'დაიწყე დაგეგმვა',
      titleLine1: 'სად გინდა',
      titleLine2: 'გამგზავრება შემდეგ?',
      ideas: [
        'ბრიენცის ტბა, 5 დღე მაისში',
        'გეირანგერფიორდი, ნორვეგია',
        'დოლომიტები და კომოს ტბა',
        'ვიკის შავი სანაპირო, ისლანდია',
      ],
      tryPrefix: 'სცადე „',
      trySuffix: '“',
      searchAria: 'სად გინდა გამგზავრება?',
      searchButton: 'ტურების ძებნა',
      trustItems: [
        'საკომისიოს გარეშე',
        'ფასები აშშ დოლარში',
        'თარიღის უფასო შეცვლა 7 დღით ადრე',
      ],
      mobileTrust: 'საკომისიოს გარეშე · თარიღის უფასო შეცვლა',
      coords: 'თბილისი · 41.71° N · 44.82° E',
      description:
        'მცირე ჯგუფური ტურები ადგილობრივ გიდებთან ერთად და ყოველი ადგილის 3D ნახვა დაჯავშნამდე. ჩვენი ოფისი მდებარეობს თბილისში.',
      mobileDescription:
        'მცირე ჯგუფური ტურები ადგილობრივ გიდებთან. ჩვენი ოფისი მდებარეობს თბილისში.',
      emailPlaceholder: 'ელფოსტა, თვეში ერთი შეთავაზებისთვის',
      emailAria: 'ელფოსტა შეთავაზებებისთვის',
      subscribe: 'გამოწერა',
      subscribed: 'გამოწერილია',
      columns: [
        { title: 'აღმოაჩინე', links: ['მიმართულებები', 'ტურები', 'შეთავაზებები', 'სასაჩუქრე ბარათები'] },
        { title: 'კომპანია', links: ['ჩვენ შესახებ', 'პარტნიორები', 'კარიერა', 'ჟურნალი'] },
        { title: 'მხარდაჭერა', links: ['დახმარების ცენტრი', 'გაუქმება', 'დაზღვევა', 'კონტაქტი'] },
      ],
      copyright: '© 2026 Worldline Trips',
      tagline: 'შერჩეული მარშრუტები · 24/7 მხარდაჭერა',
      privacy: 'კონფიდენციალურობა',
      terms: 'პირობები',
    },
  },
};

export interface TypographyScale {
  fontRatio: number;
  bodyFontClass: string;
  headingFontClass: string;
}

export function getTypographyScale(lang: Language): TypographyScale {
  if (lang === 'ka') {
    return {
      fontRatio: 0.85,
      bodyFontClass: "font-['Noto_Sans_Georgian','Figtree',system-ui,sans-serif]",
      headingFontClass: "font-['Noto_Sans_Georgian','Outfit',system-ui,sans-serif]",
    };
  }
  return {
    fontRatio: 1,
    bodyFontClass: "font-['Figtree',system-ui,sans-serif]",
    headingFontClass: "font-['Outfit',system-ui,sans-serif]",
  };
}
