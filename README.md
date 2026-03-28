# Read Before You Sign

AI-powered contract review for small business owners. Upload any contract, get a plain-English breakdown with risk scores and suggested changes in minutes.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Upload** a PDF contract
2. **AI classifies** the contract type (lease, vendor, service, etc.)
3. **AI analyzes** every clause using contract-type-specific playbooks
4. **Results page** shows risk scorecard, plain-English explanations, and copy-paste suggested changes
5. **Chat** to ask follow-up questions about any clause

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage with upload
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── review/route.ts         # Contract review endpoint
│   │   └── chat/route.ts           # Follow-up chat endpoint
│   └── review/[id]/page.tsx        # Review results page
├── lib/
│   ├── analyzer.ts                 # AI pipeline (classify → analyze → chat)
│   ├── pdf.ts                      # PDF text extraction
│   └── playbooks/
│       └── index.ts                # Contract-type playbooks (the moat)
└── components/                     # Shared components (Phase 2)
```

## Supported Contract Types

- ✅ Commercial leases (California benchmarks)
- ✅ Vendor / supplier agreements
- ✅ Service contracts
- 🔜 Equipment financing
- 🔜 Employment agreements
- 🔜 NDAs

## Playbook System

Each contract type has a playbook containing:
- Industry-specific risk benchmarks
- Market-standard comparisons by jurisdiction
- Template suggested changes
- Negotiation tips

Playbooks are in `src/lib/playbooks/index.ts`. Adding a new contract type = adding a new playbook.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Claude API** (Sonnet for classification, Sonnet for analysis)
- **pdf-parse** for PDF text extraction

## Roadmap

### Phase 1 (Current) — MVP
- [x] PDF upload + text extraction
- [x] AI classification pipeline
- [x] Clause-by-clause analysis with risk scoring
- [x] Plain-English results page
- [x] Copy-paste suggested changes
- [x] Follow-up chat
- [ ] Stripe payment integration

### Phase 2 — Core Product
- [ ] Phone photo upload (OCR)
- [ ] Supabase database (persist reviews)
- [ ] User accounts
- [ ] Subscription billing
- [ ] Review history
- [ ] Email notifications for key dates

### Phase 3 — Growth
- [ ] Side-by-side contract comparison
- [ ] Custom playbook rules
- [ ] Contract clause library (SEO)
- [ ] Referral program
- [ ] Multi-state playbooks

## License

Proprietary. All rights reserved.
