# DoN Innovation Bank export (schema 1.1, generated 2026-10-24)

Files
- innovation_bank.json: 39 records + changelog + scope metadata (source of truth; nested fields)
- innovation_bank.csv: flat view of the same records
- audit_log.jsonl: one JSON event per line (discoveries, retags, score changes, top-10 changes)

The public site imports `innovation_bank.json` only. What it reads, and how to fill it, is specified in `docs/grok.md`. In particular the site plots `scientific_utility.score` and `commercial_potential.score` (labeled as Scout estimates) and sorts on `publication_date`, not `discovery_date`.

Notes
- Public-source data only (OpenAlex abstracts, WashU pages, GitHub). Nothing confidential.
- Records are maintained by the Scout. They are not hand-tagged by a developer, and `human_confirmed` is not a publishing gate.
- `lead_don_status` (core/affiliate/external) and `lead_home_department` are separate. `atlas_verified` is false everywhere (not yet checked vs Investigator Atlas).
- Scores are Scout estimates. `observations_validated` and `inferences` stay separate per record. Component subscores, `recommended_resources`, and briefs stay in the bank; the site does not render them.
