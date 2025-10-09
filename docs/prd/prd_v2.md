# PROP_MAKER — Product Requirements Document (Full Vision Edition)

> Version: v2.0 — Vision-Aligned PRD
> Product Code: `PROP_MAKER`
> Owner: Product Manager (you) × Builder Partner
> Stage: Vision → Stage 1 Execution

---

## 0. Vision

### 0.1 Long-Term Ambition

PROP_MAKER aims to evolve from an AI-assisted proposal tool into a **fully agent-driven marketplace** where *clients and service providers collaborate through AI intermediaries* that ensure clarity, alignment, and trust — effectively becoming the **AI backbone of the global “getting-things-done” economy.**

The core vision:

> **“Turn human intent into delivered outcomes — through intelligent agents that negotiate, scope, and oversee work for both sides.”**

PROP_MAKER will start by fixing the most painful bottleneck — the broken **RFP ↔ Proposal** loop — and expand outward to manage the **entire service lifecycle**: intent formation → scoping → proposal → contracting → execution → review → renewal.

### 0.2 Philosophy

1. **Two-Sided Intelligence** — Every workflow should improve outcomes for both client and provider. No side gets more complexity.
2. **Structured Symmetry** — Briefs and proposals share a common schema (scope, deliverables, cost, timeline, success metrics).
3. **Proactive Autonomy** — Agents think and act between user interactions, surfacing insights, opportunities, and fixes.
4. **Continuous Learning** — Every completed deal teaches the system what works — tone, pricing, structure — forming a compounding advantage.
5. **Trust by Design** — Transparency, clear versioning, signed artifacts, and minimal data sharing ensure comfort for all sides.

---

## 1. Evolution Path

| Stage                         | Product Form                | User Base                            | Core Proof                         | Agent Role                  |
| ----------------------------- | --------------------------- | ------------------------------------ | ---------------------------------- | --------------------------- |
| **V1 — Proposal Strategist**  | AI co-pilot for freelancers | Solo freelancers & boutique agencies | Faster drafting, higher win rates  | Observe → Propose → Confirm |
| **V2 — Two-Sided Briefs**     | Shared RFP ↔ Proposal loop  | Add clients via invites              | Mutual clarity & structured briefs | Mediate → Align             |
| **V3 — AI-Mediated Matching** | Smart marketplace           | Controlled beta                      | Efficient matching; trust layer    | Negotiate → Recommend       |
| **V4 — Outcome Engine**       | Agent-driven workflow       | Multi-domain                         | Turn briefs into executed outcomes | Act (within policy)         |

---

## 2. Mission for v1

Deliver the **freelancer-first product** that seeds the network:
An AI strategist that turns a vague client request into a signed, branded proposal — fast — while learning from every deal.

### Key Promises for v1

* **Speed** — From idea to signed proposal in under 30 minutes.
* **Clarity** — No more vague RFPs; structured, complete briefs by default.
* **Professionalism** — Look agency-level polished even as a solo operator.
* **Intelligence** — A learning co-pilot that improves with use.

---

## 3. Target Market

### 3.1 Primary Users

* **Solo freelancers** in design, web development, and marketing consulting.
* **Boutique agencies (1–10 people)** that submit multiple proposals monthly.

### 3.2 Buyer Side (indirect users)

* Clients who commission these projects (small business owners, startup founders, marketing leads).
  They will experience the product through a **guided AI brief intake** and **review workspace**, without needing to sign up.

### 3.3 Future Expansion

* Other service verticals: branding, copywriting, video, legal, SaaS implementation.
* Larger agencies with integrated CRM pipelines.

---

## 4. Core Product Experience

### 4.1 Home / Dashboard

**Purpose:** Single control center to view pipeline, insights, and next actions.

**Key Features:**

* KPIs: Sent / Viewed / Signed / Win Rate.
* Insights: time-to-decision, agent suggestions accepted.
* Quick actions: *New Proposal*, *Invite Client to Brief*, *Continue Drafts*.
* Filters by client, status, or tags.

### 4.2 Workspace (Chat + Live Proposal)

**Purpose:** Real-time co-creation surface.

**Layout:**

* **Left:** chat interface with agent (proposal drafting, edits, suggestions).
* **Right:** live updating proposal preview with brand theme applied.

**Capabilities:**

* AI generates first draft from structured brief.
* Accept/reject suggestions inline.
* Tiered pricing packs (Good / Better / Best).
* Style and tone adapt to brand profile.

### 4.3 Brief Intake (Client-Side)

**Purpose:** Turn client intent into structured data automatically.

**Flow:**

* Magic link → conversational Q&A (AI asks clarifying questions).
* Outputs a validated brief (goal, deliverables, timeline, budget, metrics).
* Notifies provider; visible instantly in workspace.

### 4.4 Review & Signature

**Purpose:** Replace endless PDF ping-pong.

**Experience:**

* Web-based viewer, inline comments, approvals.
* Section-level commenting + whole-doc sign-off.
* E-signature integration (DocuSign/HelloSign).
* Final signed copy archived with audit log.

---

## 5. AI Agent System

### 5.1 Core Principles

* Agents act **asynchronously** to enhance outcomes — not just reactive prompts.
* Mutating actions (anything external-facing) require **user confirmation**.
* All reasoning is stored for transparency and learning.

### 5.2 Roles

| Agent                | Scope                                                                     | Autonomy                    |
| -------------------- | ------------------------------------------------------------------------- | --------------------------- |
| **Proposal Agent**   | Drafts proposals, enforces tone, pricing recommendations                  | Confirm-to-send             |
| **Brief Agent**      | Elicits client intent, fills structured brief                             | Autonomous (within session) |
| **Engagement Agent** | Monitors opens, reads, and timing                                         | Observe & queue nudges      |
| **Learning Agent**   | Analyzes wins/losses; tunes proposal defaults                             | Autonomous (offline)        |
| **Brand Agent**      | Ingests brand cues (website, logo) to maintain visual & tonal consistency | Confirm-to-apply            |

### 5.3 Async Workflows (Out-of-Session)

| Loop                       | Trigger            | Outcome                                                   |
| -------------------------- | ------------------ | --------------------------------------------------------- |
| **Blocks Miner**           | Nightly            | Promotes recurring proposal sections to reusable blocks   |
| **Engagement Nudge**       | Timers (48–72h)    | Drafts polite follow-ups; queues for approval             |
| **Strategy Memory Update** | Weekly             | Learns from closed deals; adjusts tone/pricing heuristics |
| **Brief Enrichment**       | New brief detected | Checks completeness, suggests clarifications              |

---

## 6. Technical & Data Architecture

### 6.1 Domain Objects

* **Brief** — structured client intent. (`domain.Brief#create|normalize`)
* **Proposal** — live, versioned document. (`domain.Proposal#draft|send|sign`)
* **Block** — reusable content element. (`domain.Block#promote|apply`)
* **Engagement** — tracking & analytics. (`domain.Engagement#score|nudge`)
* **User/Client** — account, permissions, brand profile.

### 6.2 Storage & Security

* Isolated per-user data tenancy.
* Encrypted storage for all artifacts.
* Short-lived signed links for client access.
* All actions logged with reason + timestamp.

---

## 7. Learning & Data Flywheel

### 7.1 Input Data

* Briefs, proposals, comments, engagement events, outcomes (win/loss).

### 7.2 Derived Intelligence

* Phrase-level win correlations.
* Optimal proposal length, tone, structure.
* Niche pricing heuristics.
* Common requirement clusters (for matching).

### 7.3 Compounding Advantage

Every user interaction teaches the model what “wins.”
Over time, PROP_MAKER becomes a **collective strategist** trained on successful deals — a defensible moat against template-based competitors.

---

## 8. Marketplace Vision (Beyond v1)

When both sides use the platform:

1. **Buyer Agent** builds brief →
2. **Seller Agent** drafts proposal →
3. **Mediator Agent** aligns, clarifies, and scores fit →
4. Contract is generated and signed seamlessly.

This evolves into an **agentic marketplace**:

* **Matchmaking by fit, not keyword.**
* **Pricing fairness via benchmarking.**
* **Trust through transparency (structured scope + AI reasoning trail).**

Agents become the new market infrastructure — reasoning and negotiating between humans while maintaining auditability.

---

## 9. Metrics (Across Stages)

| Metric              | Definition                  | Target v1 | Long-Term Target |
| ------------------- | --------------------------- | --------- | ---------------- |
| TTFP                | Time to first sent proposal | < 30 min  | < 10 min         |
| Win Rate Lift       | Self-reported vs baseline   | +10%      | +25%             |
| Brief Completeness  | Fields filled               | ≥80%      | ≥95%             |
| Nudge Response      | Follow-up engagement rate   | 20%+      | 40%+             |
| Client Satisfaction | Post-sign NPS               | 50+       | 70+              |

---

## 10. Rollout Plan

| Phase                 | Scope                               | Proof                                   |
| --------------------- | ----------------------------------- | --------------------------------------- |
| **Alpha**             | Core UX, proposal gen, e-sign       | 10–20 users; validate flow & AI quality |
| **Beta**              | Brief invites, engagement tracking  | 100–300 users; observe learning loops   |
| **GA**                | Nudges, blocks miner, pricing tiers | 1000+ users; begin client-side adoption |
| **Marketplace Pilot** | Buyer agents + matching             | Controlled domain rollout               |

---

## 11. Success Criteria

* 50+ signed proposals by alpha users within 60 days.
* 80% of proposals created from AI-drafted briefs.
* At least one major revision loop handled autonomously (agent-driven).
* 3+ hours saved per user per proposal cycle.

---

## 12. Risks & Mitigation

| Risk                         | Mitigation                                          |
| ---------------------------- | --------------------------------------------------- |
| Cold-start data → weak AI    | Niche focus (web/design) + feedback-driven learning |
| Over-automation spooks users | Confirm-to-send policy; transparent agent logs      |
| Client adoption friction     | No-login links; visual polish; trust UX             |
| Brand drift                  | Brand Agent enforcement; preview-based approval     |

---

## 13. Differentiation Summary

| Axis            | PROP_MAKER                       | Traditional Proposal Tools | Marketplaces    |
| --------------- | -------------------------------- | -------------------------- | --------------- |
| Two-Sided       | ✅ Yes                            | ❌ Seller only              | ⚠️ Unstructured |
| AI Intelligence | ✅ Agentic, learning              | ⚠️ Basic text assist       | ❌ None          |
| Proactivity     | ✅ Async agents                   | ❌ Reactive                 | ❌ Manual        |
| Trust Layer     | ✅ Transparent, signed, versioned | ⚠️ Limited                 | ❌ Reviews only  |
| Flywheel        | ✅ Improves over time             | ❌ Static                   | ❌ Commodity     |

---

## 14. Long-Term Product North Star

> **An AI-driven ecosystem where every human-to-human project starts and ends through structured, intelligent mediation.**

PROP_MAKER becomes the **invisible agent infrastructure** powering freelance, SMB, and eventually enterprise contracting — turning creative collaboration from chaos to clarity.

---

**End of PRD (Full Vision)**
