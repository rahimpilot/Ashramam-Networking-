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
];
