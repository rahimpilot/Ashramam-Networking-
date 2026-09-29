export interface StyleCredit {
  role: string;
  name: string;
}

export interface StyleTopic {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  /** Image shown on the detail page (portrait works best). */
  image: string;
  /** Preview image for WhatsApp shares (under ~300KB). */
  ogImage: string;
  credits: StyleCredit[];
}

/**
 * Style By Mafi topics. To post the next one: add the picture under
 * public/style-by-mafi/, then add one entry here — it appears on the
 * listing page with its own detail page and share preview automatically.
 */
export const STYLE_TOPICS: StyleTopic[] = [
  {
    slug: 'bazaar-diamond-issue',
    title: "Harper's Bazaar Kazakhstan — Diamond Issue",
    kicker: 'Cover story · May 2023',
    description:
      "Styling assistant on the cover story of Harper's Bazaar Kazakhstan's " +
      "Diamond Issue — a high-fashion editorial shoot.",
    image: '/style-by-mafi/bazaar-diamond-cover.jpg',
    ogImage: '/og-style-by-mafi.jpg',
    credits: [
      { role: 'Editor-in-Chief', name: 'Larissa Azanova' },
      { role: 'Photography', name: 'Mann' },
      { role: 'Concept & Art Direction', name: 'Galbi' },
      { role: 'Styling', name: 'Daniela Correia' },
      { role: 'Styling Assistant', name: 'Mehroof (Mafi)' },
      { role: 'Hair', name: 'Umang' },
      { role: 'Makeup', name: 'Arianna Scapola' },
      { role: 'Digitech', name: 'Alister' },
      { role: 'Model', name: 'Reimi' },
      { role: 'Casting Curation', name: 'Ellie Vojvodinska' },
      { role: 'Light Assistant', name: 'James' },
      { role: 'Retouch', name: 'Gorgeous Agency' },
      { role: 'Studio', name: 'Bicki Boss' },
      { role: 'Production', name: 'Things By People' },
    ],
  },
  {
    slug: 'bazaar-diamond-issue-digital',
    title: "Harper's Bazaar Kazakhstan — Diamond Issue (Digital Cover)",
    kicker: 'Digital cover · May 2023',
    description:
      "Styling assistant on the digital cover of Harper's Bazaar Kazakhstan's " +
      "Diamond Issue — a high-fashion editorial shoot.",
    image: '/style-by-mafi/bazaar-diamond-digital-cover.jpg',
    ogImage: '/og-style-by-mafi-digital.jpg',
    credits: [],
  },
];

export const getStyleTopic = (slug: string): StyleTopic | undefined =>
  STYLE_TOPICS.find((t) => t.slug === slug);
