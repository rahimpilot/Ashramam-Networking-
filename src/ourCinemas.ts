// Our Cinemas catalog — short films by our own people, public.
export interface Cinema {
  id: string;
  title: string;
  by: string;
  youtubeId: string;
  description: string;
}

export const CINEMAS: Cinema[] = [
  {
    id: 'ore-swasam',
    title: 'Ore Swasam',
    by: 'Riyaz Ummer',
    youtubeId: 'mtnuJy4z_1E',
    description: 'A short film by Riyaz Ummer. Watch it right here.',
  },
];

export function getCinema(id: string | undefined): Cinema | undefined {
  return CINEMAS.find((c) => c.id === id);
}

export function cinemaThumbnail(c: Cinema): string {
  return `https://i.ytimg.com/vi/${c.youtubeId}/maxresdefault.jpg`;
}

export function cinemaThumbnailFallback(c: Cinema): string {
  return `https://i.ytimg.com/vi/${c.youtubeId}/hqdefault.jpg`;
}

export function cinemaEmbedUrl(c: Cinema): string {
  return `https://www.youtube-nocookie.com/embed/${c.youtubeId}?rel=0`;
}
