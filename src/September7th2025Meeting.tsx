import React from 'react';
import MeetingLayout from './MeetingLayout';

const September7th2025Meeting: React.FC = () => {
  return (
    <MeetingLayout
      dateTitle="September 7th, 2025"
      weekday="Sunday"
      accent="#059669"
      accentBg="#D1FAE5"
      participants={['Bruno', 'Niyaz kamaru', '2k rapper vedan friends riyaz ummer', 'Myself']}
      points={[
        {
          title: "Marzook's Alps Adventure",
          body: "Marzook Mohammed is going for a adventure trip at alps Mouton mountain where he is performing 5 days trek alone during the freezing winter. This trip would allow him to find inner peace of himself as he claims. 95 percent trippers died in that mountain but our friend Marzook will succeed",
        },
        {
          title: 'Niyaz Kamaru - Audio Issues',
          body: 'Niyaz kamaru joined with a random copy Bluetooth apple airpod and his device was giving noise like a pressure cooker. He was unable to speak',
        },
        {
          title: "Riyaz Ummer's Relocation",
          body: "Riyaz ummer moved to kengeri which is 100 kms from Bangalore and close to udumalpet there he don have 3G network. His speeches where being delivered after the meeting. Technically he couldn't speak",
        },
        {
          title: 'Marzook Chandy & Priven - Scotland Road Trip',
          body: "Marzook chaandy and priven going on a road trip to Scotland next month. Basically a van trip and that's the highlight of this meeting",
        },
        {
          title: "Bruno's Big Move to America",
          body: 'The final point but least our friend Bruno is moving to America to work and live with his gal friend (no consent provided by his trippy dad. He is very a angry on him and meanwhile Spidey is trying to sneak to his family so that his dad will give away few land to him',
        },
      ]}
      footer="That's all"
    />
  );
};

export default September7th2025Meeting;
