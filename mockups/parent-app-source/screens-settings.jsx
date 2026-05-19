// screens-settings.jsx — Master Settings, Per-pet Settings, Override sheet.

// ─────────────────────────────────────────────────────────────
// Master Settings
// ─────────────────────────────────────────────────────────────
function MasterSettings() {
  return (
    <PawkitFrame>
      <TopBar title="Settings" />
      <div className="pk-scroll ground">
        <div className="pk-section-label">Account</div>
        <div className="pk-setrow">
          <div className="k">Household name</div>
          <div className="v">The Fernandes family <Icon id="arrow-right" size={14} style={{ transform: 'rotate(0deg)', opacity: 0.55 }} /></div>
        </div>
        <div className="pk-setrow">
          <div className="k">Phone number</div>
          <div className="v" style={{ fontVariantNumeric: 'tabular-nums' }}>
            +91 98••• ••456
            <Icon id="lock" size={12} style={{ color: 'var(--ink-50)' }} />
          </div>
        </div>
        <div className="pk-setrow">
          <div style={{ minWidth: 0 }}>
            <div className="k">Language</div>
            <div className="sub">Overrides device locale.</div>
          </div>
          <Seg options={['EN', 'MR']} on="EN" />
        </div>

        <div className="pk-section-label">Pets</div>
        <div className="pk-setrow-pet">
          <div className="av honey" style={{ backgroundImage: `url(${PETS.gabby.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="meta">
            <div className="name">Gabby</div>
            <div className="det">Golden Retriever · M · 4y</div>
          </div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>
        <div className="pk-setrow-pet">
          <div className="av smoke" style={{ backgroundImage: `url(${PETS.angel.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="meta">
            <div className="name">Angel</div>
            <div className="det">Persian · F · 8y</div>
          </div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>
        <div className="pk-setrow-pet">
          <div className="av peach" style={{ backgroundImage: `url(${PETS.galaxy.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="meta">
            <div className="name">Galaxy</div>
            <div className="det">Indie · 11y</div>
          </div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>
        <div className="pk-setrow-add">
          <div className="plus"><Icon id="plus" size={20} /></div>
          <div>
            <div className="label">Add a pet</div>
          </div>
          <Icon id="arrow-right" size={16} />
        </div>

        <div className="pk-section-label">Notifications</div>
        <div className="pk-setrow">
          <div style={{ minWidth: 0 }}>
            <div className="k">Push notifications</div>
            <div className="sub">Vaccinations, broadcasts, vet replies.</div>
          </div>
          <Toggle on />
        </div>

        <div style={{ padding: '36px 20px 24px', textAlign: 'center' }}>
          <span className="pk-link ink" style={{ fontSize: 'var(--text-md)' }}>Sign out</span>
          <div style={{ marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--ink-50)' }}>
            <PawkitMark size="md" /> v0.1 · AMS Pune
          </div>
        </div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Per-pet Settings
// ─────────────────────────────────────────────────────────────
function PerPetSettings() {
  return (
    <PawkitFrame>
      <TopBar title="Gabby" />
      <div className="pk-scroll ground">
        {/* Pet header */}
        <div style={{ background: 'var(--canvas)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--rule-soft)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, flexShrink: 0,
            backgroundImage: `url(${PETS.gabby.photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid var(--fur-honey)',
          }} />
          <div>
            <div style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 600, fontSize: 'var(--text-2xl)', lineHeight: 1.05 }}>Gabby</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)', marginTop: 4 }}>Golden Retriever · Male · 4 years</div>
          </div>
        </div>

        <div className="pk-section-label">Photo</div>
        <div className="pk-setrow">
          <div style={{ minWidth: 0 }}>
            <div className="k">Change cover photo</div>
            <div className="sub">Re-runs fur match.</div>
          </div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>

        <div className="pk-section-label">Fur match</div>
        <div className="pk-setrow" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--fur-honey)', border: '1px solid var(--ink)' }} />
            <div>
              <div className="k">Honey</div>
              <div className="sub">Matched from photo · 14 Mar</div>
            </div>
          </div>
          <span className="pk-link" style={{ fontSize: 'var(--text-sm)' }}>Override</span>
        </div>
        <div className="pk-setrow">
          <div className="k">Re-run from current photo</div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>

        <div className="pk-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          From Dr Sagar <Icon id="lock" size={11} style={{ color: 'var(--ink-50)' }} />
        </div>
        <div className="pk-setrow locked"><div className="k">Name</div><div className="v">Gabby</div></div>
        <div className="pk-setrow locked"><div className="k">Breed</div><div className="v">Golden Retriever</div></div>
        <div className="pk-setrow locked"><div className="k">Gender</div><div className="v">Male</div></div>
        <div className="pk-setrow locked"><div className="k">Birthday</div><div className="v">12 Aug 2021</div></div>
        <div style={{ padding: '8px 20px 18px', fontSize: 'var(--text-xs)', color: 'var(--ink-50)', fontStyle: 'italic', lineHeight: 1.5 }}>
          These fields are locked because Dr Sagar has clinical records on file for Gabby.
        </div>

        <div className="pk-section-label">Household &amp; app</div>
        <div className="pk-setrow">
          <div style={{ minWidth: 0 }}>
            <div className="k">Household, language, notifications</div>
            <div className="sub">Settings that apply to every pet.</div>
          </div>
          <Icon id="arrow-right" size={16} style={{ color: 'var(--ink-50)' }} />
        </div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Fur-match override sheet
// ─────────────────────────────────────────────────────────────
const _OVERRIDE_PALETTES = {
  Honey:    { bg: 'var(--fur-honey)',    sub: 'Single tone · most Goldens' },
  Peach:    { bg: 'var(--fur-peach)',    sub: 'Warm orange-cream' },
  Smoke:    { bg: 'var(--fur-smoke)',    sub: 'Cool grey-blue' },
  Vanilla:  { bg: 'var(--fur-vanilla)',  sub: 'Pale cream' },
  Milk:     { bg: 'var(--fur-milk)',     sub: 'Off-white' },
  Rust:     { bg: 'var(--fur-rust)',     sub: 'Deep amber' },
  Mushroom: { bg: 'var(--fur-mushroom)', sub: 'Warm taupe' },
  Steel:    { bg: 'var(--fur-steel)',    sub: 'Cool charcoal' },
  Bark:     { bg: 'var(--fur-bark)',     sub: 'Rich dark brown' },
  Sable:    { bg: 'var(--fur-sable)',    sub: 'Near-black' },
};
function OverrideSheetBase({ selected = 'Honey' }) {
  const tokenNames = ['Milk', 'Vanilla', 'Honey', 'Peach', 'Rust', 'Mushroom', 'Smoke', 'Steel', 'Bark', 'Sable'];
  const tokens = tokenNames.map(n => ({ name: n, bg: _OVERRIDE_PALETTES[n].bg, on: n === selected }));
  const sel = _OVERRIDE_PALETTES[selected];
  return (
    <PawkitFrame>
      <TopBar title="Gabby" />
      <div style={{ opacity: 0.3, pointerEvents: 'none', flex: 1, background: 'var(--rail-tint)' }}>
        <div className="pk-section-label">Fur match</div>
        <div className="pk-setrow" style={{ background: 'var(--canvas)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--fur-honey)', border: '1px solid var(--ink)' }} />
            <div>
              <div className="k">Honey</div>
              <div className="sub">Matched from photo</div>
            </div>
          </div>
          <span className="pk-link">Override</span>
        </div>
      </div>
      <div className="pk-backdrop" />
      <div className="pk-sheet">
        <div className="grab" />
        <div className="head">
          <h2>Pick Gabby's fur palette</h2>
          <div className="sub">Live preview at the top. Saves separately from the algorithm match.</div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 22px 14px',
          borderBottom: '1px dashed var(--rule)', marginBottom: 10,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: sel.bg, border: '2px solid var(--ink)',
            boxShadow: '0 0 0 3px var(--canvas), 0 0 0 4.5px var(--ink), inset 0 1px 0 rgba(255,255,255,0.4)',
            transition: 'background var(--duration-base) var(--ease)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>{selected}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-50)' }}>{sel.sub}</div>
          </div>
          <span className="pk-link ink" style={{ fontSize: 'var(--text-sm)' }}>More options</span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px 8px',
          padding: '6px 20px 16px',
        }}>
          {tokens.map(t => (
            <div key={t.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: t.bg, border: '1.5px solid var(--ink)',
                boxShadow: t.on ? '0 0 0 3px var(--canvas), 0 0 0 4.5px var(--ink)' : 'none',
              }} />
              <div style={{
                fontSize: 'var(--text-xxs)', fontWeight: t.on ? 700 : 500,
                color: t.on ? 'var(--ink)' : 'var(--ink-70)',
              }}>{t.name}</div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--rule-soft)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink-70)' }}>Cancel</span>
          <div style={{ flex: 1 }} />
          <PrimaryBtn>Save {selected}</PrimaryBtn>
        </div>
      </div>
    </PawkitFrame>
  );
}

function OverrideSheet()      { return <OverrideSheetBase selected="Honey" />; }
function OverrideSheetPeach() { return <OverrideSheetBase selected="Peach" />; }
function OverrideSheetSmoke() { return <OverrideSheetBase selected="Smoke" />; }

Object.assign(window, { MasterSettings, PerPetSettings, OverrideSheet, OverrideSheetPeach, OverrideSheetSmoke });
