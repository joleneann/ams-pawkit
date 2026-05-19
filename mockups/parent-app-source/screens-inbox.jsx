// screens-inbox.jsx — Inbox list + thread states.

// ─────────────────────────────────────────────────────────────
// Inbox list (with Raffy memorial row + Galaxy empty row)
// ─────────────────────────────────────────────────────────────
function InboxList() {
  return (
    <PawkitFrame>
      <PageHead title="Inbox" sub="Threads with Dr Sagar · per pet" />
      <div className="pk-scroll">
        <div className="pk-ibx-row">
          <div className="av honey" style={{ backgroundImage: `url(${PETS.gabby.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="body">
            <div className="pet"><span className="name">Gabby</span><span className="breed">· Golden, 4y</span></div>
            <div className="snip">"Ears look much better today, thanks for the home-care tips."</div>
          </div>
          <div className="meta">
            <span className="when">9:12 am</span>
            <span className="dot" />
          </div>
        </div>
        <div className="pk-ibx-row">
          <div className="av smoke" style={{ backgroundImage: `url(${PETS.angel.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="body">
            <div className="pet"><span className="name">Angel</span><span className="breed">· Persian, 8y</span></div>
            <div className="snip">Reminder: dental recheck on 22 Apr. Walk-in 9am–9pm.</div>
          </div>
          <div className="meta">
            <span className="when">Yest.</span>
          </div>
        </div>
        <div className="pk-ibx-row">
          <div className="av peach" style={{ backgroundImage: `url(${PETS.galaxy.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
          <div className="body">
            <div className="pet"><span className="name">Galaxy</span><span className="breed">· Indie, 11y</span></div>
            <div className="snip empty">No conversations yet.</div>
          </div>
          <div className="meta">
            <span className="when" />
          </div>
        </div>
        <div className="pk-ibx-row memorial">
          <div className="av sable" style={{ position: 'relative', backgroundImage: `url(${PETS.raffy.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(0.55) brightness(0.85)', color: 'transparent' }}>
            <span style={{ visibility: 'hidden' }}>R</span>
            <div style={{
              position: 'absolute',
              top: -3, right: -4,
              width: 18, height: 14, borderRadius: 999,
              background: 'var(--canvas)', border: '1.5px solid var(--ink)',
              display: 'grid', placeItems: 'center', color: 'var(--ink)',
            }}><Icon id="wings" size={11} /></div>
          </div>
          <div className="body">
            <div className="pet"><span className="name">Raffy</span><span className="breed">· Indie · 2009 to 2024</span></div>
            <div className="snip">"He had a beautiful, calm last day. Thank you for everything."</div>
          </div>
          <div className="meta">
            <span className="when">Aug '24</span>
          </div>
        </div>
      </div>
      <BottomNav active="inbox" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Inbox · empty list (single pet, no conversation history)
// ─────────────────────────────────────────────────────────────
function InboxEmpty() {
  return (
    <PawkitFrame>
      <PageHead title="Inbox" sub="Threads with Dr Sagar · per pet" />
      <div className="pk-ibx-row">
        <div className="av honey" style={{ backgroundImage: `url(${PETS.gabby.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }} />
        <div className="body">
          <div className="pet"><span className="name">Gabby</span><span className="breed">· Golden, 4y</span></div>
          <div className="snip empty">No conversations yet.</div>
        </div>
      </div>
      <div className="pk-empty">No messages from Dr Sagar yet.</div>
      <BottomNav active="inbox" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Thread · open follow-up window
// ─────────────────────────────────────────────────────────────
function ThreadOpen() {
  return (
    <PawkitFrame>
      <TopBar
        title="Gabby"
        subtitle="with Dr Sagar · until 28 Mar"
        right={<Pill tone="berry"><span className="dot" /> Open</Pill>}
      />
      <div className="pk-thread">
        <div className="pk-expect-chip">Dr Sagar typically replies within 24 hours.</div>
        <Bubble from="them" time="from you · Mon 8:42 pm">
          Hi Sagar, we cleaned Gabby's ear yesterday and applied the drops. He's not shaking his head anymore.
        </Bubble>
        <MediaBubble from="them" kind="photo" time="Mon 8:43 pm" caption="ear close-up" />
        <Bubble from="me" time="Tue 9:01 am">
          Great, sounds like it's settling. Keep the routine for 7 days, then we'll recheck. Send me a photo if it flares up before then.
        </Bubble>
        <MediaBubble from="them" kind="video" time="Tue 9:08 am" caption="short clip" />
        <Bubble from="them" time="Tue 9:12 am">Will do, thanks 🙏</Bubble>
      </div>
      <Composer />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Thread · closed window (Angel)
// ─────────────────────────────────────────────────────────────
function ThreadClosed() {
  return (
    <PawkitFrame>
      <TopBar
        title="Angel"
        subtitle="with Dr Sagar · window closed"
        right={<Pill tone="dim">Closed</Pill>}
      />
      <div className="pk-thread">
        <SysBubble>
          <Icon id="syringe" size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
          Angel's DHPPi+L4 booster due 12 May.<br />Walk in 9am–9pm Mon–Sat.
        </SysBubble>
        <Bubble from="them" time="8 Apr 4:18 pm">
          Photo of gums attached. They look a bit red after the dental?
        </Bubble>
        <MediaBubble from="them" kind="photo" time="8 Apr 4:18 pm" />
        <Bubble from="me" time="8 Apr 5:02 pm">
          A little redness right after dental is normal for 48–72 hrs. If it's still red on Friday, send another photo and we'll take a look.
        </Bubble>
        <Bubble from="them" time="8 Apr 5:14 pm">Okay, thanks. Will check Friday.</Bubble>
      </div>
      <ClosedCard>
        <b>AMS is walk-in only.</b> Visit 9am to 9pm Mon–Sat.<br />
        For urgent issues, call <b>+91 98••• ••456</b>.
      </ClosedCard>
    </PawkitFrame>
  );
}

Object.assign(window, { InboxList, ThreadOpen, ThreadClosed, InboxEmpty });
