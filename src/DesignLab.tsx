import React, { useState } from 'react';
import './design-lab.css';

interface Theme {
  id: 'noir' | 'emerald' | 'ivory';
  name: string;
  tagline: string;
  swatches: string[];
  notes: { title: string; body: string }[];
}

const THEMES: Theme[] = [
  {
    id: 'noir',
    name: 'Noir Gold',
    tagline: 'MIDNIGHT LUXURY',
    swatches: ['#0b0b0d', '#16161a', '#d4af37', '#f5f1e6', '#8a6a24'],
    notes: [
      { title: 'Mood', body: 'Private members’ club. Deep black surfaces with gold hairlines — matches your Power Group black-card taste and makes the whole app feel expensive.' },
      { title: 'Typography', body: 'Playfair Display headlines with italic gold accents, Inter for everything else. Big, confident, editorial.' },
      { title: 'Details', body: 'Glowing gold dividers, gradient CTA buttons, soft radial light behind the hero, glassy bottom nav with a gold active tab.' },
    ],
  },
  {
    id: 'emerald',
    name: 'Emerald Luxe',
    tagline: 'HERITAGE & CALM',
    swatches: ['#081210', '#10231c', '#c9a96a', '#f2ede1', '#2e5c4b'],
    notes: [
      { title: 'Mood', body: 'Old-money lounge. Deep forest greens with champagne gold — rich but calmer and warmer than pure black.' },
      { title: 'Typography', body: 'Marcellus headlines — the classic luxury-hotel letterform — with wide-tracked labels. Understated and timeless.' },
      { title: 'Details', body: 'Champagne hairlines, emerald glow behind cards, muted sage secondary text. Feels established, like the club has history.' },
    ],
  },
  {
    id: 'ivory',
    name: 'Ivory Atelier',
    tagline: 'LIGHT & REFINED',
    swatches: ['#f6f1e8', '#fffdf8', '#9a6b3f', '#1c1915', '#e7dfd2'],
    notes: [
      { title: 'Mood', body: 'Gallery daylight. Warm ivory paper, ink text, bronze accents — premium without going dark. Clean and neat, elevated.' },
      { title: 'Typography', body: 'Cormorant Garamond headlines with italic flourishes, generous whitespace. Feels like a printed invitation.' },
      { title: 'Details', body: 'Bronze hairlines, soft warm shadows instead of glows, dark-ink feature card for contrast against the light page.' },
    ],
  },
];

const TILES = [
  { icon: '🃏', title: 'UNO', sub: 'Game night with the crew' },
  { icon: '⚡', title: 'Power Group', sub: 'Rich and naughty' },
  { icon: '📝', title: 'Meeting Minutes', sub: 'Catch up on decisions' },
  { icon: '🏦', title: 'Royal Bank', sub: 'Financial assistance' },
  { icon: '✈️', title: 'Our Trips', sub: 'Share travel experiences' },
  { icon: '🎙️', title: 'Voice Room', sub: 'Talk in real time' },
];

const NAV = [
  { icon: '🏠', label: 'Scrap Book', on: false },
  { icon: '📚', label: 'Stories', on: false },
  { icon: '🍸', label: 'Hangout', on: true },
  { icon: '👥', label: 'People', on: false },
  { icon: '⚙️', label: 'Settings', on: false },
];

const DesignLab: React.FC = () => {
  const [activeId, setActiveId] = useState<'noir' | 'emerald' | 'ivory'>('noir');
  const theme = THEMES.find((t) => t.id === activeId) || THEMES[0];

  return (
    <div className="dl-page">
      <div className="dl-wrap">
        <div className="dl-kicker">ASHRAMAM · STYLE LAB</div>
        <h1 className="dl-h1">Three premium looks.</h1>
        <p className="dl-sub">
          Tap a theme to preview it on the Hangout screen. Tell me which one you love —
          I’ll roll it out across the whole app. Don’t like any? I’ll take it all back.
        </p>

        <div className="dl-switcher">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`dl-pill${t.id === activeId ? ` dl-active-${t.id}` : ''}`}
              onClick={() => setActiveId(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Phone mock */}
        <div className={`dl-phone dl-t-${theme.id}`}>
          <div className="dl-screen">
            <div className="dl-header">
              <button className="dl-back" aria-label="Back">‹</button>
              <h2 className="dl-headtitle">Hangout</h2>
              <div className="dl-logo">A</div>
            </div>

            <div className="dl-hero">
              <span className="dl-eyebrow">YOUR CIRCLE</span>
              <h3 className="dl-greet">Good <em>evening</em></h3>
              <p className="dl-lede">
                Everything your crew is up to — live chats, plans and memories, all in one place.
              </p>
            </div>

            <div className="dl-feature">
              <div className="dl-live">
                <span className="dl-dot" />
                <span className="dl-live-label">HAPPENING NOW</span>
              </div>
              <h3>Voice Room</h3>
              <p>3 people are talking right now — jump in.</p>
              <button className="dl-cta">🎙️ Join voice chat <span>→</span></button>
            </div>

            <div className="dl-label">EXPLORE</div>
            <div className="dl-grid">
              {TILES.map((tile) => (
                <div className="dl-tile" key={tile.title}>
                  <div className="dl-tile-ic">{tile.icon}</div>
                  <h4>{tile.title}</h4>
                  <p>{tile.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dl-nav">
            {NAV.map((n) => (
              <button key={n.label} className={n.on ? 'on' : ''}>
                <span className="ic">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme notes */}
        <div className="dl-notes">
          <div className="dl-tag">{theme.tagline}</div>
          <h2>{theme.name}</h2>
          <div className="dl-swatches">
            {theme.swatches.map((c) => (
              <span key={c} className="dl-sw" style={{ background: c }} />
            ))}
          </div>
          <ul>
            {theme.notes.map((n) => (
              <li key={n.title}><b>{n.title} — </b>{n.body}</li>
            ))}
          </ul>
        </div>

        <p className="dl-hint">
          Like one? Just reply <b>“Noir Gold”</b>, <b>“Emerald Luxe”</b> or <b>“Ivory Atelier”</b>.<br />
          Want a mix — say the word and I’ll blend them.
        </p>
      </div>
    </div>
  );
};

export default DesignLab;
