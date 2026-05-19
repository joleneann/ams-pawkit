// screens-misc.jsx — teasers, invoice, empty states, offline, errors.

// ─────────────────────────────────────────────────────────────
// Community teaser (V3+)
// ─────────────────────────────────────────────────────────────
function CommunityTeaser() {
  return (
    <PawkitFrame>
      <PageHead title="Community" sub="Coming with Pawkit Plus" />
      <div className="pk-scroll" style={{ padding: '18px 20px' }}>
        <div style={{
          background: 'var(--berry)', color: '#fff',
          borderRadius: 16, padding: '24px 22px',
          marginBottom: 22,
        }}>
          <div style={{
            fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)',
            fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em',
            marginBottom: 8,
          }}>A social layer for pet parents.</div>
          <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'rgba(255,255,255,0.82)' }}>
            City circles, breed groups, monthly vet AMAs, lost-and-found, verified clinic reviews.
          </div>
        </div>

        <div className="pk-eyebrow" style={{ marginBottom: 12 }}>What's coming</div>
        <CommItem icon="pin" title="Pune pet-parent circles" det="Trade walk routes, recommend groomers, swap monsoon advice." />
        <CommItem icon="paw" title="Breed groups · Golden Retrievers" det="Indian-climate-aware threads on diet, summer care, hip dysplasia." />
        <CommItem icon="chat" title="Monthly vet AMAs" det="Live Q&A with rotating Pawkit clinics." />
        <CommItem icon="bell" title="Lost & found · geo-pinged" det="Alerts within 3 km when a Pawkit pet goes missing nearby." />

        <div style={{ marginTop: 20, textAlign: 'center', fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--ink-50)' }}>
          Notify me when Community opens.
        </div>
      </div>
      <BottomNav active="community" />
    </PawkitFrame>
  );
}
function CommItem({ icon, title, det }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--rule-soft)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--canvas-2)',
        display: 'grid', placeItems: 'center', color: 'var(--ink)',
      }}>
        <Icon id={icon} size={16} />
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)', marginTop: 2, lineHeight: 1.4 }}>{det}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shop teaser (V4+)
// ─────────────────────────────────────────────────────────────
function ShopTeaser() {
  return (
    <PawkitFrame>
      <PageHead title="Shop" sub="Clinically-curated. Vet-approved." />
      <div className="pk-scroll" style={{ padding: '18px 20px' }}>
        <div style={{
          background: 'var(--canvas-2)', border: '1px solid var(--ink)',
          borderRadius: 16, padding: '22px 20px', marginBottom: 22,
        }}>
          <div style={{
            fontFamily: 'var(--font-inter)', fontSize: 'var(--text-2xl)',
            fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: 'var(--ink)',
            marginBottom: 8,
          }}>Only what your vet would prescribe.</div>
          <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'var(--ink-70)' }}>
            Therapeutic diets, prescription refills, supplements with clinical evidence, pet insurance.
          </div>
        </div>

        <div className="pk-eyebrow" style={{ marginBottom: 10 }}>Coming categories</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ShopTile title="Therapeutic diets" det="Renal, hepatic, weight." />
          <ShopTile title="Prescription refills" det="Tied to your vet's script." />
          <ShopTile title="Vet-approved hygiene" det="Shampoos, ear cleaners." />
          <ShopTile title="Supplements" det="Clinical evidence only." />
        </div>
        <div style={{ marginTop: 10 }}>
          <ShopTile wide title="Pet health insurance" det="Underwritten with partner insurers; vet-validated claims." />
        </div>

        <div style={{
          marginTop: 18, padding: '12px 14px',
          borderLeft: '3px solid var(--ink)',
          background: 'var(--canvas-2)',
          fontSize: 'var(--text-sm)', lineHeight: 1.5, color: 'var(--ink-70)',
        }}>
          <b style={{ color: 'var(--ink)' }}>Not what we sell:</b> kibble, toys, fashion, generic accessories. There's a hundred apps for that already.
        </div>
      </div>
      <BottomNav active="shop" />
    </PawkitFrame>
  );
}
function ShopTile({ title, det, wide }) {
  return (
    <div style={{
      border: '1px solid var(--rule)', borderRadius: 12, padding: '12px 14px',
      background: 'var(--canvas)', gridColumn: wide ? '1 / -1' : 'auto',
    }}>
      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-70)', marginTop: 2 }}>{det}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Invoice detail
// ─────────────────────────────────────────────────────────────
function InvoiceDetail() {
  return (
    <PawkitFrame>
      <TopBar title="Invoice · 14 Mar" right={<Pill>Paid</Pill>} />
      <div className="pk-scroll">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule-soft)' }}>
          <div className="pk-eyebrow" style={{ marginBottom: 6 }}>For</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundImage: `url(${PETS.gabby.photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '2.5px solid var(--fur-honey)',
            }} />
            <div style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic', fontWeight: 600, fontSize: 'var(--text-xl)' }}>Gabby</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)' }}>· Golden, 4y</div>
          </div>
        </div>

        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--rule-soft)',
          fontSize: 'var(--text-sm)', display: 'grid', gridTemplateColumns: 'auto 1fr',
          gap: '6px 14px', color: 'var(--ink-70)',
        }}>
          <span>Visit</span><span style={{ color: 'var(--ink)' }}>14 Mar 2026, 11:20 am</span>
          <span>Attended by</span><span style={{ color: 'var(--ink)' }}>Dr Sagar Bhongale</span>
          <span>Reason</span><span style={{ color: 'var(--ink)' }}>Annual check-up</span>
        </div>

        <div className="pk-section-label">Line items</div>
        <InvLine title="Consultation" det="30 min · annual check" amt="₹800" />
        <InvLine title="Rabies vaccine" det="Lot 4A28-B" amt="₹1,200" />
        <InvLine title="Ear examination" det="L ear redness · ointment prescribed" amt="₹400" />

        <div style={{
          margin: '14px 20px 0', padding: '16px 18px',
          background: 'var(--canvas-2)', borderRadius: 14,
          border: '1px solid var(--rule)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingBottom: 8, borderBottom: '1px dashed var(--rule)',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)' }}>Subtotal</span>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>₹2,400</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            paddingTop: 10,
          }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>₹2,400</span>
          </div>
          <div style={{
            marginTop: 12, padding: '10px 12px',
            background: 'var(--berry-soft)', border: '1px solid var(--berry)',
            borderRadius: 10, color: 'var(--berry-deep)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon id="check" size={14} />
            <span style={{ fontWeight: 600 }}>Paid</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-70)' }}>14 Mar · cash at clinic</span>
          </div>
        </div>

        <div style={{ padding: '14px 20px 20px', display: 'flex', gap: 10 }}>
          <OutlineBtn full leading={<Icon id="download" size={14} />}>Download PDF</OutlineBtn>
          <OutlineBtn full leading={<Icon id="envelope" size={14} />}>Email copy</OutlineBtn>
        </div>
      </div>
    </PawkitFrame>
  );
}
function InvLine({ title, det, amt }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto',
      padding: '14px 20px', borderBottom: '1px solid var(--rule-soft)',
      alignItems: 'center', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-50)', marginTop: 2 }}>{det}</div>
      </div>
      <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{amt}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty: Vaccinations
// ─────────────────────────────────────────────────────────────
function EmptyVaccinations() {
  return (
    <PawkitFrame>
      <Cover tone="honey" height={140} />
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Vaccinations" />
      <div className="pk-empty">No vaccinations on file yet.</div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty: Invoices
// ─────────────────────────────────────────────────────────────
function EmptyInvoices() {
  return (
    <PawkitFrame>
      <Cover tone="honey" height={140} />
      <PetNameRow name="Gabby" />
      <PetSubline>Golden Retriever · Male · 4 years</PetSubline>
      <TabStrip tabs={['Vet Visits', 'Vaccinations', 'Invoices']} active="Invoices" />
      <div className="pk-empty">No invoices yet.</div>
      <BottomNav active="pets" />
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Offline state — banner + pending bubbles
// ─────────────────────────────────────────────────────────────
function OfflineState() {
  return (
    <PawkitFrame>
      <div className="pk-offline-banner">
        <Icon id="wifi-slash" size={16} />
        You're offline. Messages will send when you're back.
      </div>
      <TopBar
        title="Gabby"
        subtitle="with Dr Sagar · until 28 Mar"
        right={<Pill tone="berry"><span className="dot" /> Open</Pill>}
      />
      <div className="pk-thread">
        <Bubble from="them" time="Mon 8:42 pm">Hi Sagar, we cleaned Gabby's ear yesterday.</Bubble>
        <Bubble from="me" time="Tue 9:01 am">Great, sounds like it's settling. Keep the routine for 7 days.</Bubble>
        <div className="pk-bub them" style={{ opacity: 0.55 }}>
          Will do, thanks 🙏
          <span className="time" style={{ color: 'var(--ink)' }}>Will send when online · just now</span>
        </div>
        <div className="pk-bub media them" style={{ opacity: 0.55, maxWidth: '64%' }}>
          <div className="media-tile" style={{ background: 'linear-gradient(135deg, var(--fur-vanilla), var(--fur-honey))' }} />
          <div style={{ padding: '4px 8px 0', fontSize: 'var(--text-xxs)', color: 'var(--ink)' }}>
            Will send when online · just now
          </div>
        </div>
      </div>
      <div className="pk-composer">
        <div className="icon-btn"><Icon id="plus" size={18} /></div>
        <div className="input">Reply to Dr Sagar…</div>
        <div className="icon-btn send" style={{ opacity: 0.4 }}><Icon id="paper-plane" size={16} /></div>
      </div>
    </PawkitFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Error anatomies (3 in one phone)
// ─────────────────────────────────────────────────────────────
function ErrorAnatomies() {
  return (
    <PawkitFrame>
      <TopBar title="Error anatomies" />
      <div className="pk-scroll" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Inline form error */}
        <div>
          <div className="pk-eyebrow" style={{ marginBottom: 10 }}>① Inline form error</div>
          <div style={{ border: '1px solid var(--rule)', borderRadius: 12, padding: 14, background: 'var(--canvas)' }}>
            <div style={{ fontSize: 'var(--text-xxs)', fontWeight: 600, letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 6 }}>Phone number</div>
            <div style={{
              fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--ink)',
              borderBottom: '1.5px solid var(--ink)', paddingBottom: 5, fontVariantNumeric: 'tabular-nums',
            }}>98 4567</div>
            <div style={{
              fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--ink)',
              marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon id="warning" size={14} /> Looks short. Indian numbers are 10 digits.
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', color: 'var(--ink-50)', marginTop: 8 }}>
            For field-level validation. Single sentence, never blocks the page.
          </div>
        </div>

        {/* Banner error */}
        <div>
          <div className="pk-eyebrow" style={{ marginBottom: 10 }}>② Banner error</div>
          <div className="pk-error banner" style={{ borderLeftWidth: 4 }}>
            <Icon id="warning" size={18} />
            <div>
              <div className="ttl">Couldn't load Gabby's records</div>
              <div className="det">The clinic's records server isn't responding. Cached records below may be stale.</div>
              <span className="retry">Try again</span>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', color: 'var(--ink-50)', marginTop: 8 }}>
            For page-level errors that block content. Title + body + retry.
          </div>
        </div>

        {/* Toast */}
        <div>
          <div className="pk-eyebrow" style={{ marginBottom: 10 }}>③ Toast error</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="pk-error toast">
              <Icon id="warning" size={14} />
              Couldn't send. Will retry in a moment.
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', color: 'var(--ink-50)', marginTop: 8, textAlign: 'center' }}>
            Transient. Auto-dismisses, no action needed.
          </div>
        </div>

      </div>
    </PawkitFrame>
  );
}

Object.assign(window, {
  CommunityTeaser, ShopTeaser, InvoiceDetail,
  EmptyVaccinations, EmptyInvoices,
  OfflineState, ErrorAnatomies,
});
