// Single source of truth for member display pictures.
// Admin-controlled: add an email -> photo mapping here and it applies
// everywhere a member's picture is shown (Scrap Book, Residents, Account).

const profilePictureMap: { [key: string]: string } = {
  // Add user email mappings here - controlled by admin
  'raimu456@gmail.com': '/raimu.jpg',
  'hyder.mohamed@gmail.com': '/hyder.JPG',
  'mzmhmd@gmail.com': '/bruno.png',
  'nias.ahamad@gmail.com': '/nias.jpg',
  'mshanir@gmail.com': '/shanir.jpeg',
  'niaznasu@gmail.com': '/niaz.jpeg',
  'riaz986@gmail.com': '/riaz',
  'anaskallur@gmail.com': '/anas.jpg',
  'mailmohasinali@gmail.com': '/appan.JPG',
  'asifmadheena@gmail.com': '/asif.png',
  // Add more mappings as needed
};

/** Returns the member's display-picture URL, or null for the default avatar. */
export const getProfilePhoto = (email: string): string | null => {
  if (!email) return null;
  return profilePictureMap[email.toLowerCase()] || null;
};
