/** Curated seed stations for Ashramam Radio.
 *
 * Sourced from the community-run Radio Browser directory (open/free sources).
 * Every stream URL below is https (no mixed-content blocks), non-HLS
 * (plays in a plain <audio> element on all browsers), and was verified with
 * a direct HTTP check (200 + audio/* content-type) before going in —
 * Radio Browser's own lastcheckok flag alone is NOT enough (it passed a
 * wrongly-listed URL for Dubai Eye once).
 *
 * Pipeline: Ray picks the stations/countries, Muse adds and verifies each
 * stream before it goes in. Add new entries here — newest first is not
 * required; keep them grouped by region.
 */

export type RadioRegion = 'UAE' | 'America' | 'India' | 'Canada' | 'Europe' | 'UK';

export interface RadioStation {
  slug: string;
  name: string;
  region: RadioRegion;
  /** Human-readable place, e.g. "Dubai, UAE" or "Toronto, Canada". */
  place: string;
  tags: string;
  streamUrl: string;
}

export const RADIO_REGIONS: RadioRegion[] = ['UAE', 'America', 'India', 'Canada', 'Europe', 'UK'];

export const RADIO_STATIONS: RadioStation[] = [
  // ---- United Arab Emirates ----
  {
    slug: 'radio-mirchi-dubai',
    name: 'Radio Mirchi Dubai',
    region: 'UAE',
    place: 'Dubai, UAE',
    tags: 'bollywood, hindi, desi hits',
    streamUrl: 'https://eu8.fastcast4u.com/proxy/clyedupq/?mp=/1',
  },
  {
    slug: 'exclusively-pink-floyd',
    name: 'Exclusively Pink Floyd',
    region: 'UAE',
    place: 'UAE',
    tags: 'classic rock, pink floyd',
    streamUrl: 'https://streaming.exclusive.radio/er/pinkfloyd/icecast.audio',
  },
  {
    slug: 'exclusive-radio-bob-marley',
    name: 'Exclusive Radio – Bob Marley',
    region: 'UAE',
    place: 'UAE',
    tags: 'reggae, bob marley',
    streamUrl: 'https://streaming.exclusive.radio/er/bobmarley/icecast.audio',
  },
  // ---- America ----
  {
    slug: 'classic-vinyl-hd',
    name: 'Classic Vinyl HD',
    region: 'America',
    place: 'New York, USA',
    tags: 'oldies, jazz, swing, easy listening',
    streamUrl: 'https://icecast.walmradio.com:8443/classic',
  },
  {
    slug: 'adroit-jazz-underground',
    name: 'Adroit Jazz Underground',
    region: 'America',
    place: 'New York, USA',
    tags: 'jazz, bebop, fusion',
    streamUrl: 'https://icecast.walmradio.com:8443/jazz',
  },
  {
    slug: 'somafm-groove-salad',
    name: 'SomaFM Groove Salad',
    region: 'America',
    place: 'San Francisco, USA',
    tags: 'ambient, chillout',
    streamUrl: 'https://ice6.somafm.com/groovesalad-128-mp3',
  },
  {
    slug: 'wamu',
    name: 'WAMU American University Radio',
    region: 'America',
    place: 'Washington DC, USA',
    tags: 'news, talk',
    streamUrl: 'https://wamu.cdnstream1.com/wamu.mp3',
  },
  // ---- India ----
  {
    slug: 'bollywood-gaane-purane',
    name: 'Bollywood Gaane Purane',
    region: 'India',
    place: 'India',
    tags: 'bollywood, hindi, classics',
    streamUrl: 'https://stream.zeno.fm/6n6ewddtad0uv',
  },
  {
    slug: 'goldy-evergreen',
    name: 'Goldy Evergreen',
    region: 'India',
    place: 'India',
    tags: 'evergreen, hindi',
    streamUrl: 'https://stream.zeno.fm/n2fd0edh9k8uv',
  },
  {
    slug: 'mirchi-top-20',
    name: 'Mirchi Top 20',
    region: 'India',
    place: 'India',
    tags: 'bollywood, top hits',
    streamUrl: 'https://drive.uber.radio/uber/bollywoodnow/icecast.audio',
  },
  {
    slug: 'mirchi-love',
    name: 'Mirchi Love',
    region: 'India',
    place: 'India',
    tags: 'bollywood, love songs',
    streamUrl: 'https://drive.uber.radio/uber/bollywoodlove/icecast.audio',
  },
  {
    slug: 'rafi-hit-songs',
    name: 'Rafi Hit Songs',
    region: 'India',
    place: 'India',
    tags: 'rafi, hindi classics',
    streamUrl: 'https://stream-143.zeno.fm/0zkr7x8ztm0uv?zs=WTPQx8TiQXSo11XU0iyTAQ',
  },
  {
    slug: 'free-fm-top-100-india',
    name: 'Free FM Top 100 India',
    region: 'India',
    place: 'India',
    tags: 'hindi, top 100',
    streamUrl: 'https://stream.zeno.fm/a5h7vfret68uv',
  },
  {
    slug: 'new-hits-bollywood',
    name: 'New Hits Of Bollywood',
    region: 'India',
    place: 'India',
    tags: 'bollywood, new hits',
    streamUrl: 'https://stream-146.zeno.fm/rqqps6cbe3quv?zs=loHp_DNyRPiAxC52AL95hg',
  },
  {
    slug: 'radio-madhoshi',
    name: 'Radio Madhoshi',
    region: 'India',
    place: 'India',
    tags: 'hindi',
    streamUrl: 'https://stream.zeno.fm/7rsl8fsccf8uv',
  },
  {
    slug: 'radio-maharani',
    name: 'Radio Maharani',
    region: 'India',
    place: 'India',
    tags: 'hindi',
    streamUrl: 'https://streamasiacdn.atc-labs.com/radiomaharani.aac',
  },
  // ---- Canada ----
  {
    slug: 'reggae-chill-cafe',
    name: 'Reggae Chill Cafe',
    region: 'Canada',
    place: 'Ontario, Canada',
    tags: 'reggae, chillout, tropical',
    streamUrl: 'https://maggie.torontocast.com:2020/stream/reggaechillcafe',
  },
  {
    slug: 'rdmix-classic-rock',
    name: 'RdMix Classic Rock 70s 80s 90s',
    region: 'Canada',
    place: 'Ontario, Canada',
    tags: 'classic rock, 70s, 80s, 90s',
    streamUrl: 'https://cast1.torontocast.com:4610/stream',
  },
  // ---- Europe ----
  {
    slug: 'npo-radio-2',
    name: 'NPO Radio 2',
    region: 'Europe',
    place: 'Netherlands',
    tags: 'pop, evergreens, talk',
    streamUrl: 'https://icecast.omroep.nl/radio2-bb-aac',
  },
  {
    slug: 'deutschlandfunk',
    name: 'Deutschlandfunk',
    region: 'Europe',
    place: 'Berlin, Germany',
    tags: 'news, culture, public service',
    streamUrl: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3?aggregator=web',
  },
  {
    slug: 'wdr4',
    name: 'WDR4',
    region: 'Europe',
    place: 'Germany',
    tags: 'pop, evergreens',
    streamUrl: 'https://wdr-wdr4-live.icecastssl.wdr.de/wdr/wdr4/live/mp3/128/stream.mp3',
  },
  // ---- United Kingdom ----
  {
    slug: 'heart-80s',
    name: 'Heart 80s',
    region: 'UK',
    place: 'London, UK',
    tags: '80s, pop',
    streamUrl: 'https://media-ssl.musicradio.com/Heart80sMP3',
  },
  {
    slug: 'heart-uk',
    name: 'Heart UK',
    region: 'UK',
    place: 'London, UK',
    tags: 'adult contemporary, pop',
    streamUrl: 'https://media-ssl.musicradio.com/HeartUK',
  },
  {
    slug: 'capital-uk',
    name: 'Capital FM',
    region: 'UK',
    place: 'London, UK',
    tags: 'pop, top 40',
    streamUrl: 'https://media-ssl.musicradio.com/CapitalUK',
  },
  {
    slug: 'kisstory',
    name: 'Kisstory',
    region: 'UK',
    place: 'London, UK',
    tags: 'old skool, anthems',
    streamUrl: 'https://live-bauerkiss.sharp-stream.com/kisstory.aac?direct=true&aw_0_1st.playerid=BMUK_Airable&aw_0_1st.skey=6778249992',
  },
  {
    slug: 'virgin-radio-uk',
    name: 'Virgin Radio UK',
    region: 'UK',
    place: 'London, UK',
    tags: 'rock, pop, talk',
    streamUrl: 'https://radio.virginradio.co.uk/stream',
  },
];
