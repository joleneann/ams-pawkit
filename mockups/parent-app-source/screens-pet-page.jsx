// screens-pet-page.jsx — Pet Page (the brand hero) in all its states.

// ─────────────────────────────────────────────────────────────
// Common reusable: Timeline content fragments
// ─────────────────────────────────────────────────────────────
function TimelineFull() {
  return (
    <div className="pk-scroll">
      <TimelineCard
        icon="bandage" accent="berry"
        title="Annual check-up, all clear"
        det="Weight 28.4 kg · slight ear redness L · advised weekly drying"
        when="14 Mar"
      />
      <TimelineCard
        icon="syringe" accent="berry"
        title="Rabies booster · administered"
        det="Lot 4A28-B · next due 14 Mar 2027"
        when="14 Mar"
      />
      <TimelineCard
        icon="clock"
        title="DHPPi+L4 booster due"
        det="Walk-in 9am–9pm Mon–Sat at AMS Pune."
        when="12 May"
      />
      <TimelineCard
        icon="bandage"
        title="Ear-cleaning recheck"
        det="L ear clear · right ear slight wax · home care continued"
        when="21 Feb"
      />
      <TimelineCard
        icon="bandage"
        title="Initial intake"
        det="Healthy 4y Golden · vaccinations on file"
        when="12 Jan"
      />
    </div>
  );
}

function TimelineShort() {
  return (
    <div className="pk-scroll">
      <TimelineCard
        icon="bandage" accent="berry"
        title="Annual check-up, all clear"
        det="Weight 28.4 kg · slight ear redness L"
        when="14 Mar"
      />
      <TimelineCard
        icon="syringe" accent="berry"
        title="Rabies booster · administered"
        det="Lot 4A28-B · next due 14 Mar 2027"
        when="14 Mar"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// State 1 · Empty (post-onboarding, before photo upload)
// ─────────────────────────────────────────────────────────────
function PetPageEmpty() {
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
      <div className="pk-empty" style={{ flex: 'none', padding: '32px 24px' }}>No visits yet.</div>
      <div style={{ flex: 1 }} />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// State 2 · Sampling — Sable wash + Berry scan + fur tokens reading
// ─────────────────────────────────────────────────────────────
function PetPageSampling() {
  return (
    <PawkitFrame>
      <Cover tone="honey" photo={PETS.gabby.photo} sampling />
      <div style={{
        padding: '14px 20px 16px',
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--rule)',
      }}>
        <div className="pk-eyebrow" style={{ color: 'var(--berry-deep)', marginBottom: 10 }}>Reading fur palette…</div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <FurDot bg="var(--fur-milk)" dim />
          <FurDot bg="var(--fur-vanilla)" matched />
          <FurDot bg="var(--fur-honey)" matched />
          <FurDot bg="var(--fur-peach)" matched />
          <FurDot bg="var(--fur-rust)" matched />
          <FurDot bg="var(--fur-mushroom)" dim />
          <FurDot bg="var(--fur-smoke)" dim />
          <FurDot bg="var(--fur-steel)" dim />
          <FurDot bg="var(--fur-bark)" dim />
          <FurDot bg="var(--fur-sable)" dim />
        </div>
      </div>
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div style={{ flex: 1 }} />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

function FurDot({ bg, dim = false, matched = false }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', background: bg,
      border: '1px solid var(--ink)', opacity: dim ? 0.28 : 1,
      boxShadow: matched ? '0 0 0 2px var(--canvas), 0 0 0 3px var(--berry)' : 'none',
      transition: 'opacity 200ms var(--ease)',
      flexShrink: 0,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// State 3a · Magic Moment — takeover ceremony panel
// ─────────────────────────────────────────────────────────────
function PetPageMagicMoment() {
  return (
    <PawkitFrame>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Cover faded slightly so the panel reads as the focal centerpiece. */}
        <div style={{ opacity: 0.85 }}>
          <Cover hero tone="honey" photo={PETS.gabby.photo} />
        </div>
        <div className="pk-magic-toast">
          <div className="photo" style={{ backgroundImage: `url(${PETS.gabby.photo})` }} />
          <div className="swatch" style={{ background: 'var(--fur-honey)' }} />
          <div className="copy">
            <div className="lead"><b>Gabby</b> is a honey dog!</div>
            <div className="sub">
              Don't agree?<br />
              <a href="#" className="link">Change his colour palette</a>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--canvas)' }} />
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// State 3 · Transformed (beat) — magic toast just dismissed, name
// lands at 68px Lora italic before settling to Steady's 48px.
// ─────────────────────────────────────────────────────────────
function PetPageTransformed() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero beat name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div style={{ flex: 1, background: 'var(--canvas)' }} />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// State 4 · Steady — looks like Transformed but no toast
// ─────────────────────────────────────────────────────────────
function PetPageSteady() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineFull />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Pet Page · Timeline tab (matches Steady)
// ─────────────────────────────────────────────────────────────
function PetPageTimeline() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineFull />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Pet Page · Vaccinations tab
// ─────────────────────────────────────────────────────────────
function PetPageVaccinations() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vaccinations" />
      <div className="pk-scroll">
        <div className="pk-section-label">Upcoming</div>
        <div className="pk-vacc-row">
          <div>
            <div className="name">DHPPi+L4 booster</div>
            <div className="det">Due 12 May · in 3 weeks</div>
          </div>
          <span className="pill due">Due soon</span>
        </div>
        <div className="pk-vacc-row">
          <div>
            <div className="name">Anti-rabies</div>
            <div className="det">Due 14 Mar 2027</div>
          </div>
          <span className="pill" style={{ background: 'var(--canvas-2)', color: 'var(--ink-50)' }}>On schedule</span>
        </div>

        <div className="pk-section-label" style={{ paddingTop: 24 }}>Past</div>
        <div className="pk-vacc-row">
          <div>
            <div className="name">Anti-rabies</div>
            <div className="det">Given 14 Mar · Dr Sagar</div>
          </div>
          <span className="pill done"><Icon id="check" size={12} /> Done</span>
        </div>
        <div className="pk-vacc-row">
          <div>
            <div className="name">DHPPi+L4</div>
            <div className="det">Given 12 May 2025</div>
          </div>
          <span className="pill done"><Icon id="check" size={12} /> Done</span>
        </div>
        <div className="pk-vacc-row">
          <div>
            <div className="name">Lepto vaccine</div>
            <div className="det">Given 12 May 2025</div>
          </div>
          <span className="pill done"><Icon id="check" size={12} /> Done</span>
        </div>
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Pet Page · Invoices tab
// ─────────────────────────────────────────────────────────────
function PetPageInvoices() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Invoices" />
      <div className="pk-scroll">
        <div className="pk-inv-row">
          <div>
            <div className="when">14 Mar 2026 <span className="pill-paid">Paid</span></div>
            <div className="desc">Annual check-up + Rabies booster</div>
          </div>
          <div className="amt">₹2,400</div>
        </div>
        <div className="pk-inv-row">
          <div>
            <div className="when">21 Feb 2026 <span className="pill-paid">Paid</span></div>
            <div className="desc">Ear-cleaning recheck</div>
          </div>
          <div className="amt">₹450</div>
        </div>
        <div className="pk-inv-row">
          <div>
            <div className="when">12 May 2025 <span className="pill-paid">Paid</span></div>
            <div className="desc">DHPPi+L4 booster + consult</div>
          </div>
          <div className="amt">₹1,800</div>
        </div>
        <div className="pk-inv-row">
          <div>
            <div className="when">8 Jan 2025 <span className="pill-paid">Paid</span></div>
            <div className="desc">Skin scrape · cytology · medication</div>
          </div>
          <div className="amt">₹3,250</div>
        </div>
        <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-50)', fontStyle: 'italic' }}>
          End of records.
        </div>
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Banner 1 · Open follow-up window
// ─────────────────────────────────────────────────────────────
function PetPageWindowOpen() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <BerryBanner petName="Gabby" until="28 Mar" />
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineShort />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Banner 2 · Warm reminder
// ─────────────────────────────────────────────────────────────
function PetPageReminder() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <WarmBanner
        headIcon="clock"
        head="DHPPi+L4 booster due 12 May"
        det="Walk-in 9am–9pm Mon–Sat at AMS Pune."
        cta="See schedule"
      />
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineShort />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Banner 3 · Quietest state (no banner)
// ─────────────────────────────────────────────────────────────
function PetPageQuiet() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineFull />
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Switcher · press-and-hold active
// ─────────────────────────────────────────────────────────────
function SwitcherActive() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div style={{ opacity: 0.4 }}>
        <TimelineShort />
      </div>
      <div className="pk-backdrop" />
      <div className="pk-switcher">
        <span className="label-tiny">Switch to</span>
        <SwitcherAv tone="honey" letter="G" photo={PETS.gabby.photo} on />
        <SwitcherAv tone="smoke" letter="A" photo={PETS.angel.photo} />
        <SwitcherAv tone="peach" letter="Gx" photo={PETS.galaxy.photo} />
        <SwitcherAv tone="add" letter="+" />
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

function SwitcherAv({ tone = "honey", letter, photo, on = false, wings = false, label }) {
  return (
    <div className={`pk-switcher-av ${tone}${on ? ' on' : ''}${wings ? ' memorial' : ''}`}>
      <div className="av" style={photo ? {
        backgroundImage: `url(${photo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'transparent',
        filter: wings ? 'grayscale(1) contrast(0.95)' : undefined,
      } : undefined}>
        {!photo && letter}
        {wings && <div className="wings-badge"><Icon id="wings" size={11} /></div>}
      </div>
      {label && <div className="nm">{label}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Switcher · first-time coachmark
// ─────────────────────────────────────────────────────────────
function SwitcherCoachmark() {
  return (
    <PawkitFrame>
      <Cover hero tone="honey" photo={PETS.gabby.photo} />
      <PetNameRow hero name="Gabby" />
      <PetSubline hero>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <TimelineShort />
      <div className="pk-coachmark">Press and hold to switch pets</div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Switcher · post-swap (Angel)
// ─────────────────────────────────────────────────────────────
function SwitcherPostSwap() {
  return (
    <PawkitFrame>
      <Cover hero tone="smoke" photo={PETS.angel.photo} />
      <PetNameRow hero name="Angel" />
      <PetSubline hero>Persian · Female · 8 years</PetSubline>
      <BerryBanner petName="Angel" until="22 Apr" />
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div className="pk-scroll">
        <TimelineCard
          icon="bandage" accent="berry"
          title="Dental cleaning, uneventful"
          det="No extractions · scale & polish only"
          when="8 Apr"
        />
        <TimelineCard
          icon="clock"
          title="Follow-up check-in"
          det="Message Dr Sagar if gums look red."
          when="12 Apr"
        />
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Memorial Switcher (with Raffy)
// ─────────────────────────────────────────────────────────────
function MemorialSwitcher() {
  return (
    <PawkitFrame>
      <Cover tone="honey" height={140} photo={PETS.gabby.photo} />
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div style={{ opacity: 0.4 }}>
        <TimelineShort />
      </div>
      <div className="pk-backdrop" />
      <div className="pk-switcher">
        <span className="label-tiny">Switch to</span>
        <SwitcherAv tone="honey" letter="G" photo={PETS.gabby.photo} on />
        <SwitcherAv tone="smoke" letter="A" photo={PETS.angel.photo} />
        <SwitcherAv tone="peach" letter="Gx" photo={PETS.galaxy.photo} />
        <SwitcherAv tone="sable" letter="R" photo={PETS.raffy.photo} wings label="Raffy" />
        <SwitcherAv tone="add" letter="+" />
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Memorial Pet Page
// ─────────────────────────────────────────────────────────────
function MemorialPetPage() {
  return (
    <PawkitFrame>
      <Cover hero tone="sable" photo={PETS.raffy.photo} memorial />
      <div className="pk-petname-row hero">
        <div className="name" style={{ color: 'var(--ink)' }}>Raffy</div>
        {/* no gear for memorial */}
      </div>
      <div className="pk-petsub" style={{ fontStyle: 'italic', padding: '8px 22px 22px' }}>
        Indie · 2009 to 2024. A very good dog.
      </div>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vet Visits" />
      <div className="pk-scroll" style={{ opacity: 0.85 }}>
        <TimelineCard
          icon="bandage"
          title="Final visit · hospice care"
          det="Pain management · home-comfort plan"
          when="21 Aug '24"
        />
        <TimelineCard
          icon="bandage"
          title="Senior wellness check"
          det="Kidney values stable · advised low-protein diet"
          when="14 Jun '24"
        />
        <TimelineCard
          icon="syringe"
          title="Rabies booster"
          det="Final booster · annual recall paused"
          when="12 Mar '24"
        />
        <TimelineCard
          icon="bandage"
          title="Initial intake"
          det="3y rescue · indie · healthy"
          when="5 Apr '12"
        />
        <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-50)', fontStyle: 'italic' }}>
          12 years of records.
        </div>
      </div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

Object.assign(window, {
  PetPageEmpty, PetPageSampling, PetPageMagicMoment, PetPageTransformed, PetPageSteady,
  PetPageTimeline, PetPageVaccinations, PetPageInvoices,
  PetPageWindowOpen, PetPageReminder, PetPageQuiet,
  SwitcherActive, SwitcherCoachmark, SwitcherPostSwap,
  MemorialPetPage, MemorialSwitcher,
});
