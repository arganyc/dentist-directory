# SmileFinder — Cold Email Sequence (claim driver)

Goal: get unclaimed NPI-listed dentists to **claim their free listing** at usdentistsdirectory.com/claim, using the free calculators as the hook.

## Merge fields (from your NPI data)
`{{FirstName}}` `{{LastName}}` `{{Practice}}` `{{City}}` `{{State}}` `{{SenderName}}`
Always personalize at least Practice + City. Fall back to "your practice" / "your area" if a field is missing.

## Sending rules (protect deliverability — limited budget)
- Send from a **separate domain** (e.g. `get.smilefinder...` or `smilefinderdental.com`), NOT usdentistsdirectory.com. Warm it 2–3 weeks first.
- Tool: Instantly or Smartlead (~$30–40/mo). 20–40 sends/day per inbox; 2–3 inboxes max to start.
- Start with **one metro at a time** (e.g. Phoenix, then Las Vegas) — focus = better reply rates + easier "near you" social proof.
- CAN-SPAM: include a real physical mailing address + one-click unsubscribe in every email. Honor opt-outs immediately. B2B, plain-text style, no images, one link per email.
- Plain text outperforms designed HTML for cold. Keep it short.

---

## Email 1 — The hook (Day 0)
**Subject A:** `{{Practice}} — the no-show math for {{City}} dentists`
**Subject B:** `Dr. {{LastName}}, a quick number for {{Practice}}`

Hi Dr. {{LastName}},

Quick one. Most {{City}} dental practices lose **$80,000–$150,000 a year** to no-shows and last-minute cancellations — and most underestimate it by about half.

We built a free 15-second calculator so you can see your real number:
→ https://usdentistsdirectory.com/tools/no-show-cost-calculator.html

No signup to use it. If the number surprises you (it usually does), there's a simple fix on the other side.

— {{SenderName}}
SmileFinder · US Dentist Directory
[unsubscribe] · [physical mailing address]

---

## Email 2 — The unclaimed listing / FOMO (Day 3)
**Subject:** `{{Practice}} is listed on SmileFinder — but unclaimed`

Hi Dr. {{LastName}},

Following up — {{Practice}} already has a profile on SmileFinder (US Dentist Directory), but it's currently **unclaimed**. Patients searching for a dentist in {{City}} can find you, but right now you can't add photos, hours, services, or respond to reviews.

Claiming is free and takes about 2 minutes:
→ https://usdentistsdirectory.com/claim

A few practices near you in {{City}} have already claimed theirs — claiming yours helps you show up as the obvious choice.

— {{SenderName}}
[unsubscribe] · [physical mailing address]

---

## Email 3 — Value + last call (Day 7)
**Subject:** `last note — {{City}} new-patient math`

Hi Dr. {{LastName}},

Last note from me. Beyond no-shows, the bigger number is new patients — one new patient is worth far more over their lifetime than a single cleaning. Here's the calculator for that:
→ https://usdentistsdirectory.com/tools/new-patient-revenue-calculator.html

If growing new-patient flow in {{City}} is on your list this quarter, claiming your free SmileFinder listing is the easiest first step:
→ https://usdentistsdirectory.com/claim

Either way, hope the tools are useful.

— {{SenderName}}
P.S. If now isn't the time, just reply "not now" and I'll close the loop.
[unsubscribe] · [physical mailing address]

---

## Optional Email 4 — Emergency angle (Day 12, for general/emergency practices)
**Subject:** `where {{City}} emergency patients are going`

Hi Dr. {{LastName}},

When someone in {{City}} searches "emergency dentist near me," they book the first credible practice they find. Here's what those missed cases add up to:
→ https://usdentistsdirectory.com/tools/emergency-dentist-revenue-calculator.html

Claim your free listing so you're the one they find first: https://usdentistsdirectory.com/claim

— {{SenderName}}

---

## A/B + metrics to watch
- Test Subject A vs B on Email 1 (the open-rate lever).
- Track: reply rate, calculator clicks, claims. Optimize the subject first, then Email 1 body.
- Good cold benchmarks: 40–60% open, 3–8% reply. If claims lag, the gap is usually the claim page, not the email.
