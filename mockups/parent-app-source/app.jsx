// app.jsx — entry. Mounts a DesignCanvas with all parent-app screens.

const W = 380, H = 780;

function Screen({ children }) {
  // Wrapper so artboard background matches the rail-tint behind the device
  return (
    <div style={{
      width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--rail-tint)',
    }}>
      {children}
    </div>
  );
}

function Placeholder({ label }) {
  return (
    <Screen>
      <div style={{
        width: '90%', textAlign: 'center', color: 'var(--ink-50)',
        fontFamily: 'var(--font-inter)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
      }}>
        {label || 'Screen coming…'}
      </div>
    </Screen>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="onboarding" title="Onboarding" subtitle="Two steps, no OTP. Step 2 form reused as Add-a-pet.">
        <DCArtboard id="onb-1" label="01 · Household name" width={W} height={H}>
          <Screen><OnbHousehold /></Screen>
        </DCArtboard>
        <DCArtboard id="onb-2" label="02 · First pet" width={W} height={H}>
          <Screen><OnbFirstPet /></Screen>
        </DCArtboard>
        <DCArtboard id="onb-3" label="03 · Land on empty Pet Page" width={W} height={H}>
          <Screen><OnbLand /></Screen>
        </DCArtboard>
      </DCSection>

      <DCSection id="pet-hero" title="Pet Page · fur-match ceremony" subtitle="Empty → Sampling → Magic Moment → Transformed beat → Steady.">
        <DCArtboard id="hero-empty" label="01 · Empty" width={W} height={H}>
          {window.PetPageEmpty ? <Screen><PetPageEmpty /></Screen> : <Placeholder label="Empty — coming next" />}
        </DCArtboard>
        <DCArtboard id="hero-sampling" label="02 · Sampling" width={W} height={H}>
          {window.PetPageSampling ? <Screen><PetPageSampling /></Screen> : <Placeholder label="Sampling — coming next" />}
        </DCArtboard>
        <DCArtboard id="hero-magic" label="03 · Magic moment" width={W} height={H}>
          {window.PetPageMagicMoment ? <Screen><PetPageMagicMoment /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="hero-transformed" label="04 · Transformed (beat · 68px)" width={W} height={H}>
          {window.PetPageTransformed ? <Screen><PetPageTransformed /></Screen> : <Placeholder label="Transformed — coming next" />}
        </DCArtboard>
        <DCArtboard id="hero-steady" label="05 · Steady (48px + Timeline)" width={W} height={H}>
          {window.PetPageSteady ? <Screen><PetPageSteady /></Screen> : <Placeholder label="Steady — coming next" />}
        </DCArtboard>
      </DCSection>

      <DCSection id="pet-tabs" title="Pet Page · three tabs" subtitle="Timeline / Vaccinations / Invoices.">
        <DCArtboard id="tab-timeline" label="Timeline" width={W} height={H}>
          {window.PetPageTimeline ? <Screen><PetPageTimeline /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="tab-vaccs" label="Vaccinations" width={W} height={H}>
          {window.PetPageVaccinations ? <Screen><PetPageVaccinations /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="tab-inv" label="Invoices" width={W} height={H}>
          {window.PetPageInvoices ? <Screen><PetPageInvoices /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="pet-banners" title="Pet Page · banner variations" subtitle="Above the tabs. Mutually exclusive.">
        <DCArtboard id="banner-window" label="01 · Open follow-up window" width={W} height={H}>
          {window.PetPageWindowOpen ? <Screen><PetPageWindowOpen /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="banner-reminder" label="02 · Active reminder" width={W} height={H}>
          {window.PetPageReminder ? <Screen><PetPageReminder /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="banner-quiet" label="03 · Quietest state" width={W} height={H}>
          {window.PetPageQuiet ? <Screen><PetPageQuiet /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="switcher" title="Multi-pet switcher" subtitle="Press-and-hold the Pets nav icon.">
        <DCArtboard id="sw-active" label="01 · Press-and-hold active" width={W} height={H}>
          {window.SwitcherActive ? <Screen><SwitcherActive /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="sw-coach" label="02 · First-time coachmark" width={W} height={H}>
          {window.SwitcherCoachmark ? <Screen><SwitcherCoachmark /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="sw-post" label="03 · After swapping to Angel" width={W} height={H}>
          {window.SwitcherPostSwap ? <Screen><SwitcherPostSwap /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="inbox" title="Inbox" subtitle="Per-pet 1:1 threads with Dr Sagar.">
        <DCArtboard id="ibx-list" label="01 · List" width={W} height={H}>
          {window.InboxList ? <Screen><InboxList /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="ibx-open" label="02 · Thread · open window" width={W} height={H}>
          {window.ThreadOpen ? <Screen><ThreadOpen /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="ibx-closed" label="03 · Thread · closed window" width={W} height={H}>
          {window.ThreadClosed ? <Screen><ThreadClosed /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="ibx-empty" label="04 · Empty list" width={W} height={H}>
          {window.InboxEmpty ? <Screen><InboxEmpty /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="broadcasts" title="Broadcasts" subtitle="Clinic-wide one-way feed. Receive end of the Composer.">
        <DCArtboard id="bc-list" label="01 · List" width={W} height={H}>
          {window.BroadcastsList ? <Screen><BroadcastsList /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="bc-long" label="02 · Reading view · full payload" width={W} height={H}>
          {window.BroadcastReadingLong ? <Screen><BroadcastReadingLong /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="bc-short" label="03 · Reading view · short notice" width={W} height={H}>
          {window.BroadcastReadingShort ? <Screen><BroadcastReadingShort /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="sharing" title="Sharing flow" subtitle="The only surface non-Pawkit users see.">
        <DCArtboard id="share-sheet" label="01 · Share sheet" width={W} height={H}>
          {window.ShareSheet ? <Screen><ShareSheet /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="share-web" label="02 · Public web view" width={420} height={H}>
          {window.PublicWebView ? <PublicWebView /> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="teasers" title="Community + Shop · V3+ / V4+ teasers" subtitle="Non-functional in v0.">
        <DCArtboard id="t-community" label="Community teaser" width={W} height={H}>
          {window.CommunityTeaser ? <Screen><CommunityTeaser /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="t-shop" label="Shop teaser" width={W} height={H}>
          {window.ShopTeaser ? <Screen><ShopTeaser /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="settings" title="Settings" subtitle="Reached via the gear on the Pet Page name row.">
        <DCArtboard id="set-pet" label="01 · Per-pet Settings" width={W} height={H}>
          {window.PerPetSettings ? <Screen><PerPetSettings /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="set-master" label="02 · Master Settings" width={W} height={H}>
          {window.MasterSettings ? <Screen><MasterSettings /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="set-override" label="03 · Fur-match override · Honey" width={W} height={H}>
          {window.OverrideSheet ? <Screen><OverrideSheet /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="set-override-peach" label="04 · Override · Peach picked (live preview)" width={W} height={H}>
          {window.OverrideSheetPeach ? <Screen><OverrideSheetPeach /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="set-override-smoke" label="05 · Override · Smoke picked (live preview)" width={W} height={H}>
          {window.OverrideSheetSmoke ? <Screen><OverrideSheetSmoke /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="empties" title="Empty states" subtitle="One italic sentence. Calm absence.">
        <DCArtboard id="e-vaccs" label="Vaccinations · empty" width={W} height={H}>
          {window.EmptyVaccinations ? <Screen><EmptyVaccinations /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="e-inv" label="Invoices · empty" width={W} height={H}>
          {window.EmptyInvoices ? <Screen><EmptyInvoices /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="invoice" title="Invoice detail" subtitle="Per-visit, read-only.">
        <DCArtboard id="inv-detail" label="Invoice · 14 Mar" width={W} height={H}>
          {window.InvoiceDetail ? <Screen><InvoiceDetail /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="memorial" title="Memorial Pet Page" subtitle="Deceased pets stay reachable.">
        <DCArtboard id="mem-switcher" label="01 · Switcher with Raffy" width={W} height={H}>
          {window.MemorialSwitcher ? <Screen><MemorialSwitcher /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="mem-page" label="02 · Memorial Pet Page" width={W} height={H}>
          {window.MemorialPetPage ? <Screen><MemorialPetPage /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>

      <DCSection id="resilience" title="Offline + errors" subtitle="Achromatic: Ink + warning icon.">
        <DCArtboard id="off" label="Offline state" width={W} height={H}>
          {window.OfflineState ? <Screen><OfflineState /></Screen> : <Placeholder />}
        </DCArtboard>
        <DCArtboard id="err" label="Three error anatomies" width={W} height={H}>
          {window.ErrorAnatomies ? <Screen><ErrorAnatomies /></Screen> : <Placeholder />}
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
