import React from 'react';
import MeetingLayout from './MeetingLayout';

const October5th2025Meeting: React.FC = () => {
  return (
    <MeetingLayout
      dateTitle="October 5th, 2025"
      weekday="Sunday"
      accent="#2563EB"
      accentBg="#DBEAFE"
      points={[
        {
          title: 'Opening Remarks - Special Meeting with Limited Members',
          body: 'The meeting today was very special since we had only 2 members today henceforth starting this minute by thanking that mother fucker host named Marzook. He created the link for next 10 years and ghosted us (felt really lonely)',
        },
        {
          title: "Eye Father's Update - Return from Kerala",
          body: 'The only member joined was Eye father who just got back from Kerala last night resumed his work right away where in he changed his working dress from abudhabi international airport arrival and proceeded to his farm. He shared his experiences during his holidays in kerala and the kind of jobs / roles handled such as Nabidina speaker, Car mechanic, Airport drops including Dua, Duck feeding and rally etc. He recently did a servicing for a hyson ambulance during their trip to pick up a body from medical college. Eye father had to stop the servicing in between after realizing his flight schedule then got away. The ambulance is still stuck at is garage and picking up the body is still due for them.',
        },
        {
          title: "Illi's Update - Miscall from China",
          body: 'Illi gave a miscall 5 AM in their local time after the party in china. Illi is currently passing beer instead of urine as we heard.',
        },
      ]}
      footer="That's all about today and once again thanking the kunna host for his irresponsibility."
    />
  );
};

export default October5th2025Meeting;
