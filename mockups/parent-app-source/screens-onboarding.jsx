// screens-onboarding.jsx — first-run flow (2 steps, no OTP)

// ─────────────────────────────────────────────────────────────
// Step 1 — Household name (optional)
// ─────────────────────────────────────────────────────────────
function OnbHousehold() {
  return (
    <PawkitFrame>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
        <div style={{ padding: '24px 24px 0' }}>
          <Progress total={2} at={0} />
          <h1 style={{
            fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)', lineHeight: 1.2,
            fontWeight: 600, letterSpacing: '-0.01em',
            margin: '20px 0 6px',
          }}>Welcome to Pawkit</h1>
          <p style={{
            fontSize: 'var(--text-md)', lineHeight: 'var(--lh-md)',
            color: 'var(--ink-70)', margin: 0,
          }}>Let's set up your household. You can change any of this later in Settings.</p>
        </div>

        <div style={{ padding: '32px 24px 0', flex: 1 }}>
          <div className="pk-field" style={{ borderBottom: 'none', padding: 0 }}>
            <div className="label">Household name</div>
            <div className="value placeholder">e.g. The Fernandes family</div>
            <div className="help">Optional · defaults to "Your household"</div>
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', gap: 10, background: 'var(--canvas)' }}>
          <OutlineBtn>Skip</OutlineBtn>
          <PrimaryBtn full trailing={<Icon id="arrow-right" size={16} />}>Continue</PrimaryBtn>
        </div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini-calendar — used inline under Birthday/Date
// August 2021, Aug 1 is a Sunday, day 12 highlighted.
// ─────────────────────────────────────────────────────────────
function MiniCalendar({ year = 2021, monthLabel = 'August 2021', selected = 12, firstDow = 0, daysInMonth = 31 }) {
  const dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 2px 10px',
      }}>
        <span style={{
          fontFamily: 'var(--font-inter)', fontSize: 'var(--text-sm)',
          fontWeight: 600, color: 'var(--ink)',
        }}>{monthLabel}</span>
        <span style={{ display: 'inline-flex', gap: 6, color: 'var(--ink-50)' }}>
          <span style={{
            width: 22, height: 22, display: 'grid', placeItems: 'center',
            borderRadius: 6,
          }}>‹</span>
          <span style={{
            width: 22, height: 22, display: 'grid', placeItems: 'center',
            borderRadius: 6,
          }}>›</span>
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2, fontFamily: 'var(--font-inter)',
        fontSize: 'var(--text-xxs)', letterSpacing: '0.06em',
        color: 'var(--ink-50)', textTransform: 'uppercase',
        textAlign: 'center', padding: '0 0 6px',
      }}>
        {dow.map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
      }}>
        {cells.map((d, i) => {
          if (d == null) return <div key={i} style={{ height: 30 }} />;
          const on = d === selected;
          return (
            <div key={i} style={{
              height: 30, display: 'grid', placeItems: 'center',
              fontSize: 'var(--text-sm)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: on ? 600 : 400,
              color: on ? 'var(--canvas)' : 'var(--ink)',
              background: on ? 'var(--ink)' : 'transparent',
              borderRadius: 999,
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Age picker — Years / Months side-by-side wheels
// ─────────────────────────────────────────────────────────────
function AgePicker({ years = 4, months = 2 }) {
  const Wheel = ({ label, value, max }) => {
    const items = [];
    for (let v = Math.max(0, value - 2); v <= Math.min(max, value + 2); v++) items.push(v);
    return (
      <div style={{
        flex: 1,
        background: 'var(--canvas-2)',
        border: '1px solid var(--rule)',
        borderRadius: 12,
        padding: '10px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-inter)',
          fontSize: 'var(--text-xxs)',
          letterSpacing: 'var(--tracking-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--ink-50)',
          fontWeight: 600,
          marginBottom: 4,
        }}>{label}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {items.map(v => {
            const on = v === value;
            return (
              <div key={v} style={{
                fontFamily: 'var(--font-inter)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: on ? 'var(--text-lg)' : 'var(--text-sm)',
                fontWeight: on ? 600 : 400,
                color: on ? 'var(--ink)' : 'var(--ink-30)',
                lineHeight: 1.2,
              }}>{v}</div>
            );
          })}
        </div>
        {/* selection band */}
        <div style={{
          position: 'absolute', left: 6, right: 6,
          top: '50%', transform: 'translateY(-50%)',
          height: 30,
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
          pointerEvents: 'none',
        }} />
      </div>
    );
  };

  return (
    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
      <Wheel label="Years" value={years} max={30} />
      <Wheel label="Months" value={months} max={11} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 2 — First pet (5 fields)
// `birthMode` = 'date' (calendar) | 'age' (years/months wheel)
// ─────────────────────────────────────────────────────────────
function OnbFirstPet({ birthMode = 'date' }) {
  return (
    <PawkitFrame>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
        <div style={{ padding: '24px 24px 0' }}>
          <Progress total={2} at={1} />
          <h1 style={{
            fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)', lineHeight: 1.2,
            fontWeight: 600, letterSpacing: '-0.01em',
            margin: '20px 0 6px',
          }}>Tell us about your pet</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)', margin: 0 }}>
            All five are required. Add a photo later.
          </p>
        </div>

        <div style={{ padding: '16px 24px 0', flex: 1, overflowY: 'auto' }}>
          <div className="pk-field">
            <div className="label">Name</div>
            <div className="value">Gabby</div>
          </div>
          <div className="pk-field">
            <div className="label">Species</div>
            <div style={{ marginTop: 6 }}>
              <Seg options={['Dog', 'Cat']} on="Dog" />
            </div>
          </div>
          <div className="pk-field">
            <div className="label">Breed</div>
            <div className="value" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <span>Golden Retriever</span>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--ink-50)', flexShrink: 0 }}>
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>
          <div className="pk-field">
            <div className="label">Gender</div>
            <div style={{ marginTop: 6 }}>
              <Seg options={['Female', 'Male']} on="Male" />
            </div>
          </div>
          <div className="pk-field" style={{ borderBottom: 'none' }}>
            <div className="label" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
            }}>
              <span>Birthday</span>
              <Seg options={['Date', 'Age']} on={birthMode === 'age' ? 'Age' : 'Date'} />
            </div>
            {birthMode === 'age'
              ? <AgePicker years={4} months={2} />
              : <MiniCalendar />}
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', gap: 10, background: 'var(--canvas)' }}>
          <OutlineBtn>Back</OutlineBtn>
          <PrimaryBtn full trailing={<Icon id="arrow-right" size={16} />}>Create pet page</PrimaryBtn>
        </div>
      </div>
    </PawkitFrame>
  );
}

function OnbFirstPetAge() { return <OnbFirstPet birthMode="age" />; }

// ─────────────────────────────────────────────────────────────
// Land on empty Pet Page (after submit)
// ─────────────────────────────────────────────────────────────
function OnbLand() {
  return (
    <PawkitFrame>
      <Cover empty />
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · Male · 4 years</PetSubline>

      <div className="pk-photo-prompt">
        <div className="icon-wrap"><Icon id="camera" size={16} /></div>
        <div className="lead">Add a photo of Gabby</div>
        <div>We'll find his fur palette from it.</div>
      </div>

      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />

      <div className="pk-empty" style={{ flex: 'none', padding: '32px 24px' }}>
        No visits yet.
      </div>

      <div style={{ flex: 1 }} />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

Object.assign(window, { OnbHousehold, OnbFirstPet, OnbFirstPetAge, OnbLand });
