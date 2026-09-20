import React from 'react';
import MeetingLayout from './MeetingLayout';

const November2nd2025Meeting: React.FC = () => {
  return (
    <MeetingLayout
      dateTitle="November 2nd, 2025"
      weekday="Sunday"
      accent="#7C5CBF"
      accentBg="#EFE9FA"
      points={[
        {
          title: 'The Late Meeting Host - Marzooq Mohammed',
          body: 'The meeting host was late as usual — none other than Marzooq Mohammed — and started blabbering as usual as soon as he joined. He gave some instructions about the upcoming trip and also blabbered about stories from his past adventurous trips. During that time, I noticed that the other participants had placed their microphones on mute, which was obvious.',
        },
        {
          title: 'Rare Guest Appearance - Asif Madheena',
          body: 'This time, we had a guest who hardly ever joins this Sunday meeting: his name is Asif Madheena. He tries to skip the meeting most of the time, providing random and ridiculous excuses such as visiting relatives, attending a grama event, going to theevandi rehearsals, visiting Black friends in Deira, etc. (We have learned enough not to fall for these stupid trap excuses anymore.) Another excuse he gives is about his "family man" life, which is utterly bullshit. Let\'s keep that topic aside.',
        },
        {
          title: 'Punctual Participant - Anas Ismail',
          body: 'Anas Ismail was another punctual participant in this meeting. He was obviously managing his staff at the chicken shop and cutting several chicken thighs while wearing his white coat (just like a scientist in a lab) and attending the meeting. I was so proud to see his dedication toward this meeting while other motherfuckers fled without attending. He was also speaking to his staff, customers, and chicken distributors in English, Malayalam, Hindi, Arabic, Tulu, Konkani, and Kannada — all in Kallur accent.',
        },
      ]}
      footer="That's all for the minutes. If anything is missing, feel free to approach the admin, who can update the content accordingly."
    />
  );
};

export default November2nd2025Meeting;
