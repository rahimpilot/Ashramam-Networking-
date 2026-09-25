import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import PageHeader from './PageHeader';
import StoryEngagement from './StoryEngagement';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Articles — timeless pieces from Abdu's old WordPress site,
 * proofread and republished. PUBLIC — no login required.
 * Topic list at /articles, full article at /articles/:articleId.
 */

interface BelovedArticle {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  excerpt: string;
  body?: string;
  image?: string;
  date: string;
}

// Abdu will feed articles one by one — they land here.
const ARTICLES: BelovedArticle[] = [
  {
    id: 'retro-life',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Retro Life',
    excerpt: 'On music, patience, and chasing the dream of mastering an instrument.',
    image: '/retro-life.jpg',
    body: `Music is an inspiration — it reveals the instrument you were meant to play. Every instrument finds its mentor in the player who chooses it with purpose and respect for what they aim to achieve.

I have always been passionate, though quietly so. I carried ambitions I wanted to pursue, even as doubt and confusion haunted me like an unwelcome spoiler. But I decided not to hold back, and not to give up for just any reason.

Learning an instrument demands patience — the kind that never stops you from dreaming. So chase your dreams, and discover what you are truly good at.`,
    date: '',
  },
  {
    id: 'educating-the-poor',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Educating the Poor',
    excerpt: 'Why millions of children still miss school — and the people fighting to change that.',
    image: '/educating-poor.jpg',
    body: `Education is the process of learning — acquiring knowledge, skills, values, and habits through teaching, training, discussion, and research. It is the key that unlocks human potential, giving shape to ideas and depth to thought. As the ancients said, knowledge is power, and education plays a vital role in any society. Yet today, our society faces a real shortage of education in many places: our country faces a major challenge in bringing schooling to every corner. Governments have launched schemes for the needy — free education systems, government institutes, and more.

But the real challenge runs deeper. Across the world — and in large numbers in India — countless children grow up outside well-managed families, living and working on the streets simply to survive. Addressing this is not easy. NGOs have shown remarkable commitment to the welfare of poor communities, understanding the problem from every angle. They run successful campaigns to educate the poor, backed by sponsors and support programmes.

Even where school fees are free, hidden costs remain: uniforms, food, books — and transport, since schools are often far from rural homes. Parents who cannot bear these costs are forced to pull their children out of school midway.

Children also face steep barriers on their educational path: lack of funding, untrained teachers, missing classrooms, scarce learning materials, hunger, and poor nutrition. Only dedicated, sustained campaigns can clear these barriers. More than grand infrastructure, what works is well-organised social service — and it can transform the lives of poor communities.

Consider a recent story. Sreedhanya Suresh, a 25-year-old woman from a poor background, beat all odds to become a topper. From the Kurichiya tribe of Wayanad, Kerala, she became the first tribal woman from Kerala to clear the UPSC civil services examination — securing the 410th rank on her third attempt. This is not just news; it is history. Her will and courage prove a simple truth: talent lives in every crowd — all it needs is a little support to stretch its wings and fly. She is one example; there are a thousand more like her waiting to show their calibre.

Research points to practical ways of reaching unprivileged children: weekend mobile schools run from a rented van or minibus, turning a living room into a classroom, free libraries built from donated books, small skill-training sessions for children, weekend outdoor sports events — simple ideas, refined through years of experience by dedicated mentors. Social service interns across the country are already running such campaigns, gathering the materials they need to keep teaching alive.

To put it simply: India has more than a billion people, and barely a third can read. With a rapidly growing population, we face a shortage of trained teachers, basic facilities, and funds. Studies show more than 30% of education funding goes to higher education, while primary education — the foundation — is neglected. We rank fourth among the top ten nations with the highest number of primary-level children, and India's growth depends on a well-educated, skilled workforce.

Another crisis weighs on the nation: health and nutrition. Five hundred million Indians live below the poverty line. Underprivileged children face serious short- and long-term risks from macronutrient and micronutrient deficiencies — often beginning before birth, when undernourished mothers face complications in pregnancy. Girls, burdened by their lower social status, are even more vulnerable. These are the realities that stop ordinary families from raising their children toward education.

International organisations have stepped in to rescue children trapped by poverty and lack of schooling, working to give every deserving child what they need to build on their skills. These organisations stand beside the poor every single day — and through such campaigns, countless children have been educated, built careers, supported their families, and served their nation.

Our agenda must be clear: support the education of the poor, and help fulfil their dreams.`,
    date: '',
  },
  {
    id: 'the-task',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'The Task',
    excerpt: 'On sharing the planet: the stray animals we walk past every day.',
    image: '/the-task.jpg',
    body: `Ever since the Earth was formed, humans are the only species that pays to live on it — and so our way of living is entirely different from every other species. Though the planet is shared by all, humans dominate: naming ourselves the superior species, controlling, ruling, and consuming. The proper use of science is not to conquer nature but to live with it; instead, we exploit it for infrastructure and lifestyle.

There are many reasons humans became the dominant form of life — not least our ability to cooperate. Yet that same dominance has led us to neglect a simple fact: we are not alone on this planet. Our selfishness can wipe other species aside without a thought for humanity. We underestimate the other creatures of this Earth, fail to treat them right, and rarely grasp the scale of the damage we cause — consequences that can be deadly.

Stray animals are part of our everyday life. They survive on garbage, restaurant leftovers, and scraps — yet no proper system exists to feed them. Project Animalia took up this task: an initiative for the welfare of stray animals, feeding them, sheltering them through extreme conditions, and caring for everything they deserve.`,
    date: '',
  },
  {
    id: 'volunteering-change-your-life',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Why Volunteering Will Change Your Life',
    excerpt: 'New skills, new friends, better health — the science and soul of giving your time.',
    image: '/volunteering.jpg',
    body: `Volunteering is a globally encouraged way of giving back — a platform for building community and nurturing a helping mindset in the individual. The term describes a person who freely offers to take part in an enterprise, or to undertake a task, wherever help is needed. It is social work; some approach it as an internship, others simply as service at events. Volunteering improves our attitude toward serving others and deepens our understanding of one another — and it plays a vital role in our development: communication, self-expression, behaviour, and much more. Here are some of its greatest benefits.

## Learn new skills
Volunteering programmes span many areas of expertise, bringing together people of different backgrounds and interests under one roof. It is an excellent chance to share skills with one another — and a rare opportunity to develop new knowledge, ideas, and talents.

## Connect with others
One of the best-known benefits of volunteering is its impact on the community. It connects you to your neighbourhood and makes it a better place. Even the smallest tasks can make a real difference to people, animals, and organisations in need. And volunteering is a two-way street: it benefits you and your family as much as the cause you choose. Giving your time helps you make new friends, expand your network, and sharpen your social skills.

## Build social and relationship skills
Some people are naturally outgoing; others are shy and find it hard to meet new people. Volunteering lets you practise and develop your social skills as you meet regularly with a group who share your interests. Once you find your momentum, it becomes easier to branch out and make new friends and contacts.

## Make new friends and contacts
One of the best ways to make new friends — and strengthen existing relationships — is to commit to a shared activity. Volunteering is a wonderful way to meet people, especially when you are new to an area. It deepens your ties to the community and broadens your support network, introducing you to people with common interests, local resources, and fun, fulfilling activities. If you are feeling lonely or isolated, or simply want to widen your social circle, volunteering in your local community is an important — and often joyful — way to meet new people. And if you have recently moved to a new city or country, it is one of the easiest ways to feel at home, strengthening your bond with the community while connecting you with people who may become lifelong friends.

## Build self-confidence and self-esteem
Doing good for others creates a natural sense of accomplishment. Volunteering also gives you pride and identity, lifting your self-confidence by taking you out of your comfort zone. It helps you feel better about yourself — a feeling you carry back into your everyday routine, shaping a more positive view of your life and your goals.

## Strengthen your physical health
Interestingly, volunteering benefits the body as well as the mind. A growing body of evidence suggests that those who give their time to others enjoy lower blood pressure and even longer lives. A 1999 study found that committed volunteers — those helping at two or more organisations — had a 63% lower mortality rate than non-volunteers. More recent research from Carnegie Mellon University (2013) found that adults over 50 who volunteered regularly were less likely to develop high blood pressure than those who didn't. Hypertension matters: it contributes to stroke, heart disease, and premature death.

I have been part of several volunteering teams during my career, and I can say these benefits are real. Volunteering has cheered me up more than once, and in a short time I developed skills I never expected. Today, volunteering organisations work hand in hand with social workers and NGOs to run their programmes reliably. Most of us want to do good in the world — and volunteering is good not only for the community but for your own health too. And of course, the greatest benefit of volunteering is the reason we do it at all: it makes a difference. Wherever you volunteer, you are changing lives — your own, your fellow volunteers', and those who benefit from your efforts.`,
    date: '',
  },
  {
    id: 'sustainable-energy-future',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Sustainable Energy and Its Future',
    excerpt: 'Solar, wind, and the race to power tomorrow without costing the Earth.',
    image: '/sustainable-energy.jpg',
    body: `Sustainable energy meets today's demand without depleting the resources of tomorrow — energy that can be used over and over again. In many ways it is eco-friendly, causing far less harm to our surroundings, because it is drawn directly from nature with the help of modern equipment. The UNECE's work on sustainable energy aims to bring affordable, clean energy to all, while cutting greenhouse gas emissions and the carbon footprint of the energy sector. And with the Sun at the heart of our solar system, we have a greater source of energy than any artificial plan could offer. Hundreds of inventions now run on solar power — astronauts, for example, rely on solar energy to operate spacecraft long after launch. Through this living ecosystem, we have discovered many forms of sustainable energy.

Kerala, India, set a remarkable example: Cochin International Airport — the country's first airport built under the PPP model — runs on a 12 MW solar plant of 46,150 panels spread across 45 acres. Today the entire airport operates on power drawn from these panels — a landmark achievement and a lasting gift to the environment. It proves the mechanism works: we need not depend on artificial resources that harm the planet. The same applies to wind turbines. Renewable power is booming — innovation is driving down costs and delivering on the promise of a clean energy future. American solar and wind generation is breaking records, feeding the national grid without compromising reliability. Renewable — often called clean — energy comes from natural sources that constantly replenish themselves: sunlight and wind keep coming, even if their availability shifts with time and weather.

Today we have ever more innovative and affordable ways to capture wind and solar power, and renewables are becoming a major power source — already more than one-eighth of U.S. electricity generation. Growth is happening at every scale, from rooftop panels that sell power back to the grid to giant offshore wind farms; some rural communities now rely on renewables for all their heating and lighting. On the other side stand non-renewables — the so-called dirty energy of fossil fuels: gas, oil, and coal. These exist in limited quantities and take ages to replenish. They are also unevenly distributed, leaving some nations rich and others dependent. Sunshine and wind, by contrast, belong to every country. Renewable energy is now a thriving global market, with wind turbines, solar plants, hydroelectric power, biomass, geothermal energy, and small wind systems leading the way.

Sustainable energy, in essence, meets the needs of the present without compromising the ability of future generations to meet theirs. Managing it well means treating a complex process as a sequence of operations performed at the right time and in the right way — analysing, planning, directing, implementing, and controlling — all aimed at sustainability alongside healthy economic outcomes. Sustainable sources are those not expected to run out on any timescale that matters to humanity, and so they sustain all species. This closely matches the standard definition of renewable energy — though the two terms differ in emphasis. Notably, even Wikipedia's definition of sustainable sources has at times included nuclear power — controversial, for social and political reasons. At our present stage of technology, nuclear is not sustainable: it depends on uranium, a scarce resource on the relevant timescale.

Using sustainable energy without harming nature is always the better path — it can transform our daily production, even if the initial investment is a little high.

Sustainable energy management is central to managing natural resources and sustainable development itself. Sustainable development is an integrated system — economic, environmental, social, and institutional — where a change in one part ripples through the rest. Nothing should be viewed in isolation. The modern concept questions economic development at any cost, introducing new measures of progress: environmental quality and quality of life now stand beside economic growth as equals. Economic development, historically built on exploiting natural resources and polluting the environment, becomes a subject of deeper study. Modern business reveals a tight link between energy consumption and development. The world consumes vast amounts of energy, unevenly across regions — and while energy production and consumption affect environmental quality, they remain essential to economic progress. Balancing the consequences of energy use against the welfare that development brings is one of our most sensitive challenges, tangled in global disagreements at every level.`,
    date: '',
  },
  {
    id: 'ashramam-nivasikal',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'പ്രിയപ്പെട്ട ഇടം',
    excerpt: 'അവിവാഹിത കാലഘട്ടം പൂർണമായും അസ്തമിച്ചു തുടങ്ങുമ്പോൾ നിവാസികൾക്ക്\u200cഉമ്മുൽഖുയിനിലെ കുറച്ചു…',
    image: '/ashramam-nivasikal.jpg',
    body: 'അവിവാഹിത കാലഘട്ടം പൂർണമായും അസ്തമിച്ചു തുടങ്ങുമ്പോൾ നിവാസികൾക്ക്\u200cഉമ്മുൽഖുയിനിലെ കുറച്ചു\nവൃക്ഷങ്ങളും വരണ്ടു കിടക്കുന്ന മണൽ തരികളാൽ പ്രത്യക്ഷപെട്ട ചെറു കുന്നുകൾ കൊണ്ട് വിജനമായ മരുഭൂമിയും\nഉല്ലാസ ആശ്രയമാവുകയായിരുന്നു. കഴിഞ്ഞ ചുട്ടുപൊള്ളുന്ന ചൂടുകാലത്തു ഒരു വരുംകാല തണുത്ത രാത്രികളിലെ\nആവേശകരമായ പരിഹാസവും , വഴക്കും , കോഴി ചുടലും ,തമ്പടിക്കലും, കൈകൊട്ടി പാട്ടുകളും , അസാധാരണമായ\nകാൽ ചുവടുകളെയും കുറിച്ച് ഓർത്തപ്പോൾ ഒരു വേഴാമ്പലിനെ പോലെ കാത്തിരിപ്പിന്റെ ഉത്കണ്ഠ വർദ്ധിപ്പിച്ചു\nഎന്നതിലുപരി ഫയർ ബിൽഡിംഗ് 111 എന്ന ആശ്രമ തട്ടകം ഈ ഉല്ലാസ കേന്ദ്രത്തിൽ ഒതുങ്ങി കൂടിയെന്ന്\nനമ്മൾ മനസിലാക്കിയിരുന്നു. ഒരു മുടക്കവും വരുത്താതെ ഇത്തവണ തണുപ്പ് കാലം നമ്മൾ തമ്പടിച്ചു\nവിനയോഗിച്ചിരിക്കും എന്ന ഉറച്ച തീരുമാനത്തിനെതിരെ ഇന്ന് ഇതാ വിധിയുടെ കാവൽ പക്ഷിയെ റാഞ്ചിയെടുത്തു\nകൊണ്ട് നമ്മുടെ മുന്നിൽ സ്വാതന്ത്രത്തെ അടക്കി ഭരിച്ചു അപ്രതീക്ഷിതമായ ഒരു കാലം. നിവാസികൾക്ക്\u200cഒരുപാട്\nപ്രിയപ്പെട്ടതായി കഴിഞ്ഞ ഈ ഇടം ഒരിക്കലും പ്രവചിക്കാൻ കഴിയാത്ത ഇപ്പോഴത്തെ അവസ്ഥയെ മറികടന്നു\nനമ്മളിലേക് തന്നെ ആനന്ദത്തിന്റെ നാളുകളുമായി തിരിച്ചുവരും എന്ന് നമുക്ക് കരുതാം\n... ശുഭം',
    date: '',
  },

  {
    id: 'lockdown-planet',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Replenishment of the Planet During the Lockdown',
    excerpt: 'When the world stood still, the Earth breathed again — and gave us a lesson.',
    image: '/lockdown-planet.jpg',
    body: `For years, humanity has taken the planet for granted, harming it in countless ways while rarely pausing to think about how to preserve it. As the population has grown day by day, so has our consumption of the Earth's resources — unchecked for a very long time. Many wondered what the future would hold if these habits continued, when consumption was already outpacing what the planet could bear.

Then the coronavirus lockdown gave us an unexpected glimpse of the answer. The environmental changes were first visible from space; soon they could be sensed in the skies above our heads, the air in our lungs, and even the ground beneath our feet. As motorways emptied and factories closed, the dirty brown pollution belts shrank over cities and industrial centres — country after country, within days of lockdown. First China, then Italy, then the UK, Germany, and dozens of other nations saw temporary falls in carbon dioxide and nitrogen dioxide of as much as 40%, greatly improving air quality and reducing the risks of asthma, heart attacks, and lung disease.

With the public staying home, vehicle movement stopped and airline traffic fell to little more than cargo fleets. The Earth, in effect, took a break. Dolphins and swans returned to the canals of Venice; elephants roamed freely in China — wildlife reclaiming a quieter, cleaner, human-free world. With less noise and purer air, even the weather seemed to turn for the better.

## The lesson

So the question arises: are we the reason the Earth was corrupted from its original state? The lockdown has given us the answer — and a lesson. Whether we act on it is in our hands; call it a responsibility. A single individual's decision can ripple through a community, and together we can keep the environment the way it is meant to be.

The pandemic shut down industrial activity, slashing greenhouse gas emissions and air pollution worldwide. If there is anything positive to take from this crisis, it is a glimpse of the air we might breathe in a low-carbon future. We live in an age of intersecting global crises — inequality, environmental degradation, climate destabilisation, populism, conflict, economic uncertainty, and mounting public-health threats — and health organisations are witnessing the devastating cost of underprepared systems.

Yet nature has been healing long before COVID-19 forced most of us indoors, and it will continue to do so with the help of good policies. Most countries took firm precautions to keep the lockdown serving its purpose and stop the virus spreading as it had elsewhere. If such stillness lasted for years, we might even see wildlife drift toward the cities in the absence of human bustle. The lockdown proved one thing beyond doubt: if humans can be disciplined enough, the impact on the environment will be profound.`,
    date: '',
  },
  {
    id: 'mental-health',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Mental Health',
    excerpt: 'Our emotional, psychological, and social well-being — and why it deserves the same care as the body.',
    image: '/mental-health.jpg',
    body: `## What mental health means

Mental health shapes how we think, feel, and behave — it is the foundation of our emotional, psychological, and social well-being, and it plays a decisive role in our daily lives. Whether a person is judged "normal" or "abnormal" comes down to behaviour, and behaviour is deeply tied to the state of the mind.

## Why it matters

Mental health must be protected, because when it suffers, mental illness can follow — affecting a person's thinking, feeling, behaviour, and mood. These conditions reach deep into day-to-day living and can damage our ability to relate to others. If you have, or think you might have, a mental illness, the first thing to know is this: you are not alone.

## The roots of the struggle

Mental health problems can arise from stress, loneliness, depression, anxiety, relationship difficulties, the death of a loved one, grief, addiction, self-harm, mood disorders, suicidal thoughts, and other conditions of varying severity — as well as learning disabilities.

## A balanced mind

Good mental health is essential to living a full life: it helps prevent mental disorders and protects our human dignity. It can be described as a satisfactory level of emotional and behavioural adjustment — the ability to enjoy life and keep a healthy balance between its many activities. Caring for the mind is not a luxury; it is as vital as caring for the body.`,
    date: '',
  },
  {
    id: 'education-equality',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Education Equality',
    excerpt: 'Every child deserves the same chance to learn — regardless of wealth, background, or birthplace.',
    image: '/education-equality.jpg',
    body: `## What educational equity means

Education is a right that belongs to everyone, regardless of caste, race, religion, or background. Educational equity is the pursuit of fairness, justice, and impartiality in education — accommodating and meeting the specific needs of specific individuals, so that everyone's learning needs are met. It rests on fairness in distributing resources, opportunities, treatment, and success to every student. True equity means differences in educational outcomes are not the result of differences in wealth, income, power, or possessions. The quality of education a child receives should never depend on the wealth or education of their family — a child who fails in school does not fail because they were poor or had fewer opportunities than their peers. Nor should a child's social, racial, or geographic background decide the education they receive. Students differ in what they need to succeed: some come from disadvantaged environments, others have special educational needs. Simply put, nothing should hold a child back from pursuing their talents and passions. Everyone deserves the same education.

## The gap in the numbers

Minority students remain at a disadvantage in access to advanced academic opportunities. Among surveyed high schools, 55% of those with few minority students offer calculus — but only 29% of those with many minority students do. Similarly, 82% of low-minority schools offer Algebra II, compared with 65% of high-minority schools. Black and Hispanic students made up 44% of those surveyed, yet only 26% of students in gifted and talented programmes — while being overrepresented among those repeating a grade. Across all grades, Black students were nearly three times as likely, and Hispanic students twice as likely, as white students to be held back.

## Opportunity, not just access

Equality of educational opportunity takes many forms — the value placed on education, the scarcity of high-quality schooling, state regulation, and more. These factors shape what each individual can achieve. Debates continue over whether equal opportunity demands equality or adequacy, but one principle stands: we all have a right to educational equality, because education is not merely about books and grades — it is about participating in the nation and building it. Giving the right education to skilled candidates fulfils their creative potential and gives them a true foundation for their careers.

## Knowing our rights

To participate, we must know our rights — otherwise we risk losing them. In the United States, the highest law of the land is the Constitution, whose amendments, known as the Bill of Rights, guarantee that the government can never deprive people of fundamental rights, including freedom of religion, free speech, and due process of law — with many federal and state laws adding further protections. But equal rights in life belong to everyone, everywhere. This is no abstract theory: we still witness violations of basic equality across the world. Setting ego aside and growing our communities is the path that leads, in turn, to equality in education. In today's globalised world, the centrality of education is increasingly recognised: it empowers individuals, transforms societies, prepares children for democratic citizenship, eradicates poverty, and advances our global commitments to sustainable development.

## A right enshrined in law

Education is both a human right in itself and an indispensable means of realising other human rights. Article 26 of the Universal Declaration of Human Rights proclaims the right to education as an inalienable right of every child — boys and girls alike. UNESCO's Convention against Discrimination in Education (1960) was the first instrument to provide for this right comprehensively, establishing universal access and equality of educational opportunity, and reflecting UNESCO's mission to advance "equality of educational opportunities without regard to race, sex, or any distinctions, economic or social." Its constitution affirms the founders' belief in "full and equal opportunities for education for all," and under Article 4, States Parties undertake to pursue national policies promoting equality of opportunity and treatment in education. Other human rights treaties reinforce the same duty: Article 10 of the Convention on the Elimination of All Forms of Discrimination against Women (CEDAW) sets out detailed provisions on equality of opportunity in education and the equal rights of women and men. These are the strong backbones carrying equality forward and improving educational systems across the planet — and as honest individuals, we can each take the initiative to support such causes and help our nations grow.`,
    date: '',
  },

  {
    id: 'sahir-momey',
    badge: 'BELOVED',
    badgeColor: '#d97706',
    title: 'Sahir Momey: The Artist Behind the Lens',
    excerpt: 'A born artist from Fort Kochi — 32 years of craft, from hand-drawn design to photography.',
    image: '/sahir-momey.jpg',
    body: `Sahir Momey is a born artist who went on to become a photographer, with 32 years of experience in the field. He is widely regarded as a legend in hand-drawn design, and later moved into computer design — spanning product design, wall advertisements, theatre slides, portraits, logo design, screen printing, and spray painting. Gradually, he stepped back and moved partially into photography, to support his livelihood.

Sahir was born and brought up in Fort Kochi, a historic port city in Kerala, India, where the community enjoys a vibrant cultural exposure unlike anywhere else in the state. He was raised in a middle-class Muslim family grounded in faith and spirituality. His father was a portrait artist and hand-drawn designer — a college dropout from Feroke, Kozhikode. Sahir's childhood was deeply creative; he accompanied his father to art workshops and grew up immersed in art.

Changing direction was a bold move — never an easy one — yet he succeeded in turning his passion toward photography, focusing on weddings, videography, and local events. He has covered countless weddings with distinction, serving two generations of families. Deeply career-driven, he embraced the rise of new technology, constantly expanding his knowledge and refining his craft.

Through his long journey, he set aside time each day to keep his painter's soul alive, and today he holds a rich collection of his own paintings. His passion is boundless — a driving force that keeps him painting, rather than settling for photography as merely his bread and butter.`,
    date: '',
  },
];

const BelovedArticles: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [query, setQuery] = useState('');

  // Master share link for the article category — copies the list-page URL
  // so one tap leads the public to ALL articles. The ?v=2 query makes
  // WhatsApp/Facebook build the rich link preview (banner + titles)
  // instead of showing their saved copy of the old plain preview.
  const copyCategoryLink = async () => {
    const shareUrl = `${window.location.origin}/articles?v=2`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Public section — track login only so members can comment
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const selected = articleId ? ARTICLES.find((a) => a.id === articleId) || null : null;
  const others = selected ? ARTICLES.filter((a) => a.id !== selected.id) : [];

  // Mobile scroll-reveal: .art-reveal blocks fade/slide in as they enter view.
  // The hidden initial state lives in mobile-only CSS, so desktop is unaffected.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.art-reveal:not(.art-inview)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('art-inview'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('art-inview');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selected, query]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? ARTICLES.filter((a) =>
        `${a.title} ${a.excerpt} ${a.body || ''}`.toLowerCase().includes(q)
      )
    : ARTICLES;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d9d4e9 0%, #f0ebf9 55%, #e3def0 100%)',
      fontFamily: "'Marcellus', Georgia, serif"
    }}>
      <style>{`
        /* "More articles" strip exists only on mobile */
        .art-more { display: none; }
        @media (max-width: 767px) {
          @keyframes artInRight { from { opacity: 0; transform: translateX(64px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes artFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes artFadeDown { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes artInLeft { from { opacity: 0; transform: translateX(-44px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes artHeroZoom { from { transform: scale(1.14); } to { transform: scale(1); } }

          /* List: search bar drops in */
          .art-search { animation: artFadeDown .5s ease-out backwards; }

          /* List: article cards become a horizontal snap-scroll carousel */
          .art-carousel {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            align-items: stretch;
            gap: 12px;
            padding: 6px 20px 18px !important;
            margin: 0 -16px !important;
            scrollbar-width: none;
          }
          .art-carousel::-webkit-scrollbar { display: none; }
          .art-carousel > .art-card {
            flex: 0 0 84% !important;
            max-width: 340px;
            scroll-snap-align: center;
            margin: 0 !important;
            animation: artInRight .55s cubic-bezier(.22,.9,.3,1) backwards;
            animation-delay: calc(var(--art-i, 0) * 80ms);
          }
          /* Carousel card: image on top, text below */
          .art-carousel .art-card-row { flex-direction: column !important; align-items: stretch !important; padding: 0 !important; gap: 0 !important; }
          .art-carousel .art-card-img { width: 100% !important; height: 168px !important; border-radius: 18px 18px 0 0 !important; }
          .art-carousel .art-card-body { padding: 14px 16px 16px !important; }
          .art-carousel .art-card-go { display: none !important; }

          /* List: share button rises in */
          .art-share { animation: artFadeUp .5s ease-out .35s backwards; }

          /* Detail: hero settles from a slow zoom, title slides in from the left */
          .art-hero { animation: artHeroZoom 1.4s ease-out backwards; }
          .art-detail-title { animation: artInLeft .55s cubic-bezier(.22,.9,.3,1) .1s backwards; }
          .art-detail-meta { animation: artFadeUp .5s ease-out .2s backwards; }

          /* Detail: paragraphs and comments reveal as you scroll */
          .art-reveal { opacity: 0; transform: translateY(22px); transition: opacity .55s ease-out, transform .55s cubic-bezier(.22,.9,.3,1); }
          .art-reveal.art-inview { opacity: 1; transform: none; }

          /* Detail: "More articles" horizontal strip */
          .art-more { display: block; margin-top: 20px; }
          .art-more h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: 800; color: #1c2733; }
          .art-more-row {
            display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 4px 16px 14px; scrollbar-width: none;
          }
          .art-more-row::-webkit-scrollbar { display: none; }
          .art-more-card { flex: 0 0 62%; max-width: 240px; scroll-snap-align: start; overflow: hidden; cursor: pointer; margin: 0 !important; }
          .art-more-card img { width: 100%; height: 110px; object-fit: cover; display: block; }
          .art-more-t { padding: 10px 12px 12px; font-size: 14px; font-weight: 700; color: #1c2733; line-height: 1.35; }

          @media (prefers-reduced-motion: reduce) {
            .art-search, .art-carousel > .art-card, .art-share, .art-hero, .art-detail-title, .art-detail-meta { animation: none !important; }
            .art-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          }
        }
      `}</style>
      <PageHeader
        title="Articles"
        backTo="/hangout"
        backLabel={selected ? 'Back to articles' : 'Back to hangout'}
        onBack={selected ? () => navigate('/articles') : undefined}
      />

      <div className={(selected ? 'iv-page' : 'iv-page-wide') + ' iv-tab-clearance'} style={{ paddingTop: '20px', paddingBottom: '110px' }}>
        {!selected ? (
          <>
            {/* Search */}
            <div className="iv-card art-search" style={{
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b9bd5" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: '#1c2733'
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  style={{
                    border: 'none',
                    background: '#e8e4f2',
                    color: '#5b6b7c',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    fontSize: 14,
                    lineHeight: 1,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Article list */}
            {ARTICLES.length === 0 ? (
              <div className="iv-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                  The first article is on its way…
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#5b6b7c', lineHeight: 1.6 }}>
                  Articles from the old site, polished and republished here.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="iv-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                  No articles found
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#5b6b7c', lineHeight: 1.6 }}>
                  Nothing matches “{query.trim()}”. Try a different word.
                </p>
              </div>
            ) : (
              <div className="iv-stagger iv-cards-2 art-carousel">
                {filtered.map((article, idx) => (
                  <article
                    key={article.id}
                    className="iv-card iv-press art-card"
                    onClick={() => navigate(`/articles/${article.id}`)}
                    style={{ marginBottom: 12, overflow: 'hidden', cursor: 'pointer', '--art-i': idx } as React.CSSProperties}
                  >
                    <div className="art-card-row" style={{ display: 'flex', gap: 14, padding: 14, alignItems: 'center' }}>
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="art-card-img"
                          style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 96, height: 96, borderRadius: 12, flexShrink: 0,
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
                        }}>
                          📖
                        </div>
                      )}
                      <div className="art-card-body" style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: '#1c2733' }}>
                          {article.title}
                        </h3>
                        <p style={{
                          margin: 0, fontSize: 13, color: '#5b6b7c', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {article.excerpt}
                        </p>
                        {article.date && (
                          <div style={{ marginTop: 6, fontSize: 12, color: '#8a9aab' }}>{article.date}</div>
                        )}
                      </div>
                      <div className="art-card-go" style={{ fontSize: 20, color: '#9db2c6', flexShrink: 0 }}>›</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {/* Master share button — right below all the articles */}
            <div className="art-share" style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px 0' }}>
              <button
                onClick={copyCategoryLink}
                aria-label="Copy link to all articles"
                className="iv-press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 22px',
                  borderRadius: 999,
                  border: '1px solid rgba(91,155,213,.45)',
                  background: '#ffffff',
                  color: '#2f7fc4',
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(47,127,196,.12)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>{linkCopied ? '✓' : '🔗'}</span>
                {linkCopied ? 'Link copied!' : 'Copy link to all articles'}
              </button>
            </div>
          </>
        ) : (
          /* Article detail */
          <>
            <article className="iv-card" style={{ overflow: 'hidden' }}>
              {selected.image && (
                <img src={selected.image} alt={selected.title} className="art-hero" style={{ width: '100%', display: 'block' }} />
              )}
              <div style={{ padding: 20 }}>
                <h2 className="art-detail-title" style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 800, color: '#1c2733' }}>
                  {selected.title}
                </h2>
                {selected.date && (
                  <div className="art-detail-meta" style={{ fontSize: 13, color: '#8a9aab', marginBottom: 14 }}>{selected.date}</div>
                )}
                <div style={{ fontSize: 15, color: '#3d4b5c', lineHeight: 1.75 }}>
                  {(selected.body || selected.excerpt).split('\n').map((line, i) =>
                    line.startsWith('## ') ? (
                      <h4 key={i} className="art-reveal" style={{ margin: '20px 0 6px 0', fontSize: 16, fontWeight: 800, color: '#1c2733' }}>
                        {line.slice(3)}
                      </h4>
                    ) : line.trim() === '' ? (
                      <div key={i} style={{ height: 8 }} />
                    ) : (
                      <p key={i} className="art-reveal" style={{ margin: '0 0 10px 0' }}>{line}</p>
                    )
                  )}
                </div>
              </div>
            </article>
            <div className="art-reveal">
              <StoryEngagement
                storyId={selected.id}
                user={user}
                collectionName="belovedArticles"
                emptyText="No comments yet — be the first to share your thoughts."
              />
            </div>
            {others.length > 0 && (
              <div className="art-more art-reveal">
                <h3>More articles</h3>
                <div className="art-more-row">
                  {others.map((o) => (
                    <div
                      key={o.id}
                      className="iv-card iv-press art-more-card"
                      onClick={() => { navigate(`/articles/${o.id}`); window.scrollTo(0, 0); }}
                    >
                      {o.image && <img src={o.image} alt={o.title} />}
                      <div className="art-more-t">{o.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BelovedArticles;
