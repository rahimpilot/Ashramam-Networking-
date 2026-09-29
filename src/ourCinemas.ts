// Our Cinemas catalog — short films by our own people, public.
export interface Cinema {
  id: string;
  title: string;
  by: string;
  youtubeId: string;
  description: string;
  /** Google Drive file id — when set, the film plays via the Drive preview player instead of the YouTube embed. */
  driveFileId?: string;
}

export const CINEMAS: Cinema[] = [
  {
    id: 'ore-swasam',
    title: 'Ore Swasam',
    by: 'Riyaz Ummer',
    youtubeId: 'mtnuJy4z_1E',
    description: 'A short film by Riyaz Ummer. Watch it right here.',
    driveFileId: '1DJTmxoZn0JeRFr_ReXitHuXuV7ktE1oF',
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
  return `https://www.youtube.com/embed/${c.youtubeId}?rel=0`;
}

export function cinemaDrivePreviewUrl(c: Cinema): string | null {
  return c.driveFileId ? `https://drive.google.com/file/d/${c.driveFileId}/preview` : null;
}

/** Direct mp4 stream for the Drive file — plays in a native <video> tag with no Google login. */
export function cinemaDirectVideoUrl(c: Cinema): string | null {
  return c.driveFileId
    ? `https://drive.usercontent.google.com/download?id=${c.driveFileId}&export=download&confirm=t`
    : null;
}

export function cinemaWatchUrl(c: Cinema): string {
  return `https://www.youtube.com/watch?v=${c.youtubeId}`;
}
