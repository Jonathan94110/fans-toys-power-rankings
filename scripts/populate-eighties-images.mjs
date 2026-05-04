import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.resolve(__dirname, '../src/data/eightiesbirthday.json')
const publicImageDir = path.resolve(__dirname, '../public/eighties-images')

const wikiTitleById = {
  '80S-TOY-TRANSFORMERS': 'Transformers: Generation 1',
  '80S-TOY-GI-JOE': 'G.I. Joe',
  '80S-TOY-HE-MAN': 'Masters of the Universe',
  '80S-TOY-MASK': 'M.A.S.K.',
  '80S-TOY-THUNDERCATS': 'ThunderCats',
  '80S-TOY-VOLTRON': 'Voltron',
  '80S-TOY-STAR-WARS': 'Star Wars action figures',
  '80S-TOY-HOT-WHEELS': 'Hot Wheels',
  '80S-GAME-MARIO': 'Super Mario Bros.',
  '80S-GAME-ZELDA': 'The Legend of Zelda (video game)',
  '80S-GAME-CONTRA': 'Contra (video game)',
  '80S-GAME-PUNCH-OUT': "Mike Tyson's Punch-Out!!",
  '80S-GAME-MEGA-MAN': 'Mega Man (1987 video game)',
  '80S-GAME-PAC-MAN': 'Pac-Man',
  '80S-GAME-DONKEY-KONG': 'Donkey Kong (arcade game)',
  '80S-GAME-TETRIS': 'Tetris',
  '80S-CANDY-SNICKERS': 'Snickers',
  '80S-CANDY-TWIX': 'Twix',
  '80S-CANDY-KIT-KAT': 'Kit Kat',
  '80S-CANDY-BUTTERFINGER': 'Butterfinger',
  '80S-CANDY-REESES-PIECES': "Reese's Pieces",
  '80S-CANDY-WHATCHAMACALLIT': 'Whatchamacallit (candy)',
  '80S-CANDY-BABY-RUTH': 'Baby Ruth',
  '80S-CANDY-SKOR': 'Skor',
  '80S-SNACK-ECTO-COOLER': 'Ecto Cooler',
  '80S-SNACK-DORITOS': 'Doritos',
  '80S-CEREAL-CAPN-CRUNCH': "Cap'n Crunch",
  '80S-CEREAL-COOKIE-CRISP': 'Cookie Crisp',
  '80S-CEREAL-COCOA-PEBBLES': 'Pebbles cereal',
  '80S-CEREAL-FRUITY-PEBBLES': 'Pebbles cereal',
  '80S-CEREAL-APPLE-JACKS': 'Apple Jacks',
  '80S-CEREAL-GOLDEN-GRAHAMS': 'Golden Grahams',
  '80S-CEREAL-FROSTED-FLAKES': 'Frosted Flakes',
  '80S-CEREAL-CINNAMON-TOAST-CRUNCH': 'Cinnamon Toast Crunch',
  '80S-STORE-TOYS-R-US': 'Toys "R" Us',
  '80S-STORE-KAY-BEE': 'KB Toys',
  '80S-STORE-RADIOSHACK': 'RadioShack',
  '80S-STORE-BLOCKBUSTER': 'Blockbuster LLC',
  '80S-STORE-SEARS': 'Sears',
  '80S-STORE-JCPENNEY': 'JCPenney',
  '80S-STORE-WOOLWORTH': 'F. W. Woolworth Company',
  '80S-STORE-TOWER-RECORDS': 'Tower Records',
  '80S-TECH-VCR': 'Videocassette recorder',
  '80S-TECH-APPLE-COMPUTER': 'Apple Inc.',
  '80S-TECH-WALKMAN': 'Walkman',
  '80S-TECH-BOOMBOX': 'Boombox',
  '80S-TECH-NES': 'Nintendo Entertainment System',
  '80S-TECH-VHS': 'VHS',
  '80S-TECH-ARCADE-CABINETS': 'Arcade cabinet',
  '80S-TECH-POLAROID': 'Instant camera',
  '80S-WRESTLING-HOGAN': 'Hulk Hogan',
  '80S-WRESTLING-MACHO-MAN': 'Randy Savage',
  '80S-WRESTLING-WARRIOR': 'The Ultimate Warrior',
  '80S-WRESTLING-ANDRE': 'André the Giant',
  '80S-WRESTLING-PIPER': 'Roddy Piper',
  '80S-WRESTLING-JAKE': 'Jake Roberts',
  '80S-WRESTLING-STING': 'Sting (wrestler)',
  '80S-WRESTLING-DIBIASE': 'Ted DiBiase',
  '80S-SPORTS-MIKE-TYSON': 'Mike Tyson',
  '80S-SPORTS-BO-JACKSON': 'Bo Jackson',
  '80S-SPORTS-MAGIC': 'Magic Johnson',
  '80S-SPORTS-SHOWTIME-LAKERS': 'Showtime (basketball)',
  '80S-SPORTS-KAREEM': 'Kareem Abdul-Jabbar',
  '80S-SPORTS-LARRY-BIRD': 'Larry Bird',
  '80S-SPORTS-WALTER-PAYTON': 'Walter Payton',
  '80S-SPORTS-MICHAEL-JORDAN': 'Michael Jordan',
  '80S-SPORTS-SUGAR-RAY': 'Sugar Ray Leonard',
  '80S-SPORTS-LAWRENCE-TAYLOR': 'Lawrence Taylor',
  '80S-SPORTS-BARRY-BONDS': 'Barry Bonds',
  '80S-SPORTS-KEN-GRIFFEY-JR': 'Ken Griffey Jr.',
  '80S-SPORTS-DEION-SANDERS': 'Deion Sanders',
  '80S-SPORTS-JERRY-RICE': 'Jerry Rice',
  '80S-SPORTS-JOE-MONTANA': 'Joe Montana',
  '80S-ICON-RAMBO': 'John Rambo',
  '80S-ICON-ROCKY': 'Rocky Balboa',
  '80S-ICON-TERMINATOR': 'Terminator (character)',
  '80S-ICON-JASON': 'Jason Voorhees',
  '80S-ICON-FREDDY': 'Freddy Krueger',
  '80S-ICON-ROBOCOP': 'RoboCop (character)',
  '80S-ICON-PREDATOR': 'Predator (fictional species)',
  '80S-ICON-INDIANA-JONES': 'Indiana Jones (character)',
  '80S-ICON-BIG-TROUBLE': 'Big Trouble in Little China',
  '80S-MOVIE-GHOSTBUSTERS': 'Ghostbusters',
  '80S-MOVIE-BACK-TO-THE-FUTURE': 'Back to the Future',
  '80S-ANIME-AKIRA': 'Akira (1988 film)',
  '80S-ANIME-DRAGON-BALL': 'Dragon Ball (TV series)',
  '80S-LEGEND-MJ': 'Michael Jackson',
  '80S-LEGEND-PRINCE': 'Prince (musician)',
  '80S-LEGEND-EDDIE-MURPHY': 'Eddie Murphy',
  '80S-LEGEND-MR-T': 'Mr. T',
  '80S-LEGEND-PEE-WEE': 'Pee-wee Herman',
  '80S-LEGEND-RUN-DMC': 'Run-DMC',
  '80S-LEGEND-NWA': 'N.W.A',
  '80S-LEGEND-MIKE-TYSON': 'Mike Tyson',
  '80S-LEGEND-HULK-HOGAN': 'Hulk Hogan',
  '80S-LEGEND-MICHAEL-JORDAN': 'Michael Jordan',
  '80S-RNB-NEW-EDITION': 'New Edition',
  '80S-RNB-FORCE-MDS': 'Force MDs',
  '80S-RNB-ZAPP': 'Zapp (band)',
  '80S-RNB-KOOL-GANG': 'Kool & the Gang',
  '80S-TV-KNIGHT-RIDER': 'Knight Rider (1982 TV series)',
  '80S-TV-A-TEAM': 'The A-Team',
  '80S-TV-GREATEST-AMERICAN-HERO': 'The Greatest American Hero',
  '80S-TV-MIAMI-VICE': 'Miami Vice',
  '80S-TV-AIRWOLF': 'Airwolf',
  '80S-TV-MAGNUM-PI': 'Magnum, P.I.',
  '80S-TV-MACGYVER': 'MacGyver (1985 TV series)',
  '80S-TV-ALF': 'ALF (TV series)',
  '80S-FOOD-HAPPY-MEALS': 'Happy Meal',
  '80S-FOOD-WWF-ICE-CREAM': 'Good Humor',
  '80S-FOOD-BIG-MAC': 'Big Mac',
  '80S-FOOD-WHOPPER': 'Whopper',
  '80S-FOOD-PIZZA-HUT': 'Pizza Hut',
  '80S-FOOD-MCDONALDS-FRIES': "McDonald's",
  '80S-FOOD-WENDYS-SINGLE': "Wendy's",
  '80S-FOOD-IN-N-OUT': 'In-N-Out Burger',
  '80S-BMX-HARO': 'Haro Bikes',
  '80S-BMX-GT-PERFORMER': 'GT Bicycles',
  '80S-BMX-MONGOOSE': 'Mongoose (company)',
  '80S-BMX-REDLINE': 'Redline bicycles',
  '80S-SHOES-AIR-JORDANS': 'Air Jordan',
  '80S-SHOES-ADIDAS-SHELL-TOES': 'Adidas Superstar',
  '80S-SHOES-REEBOK-PUMPS': 'Reebok Pump',
  '80S-SHOES-BRITISH-KNIGHTS': 'British Knights',
}

const manualImageById = {
  '80S-TOY-TRANSFORMERS': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/TransformersG1Logo.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:TransformersG1Logo.jpg',
  },
  '80S-TOY-GI-JOE': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/GIJoe%20OriginalLineup.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:GIJoe_OriginalLineup.jpg',
  },
  '80S-TOY-MASK': {
    img: '/eighties-images/80s-toy-mask-thunderhawk.webp',
    imgPage: 'https://mask.fandom.com/wiki/File:Thunderhawk.png',
    imgSource: 'Local image from M.A.S.K. Wiki',
  },
  '80S-TOY-THUNDERCATS': {
    img: '/eighties-images/80s-toy-thundercats-team.webp',
    imgPage: 'https://thundercats.fandom.com/wiki/ThunderCats_(original_series)',
    imgSource: 'Local image from ThunderCats Wiki',
  },
  '80S-TOY-HOT-WHEELS': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/HOT%20WHEELS%20MAINLINE%202013%20-%20CHEVY%20CAMARO.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:HOT_WHEELS_MAINLINE_2013_-_CHEVY_CAMARO.jpg',
  },
  '80S-CANDY-BUTTERFINGER': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/Butterfinger-Snackerz-Candies.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:Butterfinger-Snackerz-Candies.jpg',
  },
  '80S-SNACK-ECTO-COOLER': {
    img: '/eighties-images/80s-snack-ecto-cooler.webp',
    imgPage: 'https://ghostbusters.fandom.com/wiki/Ecto_Cooler',
    imgSource: 'Local image from Ghostbusters Wiki',
  },
  '80S-SNACK-DORITOS': {
    img: '/eighties-images/80s-snack-doritos.png',
    imgPage: 'https://en.wikipedia.org/wiki/Doritos',
    imgSource: 'Local image from Wikipedia',
  },
  '80S-MOVIE-GHOSTBUSTERS': {
    img: '/eighties-images/80s-movie-ghostbusters.png',
    imgPage: 'https://en.wikipedia.org/wiki/Ghostbusters',
    imgSource: 'Local image from Wikipedia',
  },
  '80S-MOVIE-BACK-TO-THE-FUTURE': {
    img: '/eighties-images/80s-movie-back-to-the-future.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/Back_to_the_Future',
    imgSource: 'Local image from Wikipedia',
  },
  '80S-STORE-SEARS': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lloyd%20Center%20Sears%20store%20from%20SE%20in%202017.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Lloyd_Center_Sears_store_from_SE_in_2017.jpg',
  },
  '80S-STORE-WOOLWORTH': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Woolworths%20Camberwell%20-%202004%20-%20Exterior.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Woolworths_Camberwell_-_2004_-_Exterior.jpg',
  },
  '80S-STORE-TOWER-RECORDS': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/Tower%20Records%20Sunset.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:Tower_Records_Sunset.jpg',
  },
  '80S-TECH-VCR': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Panasonic%20VCR%20%28Front%29.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Panasonic_VCR_(Front).jpg',
  },
  '80S-TV-KNIGHT-RIDER': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/A%20black%20Pontiac%20Firebird%20Trans%20Am%20built%20to%20mimic%20KITT%20from%20the%20TV%20series%20Knight%20Rider.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:A_black_Pontiac_Firebird_Trans_Am_built_to_mimic_KITT_from_the_TV_series_Knight_Rider.jpg',
  },
  '80S-TV-MAGNUM-PI': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/Magnum%20P.I.%20Cast.jpg',
    imgPage: 'https://en.wikipedia.org/wiki/File:Magnum_P.I._Cast.jpg',
  },
  '80S-TV-MACGYVER': {
    img: 'https://en.wikipedia.org/wiki/Special:Redirect/file/MacGyver.svg',
    imgPage: 'https://en.wikipedia.org/wiki/File:MacGyver.svg',
  },
  '80S-BMX-HARO': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/1986%20Haro%20Freestyle%20Master.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:1986_Haro_Freestyle_Master.jpg',
  },
  '80S-BMX-GT-PERFORMER': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Freestyle%20BMX%20bike%202019-04-05%20%281%29.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Freestyle_BMX_bike_2019-04-05_(1).jpg',
  },
  '80S-BMX-MONGOOSE': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kasi%20Modified%20BMX%20Bicycle%206.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Kasi_Modified_BMX_Bicycle_6.jpg',
  },
  '80S-BMX-REDLINE': {
    img: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dirt%20jump%20IMG%207609.jpg',
    imgPage: 'https://commons.wikimedia.org/wiki/File:Dirt_jump_IMG_7609.jpg',
  },
}

const figureFocusedBrands = new Set([
  'Boy Toys',
  'Video Games',
  'Candy Bars',
  'Snacks / Drinks',
  'Cereals',
  'Fast Food',
  'Tech and Media',
  'Movies',
  'BMX / Shoes',
])

const peopleAndShows = new Set([
  'WWF / WCW',
  'Sports Icons',
  'Action / Horror',
  '80s Legends',
  'R&B Groups',
  'TV Shows',
  'Anime',
])

function chunk(items, size) {
  const chunks = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function normalizeTitle(title) {
  return title.replace(/_/g, ' ').trim()
}

async function fetchWikiImages(titles) {
  const pageByTitle = new Map()
  const resolvedByRequestedTitle = new Map()

  for (const titleChunk of chunk(titles, 40)) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      prop: 'pageimages|info',
      piprop: 'thumbnail|original',
      pithumbsize: '900',
      pilicense: 'any',
      inprop: 'url',
      redirects: '1',
      titles: titleChunk.join('|'),
    })

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: {
        'User-Agent': 'Codex local birthday ranking image population script',
      },
    })

    if (!response.ok) {
      throw new Error(`Wikipedia API request failed: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()

    for (const normalized of json.query?.normalized || []) {
      resolvedByRequestedTitle.set(normalizeTitle(normalized.from), normalizeTitle(normalized.to))
    }

    for (const redirect of json.query?.redirects || []) {
      resolvedByRequestedTitle.set(normalizeTitle(redirect.from), normalizeTitle(redirect.to))
    }

    for (const page of Object.values(json.query?.pages || {})) {
      if (page.missing) continue
      pageByTitle.set(normalizeTitle(page.title), page)
    }
  }

  return { pageByTitle, resolvedByRequestedTitle }
}

function pickImage(page) {
  return page?.thumbnail?.source || page?.original?.source || ''
}

function getPosition(figure) {
  if (peopleAndShows.has(figure.brand)) return 'center top'
  if (figure.brand === 'Stores') return 'center center'
  if (figureFocusedBrands.has(figure.brand)) return 'center center'
  return undefined
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapText(value, max = 18) {
  const words = String(value).split(/\s+/)
  const lines = []
  let current = ''

  for (const word of words) {
    if (!current) {
      current = word
    } else if (`${current} ${word}`.length <= max) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.slice(0, 3)
}

function buildFallbackSvg(figure) {
  const colors = {
    'Boy Toys': ['#00f5ff', '#ff2bd6'],
    Anime: ['#ff2bd6', '#00f5ff'],
    'R&B Groups': ['#ffcc33', '#ff2bd6'],
    'TV Shows': ['#8b5cf6', '#00f5ff'],
  }
  const [primary, secondary] = colors[figure.brand] || ['#00f5ff', '#ffcc33']
  const nameLines = wrapText(figure.name)
  const categoryLines = wrapText(figure.brand, 24)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#09071b"/>
      <stop offset="0.48" stop-color="#201034"/>
      <stop offset="1" stop-color="#050912"/>
    </linearGradient>
    <radialGradient id="flare" cx="50%" cy="35%" r="55%">
      <stop offset="0" stop-color="${primary}" stop-opacity="0.34"/>
      <stop offset="0.55" stop-color="${secondary}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="900" height="640" fill="url(#bg)"/>
  <rect width="900" height="640" fill="url(#flare)"/>
  <g opacity="0.45">
    <path d="M0 520H900M0 452H900M0 384H900M0 316H900" stroke="${primary}" stroke-width="2"/>
    <path d="M90 640L450 190L810 640M0 640L450 190L900 640" fill="none" stroke="${secondary}" stroke-width="3"/>
  </g>
  <circle cx="450" cy="235" r="132" fill="#120b22" stroke="${primary}" stroke-width="8" filter="url(#glow)"/>
  <path d="M326 260c58-100 190-99 248 0-29-30-57-45-86-45 11 19 20 47 27 85-42-27-88-27-130 0 7-38 16-66 27-85-29 0-57 15-86 45Z" fill="${secondary}" opacity="0.92"/>
  <text x="450" y="80" text-anchor="middle" fill="#fff4b8" font-family="Arial Black, Impact, sans-serif" font-size="44" letter-spacing="3">80S POWER PICK</text>
  <text x="450" y="438" text-anchor="middle" fill="#ffffff" font-family="Arial Black, Impact, sans-serif" font-size="58">
    ${nameLines.map((line, index) => `<tspan x="450" dy="${index === 0 ? 0 : 62}">${escapeXml(line.toUpperCase())}</tspan>`).join('')}
  </text>
  <text x="450" y="590" text-anchor="middle" fill="${primary}" font-family="Arial, sans-serif" font-size="30" font-weight="800">
    ${categoryLines.map((line, index) => `<tspan x="450" dy="${index === 0 ? 0 : 34}">${escapeXml(line.toUpperCase())}</tspan>`).join('')}
  </text>
</svg>`
}

const data = JSON.parse(await fs.readFile(dataPath, 'utf8'))
const titles = [...new Set(Object.values(wikiTitleById))]
const { pageByTitle, resolvedByRequestedTitle } = await fetchWikiImages(titles)
const missing = []
const generatedAssets = []

const updated = data.map((figure) => {
  const requestedTitle = wikiTitleById[figure.id]
  if (!requestedTitle) {
    missing.push(`${figure.name}: no mapped title`)
    return figure
  }

  const normalizedRequested = normalizeTitle(requestedTitle)
  const resolvedTitle = resolvedByRequestedTitle.get(normalizedRequested) || normalizedRequested
  const page = pageByTitle.get(resolvedTitle)
  const manualImage = manualImageById[figure.id]

  if (manualImage) {
    return {
      ...figure,
      ...manualImage,
      imgPosition: getPosition(figure) || 'center center',
      imgSource: manualImage.imgSource || 'Wikipedia file',
    }
  }

  const img = pickImage(page)

  if (!img) {
    const assetName = `${figure.id.toLowerCase()}.svg`
    generatedAssets.push({
      fileName: assetName,
      svg: buildFallbackSvg(figure),
    })
    missing.push(`${figure.name}: using local 80s-style stage art`)
    return {
      ...figure,
      img: `/eighties-images/${assetName}`,
      imgPosition: 'center center',
      imgPage: page?.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(requestedTitle.replace(/ /g, '_'))}`,
      imgSource: 'Local stage art',
    }
  }

  const imgPosition = getPosition(figure)
  return {
    ...figure,
    img,
    ...(imgPosition ? { imgPosition } : {}),
    imgPage: page.fullurl,
    imgSource: 'Wikipedia',
  }
})

await fs.mkdir(publicImageDir, { recursive: true })
for (const asset of generatedAssets) {
  await fs.writeFile(path.join(publicImageDir, asset.fileName), `${asset.svg}\n`)
}

await fs.writeFile(dataPath, `${JSON.stringify(updated, null, 2)}\n`)

const withImages = updated.filter((figure) => figure.img).length
console.log(`Updated ${withImages}/${updated.length} birthday entries with image URLs.`)
if (missing.length) {
  console.log('\nMissing or fallback-only entries:')
  for (const item of missing) console.log(`- ${item}`)
}
