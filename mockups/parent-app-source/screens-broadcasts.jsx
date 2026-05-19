// screens-broadcasts.jsx — Broadcasts list, reading views, sharing flow.

// ─────────────────────────────────────────────────────────────
// Broadcasts list
// ─────────────────────────────────────────────────────────────
function BroadcastsList() {
  return (
    <PawkitFrame>
      <PageHead title="Broadcasts" sub="From Dr Sagar · AMS Pune" />
      <div className="pk-scroll">
        <div className="pk-bcast">
          <div className="header">
            <div className="av">S</div>
            <div className="who">
              <b>Dr Sagar · AMS</b><br />
              <span className="stamp">Today · 8:12 am</span>
            </div>
            <div className="right">
              <div className="pk-seg" style={{ padding: 2 }}><span className="opt on" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>EN</span><span className="opt" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>MR</span></div>
              <span className="unread-dot" />
            </div>
          </div>
          <div className="cover" style={{ backgroundImage: `url(${BROADCAST_PHOTOS.monsoon})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="ttl">Monsoon ear-infection watch for dogs</div>
          <div className="body preview">
            As Pune's monsoon settles in, we see a sharp rise in canine ear infections. Humid air and trapped moisture in the ear canal is a breeding ground for bacteria and yeast…
          </div>
          <span className="read-more">Read full →</span>
        </div>

        <div className="pk-bcast">
          <div className="header">
            <div className="av">S</div>
            <div className="who">
              <b>Dr Sagar · AMS</b><br />
              <span className="stamp">Mon · 9:40 am</span>
            </div>
            <div className="right">
              <div className="pk-seg" style={{ padding: 2 }}><span className="opt on" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>EN</span><span className="opt" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>MR</span></div>
            </div>
          </div>
          <div className="ttl" style={{ marginBottom: 4 }}>AMS will be closed Mon 9 Nov for Diwali</div>
          <div className="body">
            We'll reopen Tue 10 Nov, 9am, on regular schedule. For after-hours emergencies, call the 24×7 hotline: +91 98••• ••456.
          </div>
        </div>

        <div className="pk-bcast">
          <div className="header">
            <div className="av">S</div>
            <div className="who">
              <b>Dr Sagar · AMS</b><br />
              <span className="stamp">12 Mar · 6:30 pm</span>
            </div>
            <div className="right">
              <div className="pk-seg" style={{ padding: 2 }}><span className="opt" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>EN</span><span className="opt on" style={{ padding: '3px 8px', fontSize: 'var(--text-xxs)' }}>MR</span></div>
            </div>
          </div>
          <div className="ttl" style={{ marginBottom: 4, fontFamily: 'Noto Sans Devanagari, var(--font-inter)' }}>
            पावसाळ्यात कुत्र्यांसाठी टिक्स आणि पिसवांचा सल्ला
          </div>
          <div className="body preview" style={{ fontFamily: 'Noto Sans Devanagari, var(--font-inter)' }}>
            पावसाळ्यात कुत्र्यांच्या त्वचेच्या समस्या वाढतात. साप्ताहिक तपासणी आणि कोरडे ठेवणे…
          </div>
          <span className="read-more">पूर्ण वाचा →</span>
        </div>
      </div>
      <BottomNav active="broadcasts" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Broadcast reading view · full payload
// ─────────────────────────────────────────────────────────────
function BroadcastReadingLong() {
  return (
    <PawkitFrame>
      <TopBar title="From Dr Sagar Bhongale" right={<div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}><Icon id="share-network" size={20} /></div>} />
      <div className="pk-reader">
        <div className="byline">AMS Pune · Today, 8:12 am</div>
        <h1>Monsoon ear-infection watch for dogs</h1>
        <div className="cover" style={{ backgroundImage: `url(${BROADCAST_PHOTOS.monsoon})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />

        <div className="summary">
          <div className="label">Summary</div>
          <ul>
            <li>Humid weather flares ear infections in dogs.</li>
            <li>Check ears weekly, dry them after walks.</li>
            <li>Floppy-eared breeds at higher risk.</li>
          </ul>
        </div>

        <div className="body">
          As Pune's monsoon settles in, we see a sharp rise in canine ear infections. Humid air and trapped moisture is a breeding ground for bacteria and yeast. Most flares are easy to catch early if you check the ears weekly and dry them after walks or baths.
        </div>

        <div className="warn-box">
          <div className="head"><Icon id="warning" size={16} /> Warning signs</div>
          <ul>
            <li>Repeated head-shaking or scratching</li>
            <li>Dark or smelly ear discharge</li>
            <li>Redness or swelling around opening</li>
          </ul>
        </div>

        <div className="escal">
          <div className="head">If it's already serious</div>
          <div className="body">Walk into AMS the same day. We keep a daily slot reserved for ear cases during monsoon.</div>
          <div className="ctas">
            <OutlineBtn sm leading={<Icon id="phone" size={14} />}>Call clinic</OutlineBtn>
            <OutlineBtn sm leading={<Icon id="pin" size={14} />}>Directions</OutlineBtn>
          </div>
        </div>
      </div>

      <div className="pk-share-footer">
        <div className="lead"><Icon id="share-network" size={18} /> Share with someone</div>
        <div className="actions">
          <div className="pill" title="WhatsApp" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>WA</div>
          <div className="pill" title="Share"><Icon id="share-network" size={14} /></div>
          <div className="pill" title="Email"><Icon id="envelope" size={14} /></div>
        </div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Broadcast reading view · short notice (only body + share)
// ─────────────────────────────────────────────────────────────
function BroadcastReadingShort() {
  return (
    <PawkitFrame>
      <TopBar title="From Dr Sagar Bhongale" right={<div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}><Icon id="share-network" size={20} /></div>} />
      <div className="pk-reader">
        <div className="byline">AMS Pune · Mon, 9:40 am</div>
        <h1>AMS will be closed Mon 9 Nov for Diwali</h1>
        <div className="body">
          We'll reopen on Tue 10 Nov, 9am, on regular schedule.
          <br /><br />
          For after-hours emergencies on Diwali day, please call the 24×7 vet hotline: <b>+91 98••• ••456</b>.
          <br /><br />
          Wishing you and your pets a safe and peaceful Diwali. Keep them indoors, away from firecrackers.
        </div>
      </div>
      <div className="pk-share-footer">
        <div className="lead"><Icon id="share-network" size={18} /> Share with someone</div>
        <div className="actions">
          <div className="pill" style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>WA</div>
          <div className="pill"><Icon id="share-network" size={14} /></div>
          <div className="pill"><Icon id="envelope" size={14} /></div>
        </div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Share sheet (over reading view)
// ─────────────────────────────────────────────────────────────
function ShareSheet() {
  return (
    <PawkitFrame>
      <TopBar title="From Dr Sagar Bhongale" />
      <div style={{ flex: 1, opacity: 0.35, padding: '14px 20px', background: 'var(--canvas)', overflow: 'hidden' }}>
        <div className="byline" style={{ fontSize: 'var(--text-xxs)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 12 }}>
          AMS Pune · Today, 8:12 am
        </div>
        <h1 style={{
          fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)', lineHeight: 1.2,
          fontWeight: 600, margin: '0 0 14px',
        }}>Monsoon ear-infection watch for dogs</h1>
        <div style={{
          width: '100%', aspectRatio: '16/9', borderRadius: 12,
          backgroundImage: `url(${BROADCAST_PHOTOS.monsoon})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      </div>
      <div className="pk-backdrop" />
      <div className="pk-sheet">
        <div className="grab" />
        <div className="head">
          <h2>Share this broadcast</h2>
          <div className="sub">Opens at pawkit.app/broadcasts/monsoon-ears</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '8px 18px 14px' }}>
          <ShareTile label="WhatsApp" mark="WA" />
          <ShareTile label="More apps" icon="share-network" />
          <ShareTile label="Email" icon="envelope" />
          <ShareTile label="Copy link" icon="paperclip" />
        </div>
        <div style={{ margin: '0 18px', padding: '10px 12px', border: '1px dashed var(--rule)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            flex: 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>pawkit.app/broadcasts/monsoon-ears</span>
          <span className="pk-link ink" style={{ fontSize: 'var(--text-sm)' }}>Copy</span>
        </div>
        <div style={{ padding: '14px 18px 4px', textAlign: 'center' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink-70)' }}>Cancel</span>
        </div>
      </div>
    </PawkitFrame>
  );
}
function ShareTile({ label, mark, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--canvas-2)', border: '1px solid var(--rule)',
        display: 'grid', placeItems: 'center',
        color: 'var(--ink)', fontWeight: 700, fontSize: 'var(--text-base)',
      }}>
        {mark || <Icon id={icon} size={20} />}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Public web view (in a browser chrome)
// ─────────────────────────────────────────────────────────────
function PublicWebView() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--canvas)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: 'var(--rail-tint)', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--rule)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--canvas-2)', border: '1px solid var(--rule)' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--canvas-2)', border: '1px solid var(--rule)' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--canvas-2)', border: '1px solid var(--rule)' }} />
        </div>
        <div style={{
          flex: 1, background: 'var(--canvas)', border: '1px solid var(--rule)',
          borderRadius: 6, padding: '5px 12px',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          color: 'var(--ink-70)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon id="lock" size={12} /> pawkit.app/broadcasts/monsoon-ears
        </div>
      </div>

      {/* Open in app banner */}
      <div style={{
        background: 'var(--berry-soft)', padding: '12px 18px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--ink)', color: 'var(--canvas)',
          display: 'grid', placeItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 600, fontSize: 'var(--text-md)' }}>P</span>
        </div>
        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}><PawkitMark size="md" /></div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-70)' }}>From AMS Pune · for pet parents</div>
        </div>
        <span className="pk-link" style={{ fontSize: 'var(--text-sm)' }}>Open in app</span>
      </div>

      {/* Article */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div className="pk-eyebrow" style={{ marginBottom: 14 }}>
          Dr Sagar Bhongale · AMS Pune
        </div>
        <h1 style={{
          fontFamily: 'var(--font-inter)', fontSize: 'var(--text-3xl)', lineHeight: 1.15,
          fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 18px',
        }}>Monsoon ear-infection watch for dogs</h1>
        <div style={{
          width: '100%', aspectRatio: '16/9', borderRadius: 12, marginBottom: 22,
          backgroundImage: `url(${BROADCAST_PHOTOS.monsoon})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }} />

        <div style={{
          background: 'var(--canvas-2)', borderRadius: 12, padding: '14px 16px', marginBottom: 22,
        }}>
          <div className="pk-eyebrow" style={{ marginBottom: 8 }}>Summary</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-md)', lineHeight: 1.55 }}>
            <li>Humid weather flares ear infections in dogs.</li>
            <li>Check ears weekly, dry them after walks.</li>
            <li>Floppy-eared breeds at higher risk.</li>
          </ul>
        </div>

        <div style={{ fontSize: 'var(--text-md)', lineHeight: 1.65, color: 'var(--ink)', marginBottom: 22 }}>
          As Pune's monsoon settles in, we see a sharp rise in canine ear infections. Humid air and trapped moisture is a breeding ground for bacteria and yeast.
        </div>

        <div style={{
          border: '1px solid var(--ink)', borderRadius: 12, padding: '14px 16px', marginBottom: 22,
          background: 'var(--canvas-2)',
        }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon id="warning" size={16} /> Warning signs
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
            <li>Repeated head-shaking or scratching</li>
            <li>Dark or smelly ear discharge</li>
            <li>Redness or swelling around opening</li>
          </ul>
        </div>

        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--rule)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--ink-50)', marginBottom: 10 }}>
            Published by Animal Medical Services on 12 Mar 2026.
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)' }}>
            Want this for your clinic? <span className="pk-link ink">pawkit.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BroadcastsEmpty() {
  return (
    <PawkitFrame>
      <PageHead title="Broadcasts" sub="From Dr Sagar · AMS Pune" />
      <div className="pk-empty">No broadcasts from Dr Sagar yet.</div>
      <BottomNav active="broadcasts" />
    </PawkitFrame>
  );
}

Object.assign(window, {
  BroadcastsList, BroadcastReadingLong, BroadcastReadingShort,
  ShareSheet, PublicWebView, BroadcastsEmpty,
});
