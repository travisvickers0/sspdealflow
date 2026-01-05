---
name: SSP Investor Acquisition System
overview: Build a complete investor acquisition and qualification system for SSP, including website refinements, trust assets, Meta ad landing page, lead capture, CRM tracking, Meta ads setup, call handling, social credibility, and launch checklist.
todos: []
---

# SSP First-Position Invest

or Acquisition System

## Project Overview

Build a production-ready investor acquisition system that converts cold Meta ad traffic into qualified investor intro calls. The system emphasizes trust, clarity, and compliance with an institutional, non-salesy tone.

## Architecture Overview

```javascript
Meta Ads → Landing Page → Qualification Form → CRM (Google Sheets) → Calendly → Call → Follow-up
```



## Deliverable 1: Website Implementation Tasks

### Files to Modify

- [client/src/pages/Home.tsx](client/src/pages/Home.tsx) - Hero section refinement
- [client/src/pages/PropertyDetail.tsx](client/src/pages/PropertyDetail.tsx) - Add "Why First-Position" section
- [client/src/pages/HowItWorks.tsx](client/src/pages/HowItWorks.tsx) - Add FAQ section
- [client/src/components/Layout.tsx](client/src/components/Layout.tsx) - Footer disclaimer

### Hero Section Refinement (Home.tsx)

**Current State:** Hero has 4 tiers but needs hierarchy refinement per requirements.**Changes Required:**

1. **Tier 1 - Headline** (Keep as-is)

- "Real Estate Opportunities Built for Investors"
- No changes to size or layout

2. **Tier 2 - Trust Strip** (Replace current feature grid)

- Replace lines 74-99 (feature grid) with single horizontal trust strip
- Copy: "10+ years verified foreclosure & REO exits nationwide · Deal-by-deal joint ventures · No fees · 50/50 profit split at sale"
- Design: Single rounded container, soft neutral background, low contrast
- Max width: 80-85% of headline width
- Centered or left-aligned under headline

3. **Tier 3 - Metrics Row** (Adjust existing)

- Keep lines 102-114 but adjust:
    - Order: Deals Closed, Avg Hold, Total Equity, Active Investors
    - Reduce font size slightly
    - Remove/minimize shadows
    - Increase vertical spacing from trust strip by 8-12px
    - Make "Active Investors" label slightly lighter

4. **Tier 4 - CTA Row** (Keep but ensure hierarchy)

- Primary: "Explore Properties"
- Secondary: "View Partnership Structure" (outlined, lower contrast)
- Ensure secondary never competes visually

5. **Add First-Position Badge**

- Add badge below CTAs or in trust strip area
- Text: "First-Position Capital Structure"
- Visual: Subtle, institutional

### Deal Page "Why First-Position" Section (PropertyDetail.tsx)

**Location:** Add after "About this Property" section (around line 383)**Content Structure:**

- Heading: "Why First-Position Matters"
- Three-column layout:

1. **Capital Protection**: "Your capital is secured in first position via joint venture agreement. SSP capital is subordinated."
2. **Title Company Control**: "All funds flow through licensed title company. No direct transfers to SSP operating accounts."
3. **Clear Structure**: "50/50 profit split. No fees. No preferred returns. Simple, transparent."

**Design:** Card-based, institutional tone, no hype language

### FAQ Section (HowItWorks.tsx)

**Location:** Add before FinalCTASection (around line 744)**Questions to Answer:**

1. "Is this a fund or pooled capital?" → No, deal-by-deal JVs
2. "What if the property doesn't sell?" → Standard holding period, market risk disclosure
3. "How is my capital protected?" → First-position structure, title company control
4. "What are the fees?" → No fees, 50/50 split only
5. "What if SSP goes out of business?" → Title company holds funds, investor capital protected
6. "How long until I see returns?" → Typical 3-6 month hold, varies by market
7. "Can I invest in multiple deals?" → Yes, each deal is independent
8. "What's the minimum investment?" → Full purchase price per property ($175k-$220k typical)

**Tone:** Direct, factual, no sales language

### Footer Disclaimer (Layout.tsx)

**Add to footer:**

- "Securities offered through [broker-dealer if applicable]. Not a solicitation. Accredited investors only."
- "Past performance does not guarantee future results."
- "Investments involve risk of loss."

## Deliverable 2: Trust Assets

### A. One-Page Investor Partnership Overview PDF

**File to Create:** `attached_assets/SSP_Investor_Partnership_Overview.pdf` (content document)**Structure:Header:**

- "SSP First-Position Joint Venture Partnership"
- "For Accredited Investors Only"

**Section 1: Structure**

- Deal-by-deal joint ventures
- Investor funds full purchase price ($175k-$220k typical)
- SSP advances rehab and holding costs
- 50/50 profit split at sale
- No fees, no preferred returns

**Section 2: Capital Flow**

- Investor capital → Title company (first position)
- SSP capital → Subordinated
- Sale proceeds → Title company distributes 50/50
- No arrows to SSP operating accounts

**Section 3: Responsibilities**

- **Investor:** Provides purchase capital, receives 50% profit
- **SSP:** Sources deals, manages rehab, handles sale, receives 50% profit

**Section 4: Typical Timeline & Returns**

- Hold period: 3-6 months typical
- Profit range: $30k-$60k per deal (varies by property)
- Timeline: Purchase → Rehab (4-8 weeks) → List → Sale (30-60 days)

**Section 5: Disclaimers**

- Accredited investors only
- Not a solicitation
- Past performance ≠ future results
- Risk of loss

**Design Notes:**

- Clean, institutional layout
- Use diagrams for capital flow
- No marketing language
- Professional typography

### B. One-Page Capital Flow Diagram

**File to Create:** `attached_assets/Capital_Flow_Diagram.md` (designer instructions)**Visual Elements:**

1. **Investor Capital Box**

- "$175k-$220k Purchase Price"
- Arrow down to Title Company

2. **Title Company (Central)**

- "Licensed Title Company"
- "First Position Lien"
- "Capital Held in Escrow"

3. **SSP Capital Box (Subordinated)**

- "Rehab & Holding Costs"
- Arrow to Title Company (dashed line, smaller)

4. **Sale Proceeds**

- "Sale Price" → Title Company
- Split arrows: 50% Investor, 50% SSP

**Key Design Rules:**

- Title company is central and emphasized
- No arrows pointing to SSP operating accounts
- Investor capital visually larger/more prominent
- Use color coding: Investor (green), SSP (gray), Title (blue)

## Deliverable 3: Meta Ad Landing Page

### New Page to Create

**File:** [client/src/pages/MetaLanding.tsx](client/src/pages/MetaLanding.tsx)**Route:** `/investor-intro` (separate from homepage)**Page Structure:**

1. **Headline Section**

- "First-Position Real Estate Joint Ventures"
- Subheadline: "Deal-by-deal partnerships. No fees. 50/50 profit split."
- Trust indicator: "10+ years verified exits"

2. **First-Position Explanation**

- Simple 3-point explanation:
    - Your capital in first position
    - Title company control
    - SSP subordinated

3. **Capital Flow Diagram**

- Embedded visual (from Deliverable 2B)
- Or simplified text version

4. **Download PDF CTA**

- Button: "Download Partnership Overview"
- Links to PDF from Deliverable 2A

5. **Book Intro Call CTA**

- Primary button: "Schedule 30-Min Intro Call"
- Links to qualification form (Deliverable 4)

6. **Compliance Disclaimer**

- Small text at bottom
- "Accredited investors only. Not a solicitation."

**Design Principles:**

- Single column, mobile-first
- No navigation menu (focused experience)
- White background, minimal design
- One clear conversion path

**Conversion Flow:**

```javascript
Landing → Download PDF (optional) → Qualification Form → Calendly → Call
```



## Deliverable 4: Lead Capture & Investor Qualification

### New Components to Create

**File:** [client/src/components/InvestorQualificationForm.tsx](client/src/components/InvestorQualificationForm.tsx)**File:** [client/src/pages/Qualify.tsx](client/src/pages/Qualify.tsx)**Route:** `/qualify`

### Form Fields (Required)

1. **Name** (text input)
2. **Email** (email input, validated)
3. **Phone** (tel input, formatted)
4. **Accredited Investor Confirmation** (checkbox, required)

- "I confirm I am an accredited investor as defined by SEC Rule 501"

5. **Capital Range per Deal** (select dropdown)

- Options: "$150k-$200k", "$200k-$250k", "$250k+", "Flexible"

6. **Investment Timeline** (select dropdown)

- Options: "Immediate (within 30 days)", "1-3 months", "3-6 months", "Exploring options"

7. **Primary Interest** (radio buttons)

- Options: "Structure & security", "Speed to close", "Control & transparency", "All of the above"

### Form Logic

- All fields required
- No call booking without form completion
- Form submission:

1. Validate all fields
2. POST to `/api/leads` endpoint
3. Store in database + Google Sheets (via backend)
4. Send confirmation email (Resend)
5. Redirect to Calendly with pre-filled info

### Backend API Endpoint

**File:** [server/routes/leads.ts](server/routes/leads.ts) (new file)**Endpoint:** `POST /api/leads`**Functionality:**

- Validate form data
- Store in PostgreSQL `leads` table
- Sync to Google Sheets (via Google Sheets API)
- Trigger Resend email
- Return Calendly link

### Database Schema Addition

**File:** [shared/schema.ts](shared/schema.ts)**New Table:**

```typescript
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  accreditedConfirmed: boolean("accredited_confirmed").notNull(),
  capitalRange: text("capital_range").notNull(),
  investmentTimeline: text("investment_timeline").notNull(),
  primaryInterest: text("primary_interest").notNull(),
  status: text("status").default("new"), // new, qualified, called, converted, disqualified
  calendlyLink: text("calendly_link"),
  callOutcome: text("call_outcome"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```



### Confirmation Email (Resend)

**Template Content:**

- Subject: "SSP Partnership Overview & Next Steps"
- Body:
- Thank you message
- Attach PDF (from Deliverable 2A)
- Calendly link (pre-filled with name/email)
- Brief next steps

### Disqualification Rules

- Not accredited → Show message, don't allow form submission
- Capital range too low → Still allow, but note in CRM
- Timeline too far out → Still allow, but flag for later follow-up

## Deliverable 5: CRM Structure

### Google Sheets Setup

**Sheet Structure:Tab 1: Leads**Columns:

- Timestamp
- Name
- Email
- Phone
- Accredited
- Capital Range
- Timeline
- Primary Interest
- Status (dropdown: New, Qualified, Called, Converted, Disqualified)
- Call Date
- Call Outcome
- Notes
- Calendly Link
- Repeat Investor (checkbox)

**Tab 2: Deals Sent**

- Lead Name/Email
- Property Address
- Date Sent
- Response
- Status

**Tab 3: Repeat Investors**

- Name
- Email
- Total Deals
- Total Invested
- Last Deal Date

### Backend Integration

**File:** [server/lib/googleSheets.ts](server/lib/googleSheets.ts) (new file)**Functionality:**

- Google Sheets API integration
- Append new leads
- Update lead status
- Track deals sent
- Flag repeat investors

### Status Pipeline

1. **New** → Form submitted
2. **Qualified** → Accredited + capital range confirmed
3. **Called** → Intro call completed
4. **Converted** → Committed to a deal
5. **Disqualified** → Not a fit

### Operating Rules

- Update status within 24 hours of call
- Add notes immediately after call
- Flag repeat investors automatically
- Weekly review of "New" leads

## Deliverable 6: Meta Ads Setup

### Business Manager Setup Checklist

1. Create/verify Meta Business Manager account
2. Add payment method
3. Install Meta Pixel on website
4. Set up conversion events
5. Create custom audience (website visitors)
6. Set up lookalike audiences (after 100+ conversions)

### Pixel Installation

**File:** [client/index.html](client/index.html)**Add Meta Pixel code:**

- Base pixel code in `<head>`
- Event tracking for:
- PageView
- Lead (form submission)
- Schedule (Calendly booking)

### Conversion Events

1. **Lead** - Form submission on `/qualify`
2. **Schedule** - Calendly booking completed
3. **Download** - PDF download from landing page

### Campaign Structure

**Campaign 1: Proof Snapshot Ad**

- Objective: Conversions (Lead event)
- Budget: $50/day (test phase)
- Ad Set: Cold audience, 35-65, interests: real estate investing, accredited investors
- Ad Creative: Screenshot of deal page with metrics
- Headline: "First-Position Real Estate Deals"
- Description: "Deal-by-deal joint ventures. No fees. 50/50 split. 10+ years verified exits."
- CTA: "Learn More"

**Campaign 2: Structure-Led Ad**

- Objective: Conversions (Lead event)
- Budget: $50/day
- Same targeting
- Ad Creative: Capital flow diagram (simplified)
- Headline: "How First-Position Works"
- Description: "Your capital secured in first position. Title company control. SSP subordinated."
- CTA: "See Structure"

**Campaign 3: Founder Video Ad**

- Objective: Video Views → Conversions
- Budget: $50/day
- Same targeting
- Video: 60-90 second founder explaining structure (calm, institutional)
- Headline: "Real Estate Partnerships Built for Investors"
- Description: "No hype. Just structure, transparency, and verified exits."
- CTA: "Watch & Learn"

### Targeting Rules

**Include:**

- Age: 35-65
- Interests: Real estate investing, accredited investors, property investment
- Behaviors: High net worth indicators

**Exclude:**

- Current investors (custom audience)
- Website visitors last 30 days (retarget separately)

### Ad Copy (Exact)

**Proof Snapshot Ad:**

- Headline: "First-Position Real Estate Deals"
- Primary Text: "Deal-by-deal joint ventures on foreclosure and REO properties. Investor funds purchase. SSP handles rehab. 50/50 profit split at sale. No fees. 10+ years verified exits."
- Description: "Accredited investors only. Not a solicitation."

**Structure-Led Ad:**

- Headline: "How First-Position Works"
- Primary Text: "Your capital is secured in first position via joint venture agreement. All funds flow through licensed title company. SSP capital is subordinated. Simple, transparent structure."
- Description: "Deal-by-deal partnerships. No pooled capital."

**Founder Video Ad:**

- Headline: "Real Estate Partnerships Built for Investors"
- Primary Text: "No hype. No promises. Just structure, transparency, and verified exits. Deal-by-deal joint ventures with first-position capital protection."
- Description: "Accredited investors only."

## Deliverable 7: Call Handling System

### Call Script (30 Minutes)

**File:** `docs/call-script.md` (new file)**Structure (60 seconds):**

1. **Greeting** (30 sec)

- Thank for interest
- Confirm they downloaded PDF
- Set expectation: "This is a structure walkthrough, not a sales pitch"

2. **Structure Explanation** (60 sec)

- Deal-by-deal JV
- Investor funds purchase ($175k-$220k)
- SSP advances rehab
- 50/50 split at sale
- First-position protection
- Title company control

3. **One Real Deal Walkthrough** (10 min)

- Pick current available property
- Walk through numbers
- Show timeline
- Explain risks

4. **Q&A** (15 min)

- Answer questions
- Address objections

5. **Next Step** (2 min)

- If qualified: Send deal package
- If not ready: Add to follow-up list
- Clear timeline for decision

### Objection Responses

**"This sounds too good to be true"**

- "It's not a promise. It's a structure. Past performance doesn't guarantee future results, but the structure is transparent."

**"What if the property doesn't sell?"**

- "Standard market risk. We use conservative ARV estimates and light rehab scope to minimize hold time."

**"How do I know my capital is safe?"**

- "First-position lien structure. Title company holds funds. SSP capital is subordinated. Joint venture agreement documents this."

**"What are the fees?"**

- "No fees. 50/50 profit split only. Your capital goes to purchase. SSP advances rehab. We split profit at sale."

### Disqualifying Signals

- Not accredited
- Capital range too low (<$150k)
- Timeline too far out (>6 months) + not serious
- Looking for passive income (this is active JV)

### Follow-up Actions

- Qualified → Send deal package within 24 hours
- Not ready → Schedule follow-up in 30 days
- Disqualified → Polite decline, remove from list

## Deliverable 8: Social Credibility Setup

### LinkedIn Company Page

**File:** `docs/linkedin-setup.md` (new file)**About Section:**"Southern Specialty Properties LLC (SSP) structures first-position joint venture partnerships on foreclosure and REO residential real estate flips. Deal-by-deal partnerships. No fees. 50/50 profit split. Accredited investors only."**Banner Guidance:**

- Clean, professional
- No lifestyle imagery
- Simple text: "First-Position Real Estate Partnerships"

**Posting Cadence:**

- 1-2 posts per month
- What to post:
- Deal exits (factual, no hype)
- Structure explanations (educational)
- Market insights (data-driven)
- What NOT to post:
- Lifestyle content
- Promises/guarantees
- Hype language
- Pooled capital framing

### Facebook Business Page

**About Section:** (Same as LinkedIn)**Posting:** Minimal (1 post/month max)**Focus:** Credibility checks only, not active marketing

## Deliverable 9: Launch Checklist & Sequencing

### Pre-Launch (Must Complete Before Ads)

- [ ] Website hero section refined
- [ ] Deal page "Why First-Position" section added
- [ ] FAQ section added to How It Works
- [ ] Footer disclaimer added
- [ ] PDF partnership overview created
- [ ] Capital flow diagram created
- [ ] Meta landing page built and tested
- [ ] Qualification form built and tested
- [ ] Database schema updated (leads table)
- [ ] Backend API endpoint created (`/api/leads`)
- [ ] Google Sheets CRM set up
- [ ] Google Sheets API integrated
- [ ] Resend email service configured
- [ ] Confirmation email template created
- [ ] Calendly account set up
- [ ] Meta Pixel installed and tested
- [ ] Conversion events configured
- [ ] LinkedIn company page created
- [ ] Facebook business page created

### Soft Launch (Week 1-2)

- [ ] Launch one ad campaign (Proof Snapshot)
- [ ] Budget: $25/day
- [ ] Monitor form submissions
- [ ] Test email delivery
- [ ] Verify CRM sync
- [ ] Complete 3-5 intro calls
- [ ] Refine call script based on feedback

### Learning Phase (Week 3-4)

- [ ] Analyze ad performance
- [ ] Identify best-performing ad
- [ ] Adjust targeting if needed
- [ ] Scale winning ad to $50/day
- [ ] Launch second ad (Structure-Led)
- [ ] Continue call refinement

### Scale Phase (Month 2+)

- [ ] Scale to $100/day on winning campaigns
- [ ] Launch third ad (Founder Video)
- [ ] Create lookalike audiences
- [ ] Set up retargeting campaigns
- [ ] Optimize for repeat investors

### Red Flags to Watch For

- Form submission rate < 2% → Landing page issue
- Email delivery failures → Resend configuration
- CRM sync failures → Google Sheets API
- Call no-show rate > 30% → Qualification too loose
- Conversion rate < 5% → Ad/landing page mismatch
- High disqualification rate → Targeting too broad

## Implementation Order

1. **Week 1:** Website refinements (Deliverable 1)
2. **Week 1:** Trust assets (Deliverable 2)
3. **Week 2:** Meta landing page (Deliverable 3)
4. **Week 2:** Lead capture system (Deliverable 4)
5. **Week 2:** CRM structure (Deliverable 5)
6. **Week 3:** Meta ads setup (Deliverable 6)
7. **Week 3:** Call handling system (Deliverable 7)
8. **Week 3:** Social credibility (Deliverable 8)
9. **Week 4:** Launch checklist execution (Deliverable 9)

## Success Metrics

- Landing page conversion: > 5%
- Form completion rate: > 80%
- Email delivery rate: > 95%