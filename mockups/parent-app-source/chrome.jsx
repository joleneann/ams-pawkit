// chrome.jsx — Pawkit hi-fi primitives + device frame
// Tokens come from tokens.css, classes from primitives.css.

const { useState } = React;

// ─────────────────────────────────────────────────────────────
// Pet photo registry — Unsplash CDN URLs. Gradient fallbacks
// remain in the CSS so a failed load still looks on-brand.
// ─────────────────────────────────────────────────────────────
const PETS = {
  gabby:  { tone: 'honey',   photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80&auto=format&fit=crop&crop=faces,entropy' },
  angel:  { tone: 'smoke',   photo: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800&q=80&auto=format&fit=crop&crop=faces,entropy' },
  galaxy: { tone: 'peach',   photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80&auto=format&fit=crop&crop=faces,entropy' },
  raffy:  { tone: 'sable',   photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80&auto=format&fit=crop&crop=faces,entropy' },
};
const BROADCAST_PHOTOS = {
  monsoon: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=900&q=80&auto=format&fit=crop',
};

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Phosphor icon — renders Phosphor Regular via @phosphor-icons/web
// (loaded as a CSS web font in Parent App.html). Custom glyphs that
// aren't in Phosphor (memorial wings) fall through to the SVG sprite.
// ─────────────────────────────────────────────────────────────
const PH_NAME = {
  'paper-plane': 'paper-plane-tilt',
  'paw':         'paw-print',
  'magnifier':   'magnifying-glass',
  'chat':        'chat-circle',
  'floppy':      'floppy-disk',
  'pin':         'map-pin',
  'download':    'download-simple',
};
const SPRITE_GLYPHS = new Set(['wings']);

function Icon({ id, size = 18, color, style, ...rest }) {
  if (SPRITE_GLYPHS.has(id)) {
    return (
      <svg
        className={`icon s${size}`}
        width={size}
        height={size}
        style={{ color, ...style }}
        aria-hidden="true"
        {...rest}
      >
        <use href={`#i-${id}`} />
      </svg>
    );
  }
  const name = PH_NAME[id] || id;
  return (
    <i
      className={`icon s${size} ph ph-${name}`}
      style={{ fontSize: size, lineHeight: 1, color, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// PawkitFrame — device shell (status bar + body + nav bar)
// ─────────────────────────────────────────────────────────────
function PawkitFrame({ children, time = "9:41", ground = false, statusDark = false }) {
  const tone = statusDark ? "#fff" : "var(--ink)";
  return (
    <div className="pk-device">
      <div className="pk-status" style={{ color: tone }}>
        <span>{time}</span>
        <div className="punch" />
        <div className="right">
          {/* Wifi */}
          <svg width="14" height="14" viewBox="0 0 16 16">
            <path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" fill={tone}/>
          </svg>
          {/* Signal */}
          <svg width="14" height="14" viewBox="0 0 16 16">
            <path d="M14.67 14.67V1.33L1.33 14.67h13.34z" fill={tone}/>
          </svg>
          {/* Battery */}
          <svg width="14" height="14" viewBox="0 0 16 16">
            <rect x="3.75" y="2" width="8.5" height="13" rx="1.5" fill={tone}/>
            <rect x="5.5" y="0.9" width="5" height="2" rx="0.5" fill={tone}/>
          </svg>
        </div>
      </div>
      <div className={`pk-content${ground ? " ground" : ""}`}>
        {children}
      </div>
      <div className="pk-nav"><div className="pill" /></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomNav — 5-tab icon nav. Pets dead-center.
// ─────────────────────────────────────────────────────────────
function BottomNav({ active = "pets" }) {
  const tabs = [
    { id: "broadcasts", icon: "megaphone" },
    { id: "community",  icon: "users-three" },
    { id: "pets",       icon: "paw" },
    { id: "inbox",      icon: "tray" },
    { id: "shop",       icon: "storefront" },
  ];
  return (
    <div className="pk-bottomnav">
      {tabs.map(t => (
        <div key={t.id} className={`tab${active === t.id ? " active" : ""}`}>
          <Icon id={t.icon} size={t.id === "pets" ? 26 : 22} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TopBar — back / title / right slot
// ─────────────────────────────────────────────────────────────
function TopBar({ back = true, title, subtitle, right = null, onBack }) {
  return (
    <div className="pk-topbar">
      <div>
        {back && (
          <div className="icon-btn" onClick={onBack}>
            <Icon id="arrow-left" size={20} />
          </div>
        )}
      </div>
      <div className="title">
        {title}
        {subtitle && <span className="title-sub">{subtitle}</span>}
      </div>
      <div className="right">{right}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PageHead — bigger page header (used on tab roots like Inbox/Broadcasts)
// ─────────────────────────────────────────────────────────────
function PageHead({ title, sub }) {
  return (
    <div className="pk-pagehead">
      <h1>{title}</h1>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cover — pet page cover image with fur strip
// ─────────────────────────────────────────────────────────────
function Cover({ tone = "honey", height, hero = false, sampling = false, empty = false, photo, memorial = false, label, children }) {
  const h = hero ? 340 : (height ?? 180);
  if (empty) {
    return (
      <div className="pk-cover empty" style={{ height: h }}>
        <div className="img" />
        <div className="strip" />
        {children}
      </div>
    );
  }
  const imgStyle = photo ? {
    backgroundImage: `url(${photo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 28%',
  } : {};
  return (
    <div className={`pk-cover${hero ? ' hero' : ''}`} style={{ height: h }}>
      <div className={`img ${tone}`} style={imgStyle} />
      {sampling && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--fur-sable)', opacity: 0.86 }} />
          <div className="scan" />
        </>
      )}
      {memorial && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      )}
      <div className={`strip ${tone}`} style={memorial ? { height: 4 } : undefined} />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PetNameRow — Lora italic name + optional gear pill
// ─────────────────────────────────────────────────────────────
function PetNameRow({ name, gear = true, hero = false, beat = false }) {
  const cls = `pk-petname-row${hero ? ' hero' : ''}${beat ? ' beat' : ''}`;
  return (
    <div className={cls}>
      <div className="name">{name}</div>
      {gear && (
        <div className="gear">
          <Icon id="gear" size={20} />
        </div>
      )}
    </div>
  );
}

function PetSubline({ children, hero = false }) {
  return <div className={`pk-petsub${hero ? ' hero' : ''}`}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// TabStrip — Timeline / Vaccinations / Invoices
// ─────────────────────────────────────────────────────────────
function TabStrip({ tabs, active }) {
  return (
    <div className="pk-tabstrip">
      {tabs.map(t => (
        <div key={t} className={`t${active === t ? " active" : ""}`}>{t}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Banner — open follow-up window (Berry) or warm reminder
// ─────────────────────────────────────────────────────────────
function BerryBanner({ petName, until }) {
  return (
    <div className="pk-banner berry">
      <div className="lead">
        Dr Sagar is here for <b>{petName}</b> until {until}.
      </div>
      <span className="cta">
        Open thread <Icon id="arrow-right" size={14} />
      </span>
    </div>
  );
}

function WarmBanner({ headIcon = "clock", head, det, cta }) {
  return (
    <div className="pk-banner warm">
      <div className="head">
        <Icon id={headIcon} size={16} />
        <span>{head}</span>
      </div>
      {det && <div className="det">{det}</div>}
      {cta && <span className="cta">{cta} →</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TimelineCard
// ─────────────────────────────────────────────────────────────
function TimelineCard({ icon, accent, title, det, when }) {
  return (
    <div className="pk-tl-card">
      <div className={`ico${accent ? " " + accent : ""}`}>
        <Icon id={icon} size={18} />
      </div>
      <div>
        <div className="ttl">{title}</div>
        {det && <div className="det">{det}</div>}
      </div>
      <div className="when">{when}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill / Toggle / Progress / Seg
// ─────────────────────────────────────────────────────────────
function Pill({ tone, children }) {
  return <span className={`pk-pill${tone ? " " + tone : ""}`}>{children}</span>;
}
function Toggle({ on }) {
  return <div className={`pk-toggle${on ? " on" : ""}`} />;
}
function Progress({ total, at }) {
  return (
    <div className="pk-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`d${i <= at ? " on" : ""}`} />
      ))}
    </div>
  );
}
function Seg({ options, on }) {
  return (
    <div className="pk-seg">
      {options.map(o => (
        <span key={o} className={`opt${o === on ? " on" : ""}`}>{o}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────
function PrimaryBtn({ children, full, lg, sm, leading, trailing, ...rest }) {
  const cls = `pk-btn primary${full ? " full" : ""}${lg ? " lg" : ""}${sm ? " sm" : ""}`;
  return (
    <button className={cls} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}
function OutlineBtn({ children, full, lg, sm, leading, trailing, ...rest }) {
  const cls = `pk-btn outline${full ? " full" : ""}${lg ? " lg" : ""}${sm ? " sm" : ""}`;
  return (
    <button className={cls} {...rest}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}
function GhostBtn({ children, full, lg, sm, ...rest }) {
  const cls = `pk-btn ghost${full ? " full" : ""}${lg ? " lg" : ""}${sm ? " sm" : ""}`;
  return <button className={cls} {...rest}>{children}</button>;
}

// ─────────────────────────────────────────────────────────────
// PetAvatar (for Inbox rows and switcher)
// ─────────────────────────────────────────────────────────────
function PetAvatar({ tone = "honey", initial, size = 44, sable = false, wings = false }) {
  const cls = sable ? "sable" : tone;
  return (
    <div className={`pk-ibx-row-av av ${cls}`} style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {initial}
      {wings && <WingsBadge />}
    </div>
  );
}

function WingsBadge() {
  // Hand-traced wings on a paper pill
  return (
    <div className="wings-badge">
      <Icon id="wings" size={11} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bubble (chat)
// ─────────────────────────────────────────────────────────────
function Bubble({ from = "them", time, children }) {
  return (
    <div className={`pk-bub ${from}`}>
      {children}
      {time && <span className="time">{time}</span>}
    </div>
  );
}
function SysBubble({ children }) {
  return <div className="pk-bub sys">{children}</div>;
}
function MediaBubble({ from = "them", tone = "honey", kind = "photo", time, caption }) {
  return (
    <div className={`pk-bub media ${from}`}>
      <div className={`media-tile`} style={{
        background: kind === "video"
          ? "linear-gradient(135deg, var(--fur-bark), var(--fur-sable))"
          : "linear-gradient(135deg, var(--fur-vanilla), var(--fur-honey), var(--fur-rust))",
      }}>
        {kind === "video" && (
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', color: 'var(--ink)',
            display: 'grid', placeItems: 'center', paddingLeft: 3,
          }}><Icon id="play" size={20} /></div>
        )}
        {kind === "video" && (
          <div style={{
            position: 'absolute', bottom: 8, right: 10,
            background: 'rgba(0,0,0,0.55)', color: '#fff',
            padding: '2px 6px', borderRadius: 4,
            fontSize: 'var(--text-xxs)', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          }}>0:18</div>
        )}
      </div>
      {(caption || time) && (
        <div style={{ padding: '4px 8px 0', fontSize: 'var(--text-xxs)', color: 'var(--ink-50)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>{caption}</span>
          <span>{time}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Composer / Closed-window card
// ─────────────────────────────────────────────────────────────
function Composer({ placeholder = "Reply to Dr Sagar…" }) {
  return (
    <div className="pk-composer">
      <div className="icon-btn"><Icon id="plus" size={18} /></div>
      <div className="input">{placeholder}</div>
      <div className="icon-btn send"><Icon id="paper-plane" size={16} /></div>
    </div>
  );
}
function ClosedCard({ children }) {
  return <div className="pk-closed-card">{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// Logo placeholder — wordmark for sign-out / about
// ─────────────────────────────────────────────────────────────
const _PAWKIT_MARK_TOKEN = { md: 'var(--text-md)', '2xl': 'var(--text-2xl)' };
function PawkitMark({ size = '2xl' }) {
  const fontSize = _PAWKIT_MARK_TOKEN[size] || _PAWKIT_MARK_TOKEN['2xl'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize, color: 'var(--ink)' }}>
      <span style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 600, color: 'var(--berry)' }}>P</span>
      <span style={{ letterSpacing: '-0.01em' }}>awkit</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Sheet (bottom)
// ─────────────────────────────────────────────────────────────
function Sheet({ children, title, sub }) {
  return (
    <>
      <div className="pk-backdrop" />
      <div className="pk-sheet">
        <div className="grab" />
        {(title || sub) && (
          <div className="head">
            {title && <h2>{title}</h2>}
            {sub && <div className="sub">{sub}</div>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}

// Export everything
Object.assign(window, {
  Icon, PawkitFrame, BottomNav, TopBar, PageHead,
  Cover, PetNameRow, PetSubline, TabStrip,
  BerryBanner, WarmBanner, TimelineCard,
  Pill, Toggle, Progress, Seg,
  PrimaryBtn, OutlineBtn, GhostBtn,
  PetAvatar, WingsBadge,
  Bubble, SysBubble, MediaBubble, Composer, ClosedCard,
  PawkitMark, Sheet,
  PETS, BROADCAST_PHOTOS,
});
