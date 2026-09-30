// Our Cinemas catalog — short films by our own people, public.
export interface Cinema {
  id: string;
  title: string;
  by: string;
  youtubeId: string;
  description: string;
  /** Poster/title-card image shown in the category (local public/ path). */
  poster: string;
  /** Cast names, as credited on the film's YouTube page. */
  cast: string[];
  /** Full crew credits, as listed on the film's YouTube page. */
  crew: { role: string; name: string }[];
  /** Copyright line, as on the film's YouTube page. */
  copyright: string;
  /** The story of how the director made this film — shown in its own honoured section. */
  directorStory: string;
  /** Google Drive file id of the source upload — kept for reference; playback uses the YouTube embed. */
  driveFileId?: string;
}

export const CINEMAS: Cinema[] = [
  {
    id: 'ore-swasam',
    title: 'Ore Swasam',
    by: 'Riyaz Ummer',
    youtubeId: 'mtnuJy4z_1E',
    description: 'A short film by Riyaz Ummer. Watch it right here.',
    poster: '/cinemas/ore-swasam-poster-v3.jpg',
    cast: ['Nimisha Ashok', 'Amritha Sathyanath K', 'Misty'],
    crew: [
      { role: 'Direction & Screenplay', name: 'Riyaz Ummer' },
      { role: 'Producer', name: 'Ashif CM' },
      { role: 'Cinematography', name: 'Hrithwik Sasikumar' },
      { role: 'Editor', name: 'Shibu Perissery' },
      { role: 'Music', name: 'Akhil Ramachandran & Kevin Soney' },
      { role: 'Sound Design', name: 'Alen & Shameer' },
      { role: 'Sound Mixing', name: 'Jithin Joseph' },
      { role: 'Production Controller', name: 'Heeba Hameed' },
      { role: 'Costume', name: 'Hridya Sasikumar' },
      { role: 'Assistant Directors', name: 'Naurin Sahir, Aakash Pradeep' },
      { role: 'Production Design', name: 'Ashif Edayadan' },
      { role: 'Associate Cinematography', name: 'CR Narayanan' },
      { role: 'Production Assistants', name: 'Shefar K Salam, Hidha Hameed' },
      { role: 'Art Assistants', name: 'Deepulal P T, Vidhya K S' },
      { role: 'Foley', name: 'Toby Jose' },
      { role: 'Title Design', name: 'Gireesh MP' },
    ],
    copyright: '© 2021 Kerala State Chalachitra Academy',
    directorStory:
      'Riyaz Ummer is a scriptwriter and director. He wrote the script of Ore Swasam and submitted it to the Kerala State Chalachitra Academy, where it was selected from among 700 scripts.\n\n' +
      'That selection is how this film was born — the Academy backed it with a grant of about ₹50,000, and on that modest budget Riyaz made this movie. A film like this, crafted from so little, deserves to be honoured.',
    driveFileId: '1DJTmxoZn0JeRFr_ReXitHuXuV7ktE1oF',
  },
];

export function getCinema(id: string | undefined): Cinema | undefined {
  return CINEMAS.find((c) => c.id === id);
}

export function cinemaPoster(c: Cinema): string {
  return c.poster;
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

export function cinemaWatchUrl(c: Cinema): string {
  return `https://www.youtube.com/watch?v=${c.youtubeId}`;
}
