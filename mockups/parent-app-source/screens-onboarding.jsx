// screens-onboarding.jsx — first-run flow (2 steps, no OTP)

// ─────────────────────────────────────────────────────────────
// Step 1 — Household name (optional)
// ─────────────────────────────────────────────────────────────
function OnbHousehold() {
  return (
    <PawkitFrame>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
        <div style={{ padding: '40px 24px 0' }}>
          <Progress total={2} at={0} />
          <h1 style={{
            fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)', lineHeight: 1.2,
            fontWeight: 600, letterSpacing: '-0.01em',
            margin: '24px 0 8px',
          }}>Welcome to Pawkit</h1>
          <p style={{
            fontSize: 'var(--text-md)', lineHeight: 'var(--lh-md)',
            color: 'var(--ink-70)', margin: 0,
          }}>Let's set up your household. You can change any of this later in Settings.</p>
        </div>

        <div style={{ padding: '36px 24px 0', flex: 1 }}>
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
// Step 2 — First pet (5 fields)
// ─────────────────────────────────────────────────────────────
function OnbFirstPet() {
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

        <div style={{ padding: '20px 24px 0', flex: 1, overflowY: 'auto' }}>
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
            <div className="value">Golden Retriever</div>
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
              <Seg options={['Date', 'Age']} on="Date" />
            </div>
            <div className="value">12 August 2021</div>
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

// ─────────────────────────────────────────────────────────────
// Land on empty Pet Page (after submit)
// ─────────────────────────────────────────────────────────────
function OnbLand() {
  return (
    <PawkitFrame>
      <Cover empty />
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · 4 years</PetSubline>

      <div className="pk-photo-prompt">
        <div className="icon-wrap"><Icon id="camera" size={16} /></div>
        <div className="lead">Add a photo of Gabby</div>
        <div>We'll find his fur palette from it.</div>
      </div>

      <TabStrip tabs={['Timeline', 'Vaccinations', 'Invoices']} active="Timeline" />

      <div className="pk-empty" style={{ flex: 'none', padding: '32px 24px' }}>
        No visits yet.
      </div>

      <div style={{ flex: 1 }} />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

Object.assign(window, { OnbHousehold, OnbFirstPet, OnbLand });
