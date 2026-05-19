# **Admin flows: The vet's experience**

How Dr. Sagar (or any future vet) uses the Pawkit admin dashboard. Locked decisions live in docs/decisions-log.md.

## **Navigation**

The left rail has three destinations: **Inbox**, **Broadcasts**, **Settings**. Pet profiles open contextually from inbox messages, not from a navigation tab. Sagar's mental model is "I'm responding to a parent about their pet," not "I'm browsing a patient list."

The header carries a persistent **search bar** whose behavior is context-aware. On the Inbox tab, search scans patient/parent records (pet name, parent name, phone number); a hit opens that pet's profile or that parent's inbox thread, useful when a parent walks in and Sagar needs to pull up their record fast. On the Broadcasts tab, search scans Broadcast content by keyword. On the Settings tab, the search bar is hidden (Settings has no searchable content).

## **Inbox**

Sagar opens Pawkit at least once a day and lands in the inbox. Two subtabs: **Active** and **Inactive**.

- **Active** holds threads awaiting a reply where the follow-up window is still open, sorted oldest-waiting at the top. The tab label shows the count of pending threads.  
- **Inactive** holds threads he's already responded to, sorted by latest message. No count on the tab.

Each row carries pet name + pet picture (with fur-match ring if the parent has uploaded a photo) + household name + time since the parent's last message. The last-message preview is text only; if the parent's most recent message is a photo or video attachment, microcopy says so (exact strings locked in microcopy round). Species and breed appear on the thread detail screen when Sagar opens the thread and sees the pet record, not in the inbox row.

Tapping a thread opens it with the pet's medical context already on screen \- last visit date, current medications, recent vaccinations, chronic conditions \- so Sagar doesn't have to remember who Gabby is or switch tabs to find his last note. He writes from scratch with full context visible. The right-side pet record panel surfaces Clinical History and per-pet Invoices as two tabs under Quick Facts (toggle between them, each fills the 400px panel width when active). The Clinical History tab shows a concise scrollable event log; tapping any row opens Screen 05 (full clinical history surface with SOAP note structure preview, hand-written for v0). The Invoices tab shows a compact list of this pet's invoices; tapping any row opens the view-only invoice screen (Screen 04). Both full screens have a Back affordance returning to the thread with the originating tab still active. Sarvam voice input handles Marathi, Hinglish, and English; whatever he speaks is rendered as editable text before sending.

On send, the thread moves to Inactive and the Active count drops by one. If the parent replies again within the follow-up window, the thread re-enters Active.

## **Broadcasts**

The Broadcasts rail item branches into two subtabs on the left menu: **Drafts** (in-progress work that hasn't been sent yet) and **Published** (all past published Broadcasts, latest first).

A Broadcast is whatever vet-to-parents content Sagar wants to push. The shape is variable:

- a short clinic notice ("Closed Monday for staff training")  
- a vaccination drive  
- a long educational piece with cover image, key points, body, warning signs, and escalation guidance ("How to care for your dog in the summer")

He decides at compose time how much to fill.

### **Composing**

From the Broadcasts rail, Sagar taps **Create new Broadcast** and lands in a two-column editor with a live phone-frame preview on the right that updates as he types.

**Always required:** title and body, both bilingual EN+MR with side-by-side fields.

**Optional structured sections** (added only when relevant):

- Cover image (Ink-faint placeholder if absent)  
- Key points (bullets)  
- Warning signs (red-flag symptoms parents should watch for)  
- Escalation (when to call the clinic)

Every text field has EN/MR tabs and Sarvam voice input. Sagar composes in either language; Sarvam Translate auto-generates the other-language version (trigger TBD: on field blur or via an explicit Translate button). He reviews and approves both versions sequentially before publish; bilingual publish is a hard block (cannot publish until both languages are filled and approved).

### **Audience and publish**

Default audience is all parents in the clinic, with optional filters (species: dogs, cats, or both; exclude deceased; age ranges) to narrow. The audience count ticks down live so he can confirm exactly who'll receive it.

Publish has a 15-second undo window. On publish:

- The Broadcast lands in every recipient's Broadcasts tab as a card  
- A parent-side push notification fires  
- The Broadcast gets a public\_slug and a public URL at pawkit.app/broadcasts/\[slug\] that anyone can read on the web, even without Pawkit installed

### **Drafts, edits, and deletes**

Drafts get saved as Sagar composes and surface under the Drafts subtab; he can resume any draft anytime. (Auto-save vs explicit Save-draft button is a UX detail still pending lock.)

Edit after publish is allowed. Sagar opens a published Broadcast, edits it, re-publishes; parent-side cards reflect the latest content. (Edit-indicator treatment on the parent card and whether an edit triggers a fresh push are pending lock.)

Delete after publish is allowed. The Broadcast card disappears from every recipient's Broadcasts tab and the public URL 404s. **The push notification that already fired cannot be unsent.** Parents who saw the notification arrive have already seen it; if they tap a stale push notification after delete, the parent app handles that case gracefully (specifics in microcopy round).

## **Settings**

Profile photo, full name, vet license, phone (read-only, tied to auth), email, **EN/MR toggle**, Logout. The EN/MR toggle switches the entire dashboard chrome (every label, button, microcopy string, empty state) between English and Marathi; the toggle lives only in Settings, not in any other surface. Clinic info is hard-coded for AMS in v0.

## **Visit data origin**

For the demo, visit data is hand-seeded: the Fernandes family (4 pets, accurate medical history shaped for the pitch) plus ~199 synthetic Pune patients fill the dashboard with realistic-looking content. VetBuddy stays the nominal system of record during the demo; AMS hasn't given permission to migrate. The hand-seeded data is pitch staging, not a shipped v0 feature.

**Before AMS launch, the SOAP + invoice production pipeline gets built.** The vet hits "start recording" at the beginning of a consult; the consult proceeds normally; the vet hits "stop" when done. AI processes the recording: extracts the SOAP structure (four pre-built labeled fields populated from the consult audio) and suggests invoice line items based on mentioned medications, procedures, and examinations. The vet can alternatively dictate invoice line items directly, instead of or in addition to the AI extraction. The vet reviews and approves the AI-generated SOAP + invoice in a single review motion (zero post-consult manual data entry except the approval click). On approval, the invoice auto-routes to the billing desk, where non-vet support staff see it queued for the parent to pay; the SOAP note is saved to the pet's clinical history. This is the production data-entry path that replaces VetBuddy for record-keeping. Pre-launch buildable, not a v1+ "vision"; the demo doesn't run the live capture, but Gabby's clinical history (Screen 05 Clinical history full screen) surfaces hand-seeded SOAP-structured content to demonstrate the production path; growth pitch covers the live capture + invoice-routing flow. A second admin user role lands with this layer: non-vet support staff at the billing desk who see incoming invoices, process payment, mark them paid; v0 admin remains Sagar-only, the billing-desk surface gets specced as part of the pre-launch SOAP build.  
