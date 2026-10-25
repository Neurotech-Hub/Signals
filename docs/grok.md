# Signals data contract for the Innovation Scout

You maintain `data/innovation_bank.json`. A developer no longer marks, tags, scores, or approves each innovation by hand. The pipeline is fully AI-driven: you discover the record, fill every field below, and commit the JSON. The site rebuilds from that file. Do not edit the website source, and do not hold a record back waiting for a person to confirm it.

`human_confirmed` may stay `false`. The site does not read it and does not treat it as a gate.

The site imports only `innovation_bank.json`. It does not read `innovation_bank.csv` or `audit_log.jsonl`.

## What you are recording

Publicly disclosed methods, tools, devices, software, and protocols connected to the WashU neuroscience community. Sources are public: journal pages, preprints, protocols, Zenodo, GitHub, institutional pages. Nothing confidential.

Write in a neutral, evidence-based voice. State what the source says. Do not imply university endorsement, validated commercial value, patentability, freedom-to-operate, or that coverage is complete.

## Publication date, not the day you found it

`discovery_date` is the day you first added the record. Keep it, do not overwrite it on later reviews, and do not treat it as when the work was published. The site does not display it. A bulk import date on every row is not useful to a reader.

`publication_date` is the date the site shows and sorts on. Find it in the source. Do not copy `discovery_date` into it, and do not use the date you ran.

How to choose it:

1. If the work has a peer-reviewed paper, protocol, or book chapter, use that publication date (the journal's published date, from the article page or Crossref — not the date you retrieved it).
2. Otherwise use the preprint, protocol, or repository posted date (bioRxiv/medRxiv "posted", Zenodo "published", the GitHub release date the source itself states).
3. If several public versions exist, use the peer-reviewed date when there is one, and keep the earlier preprint in `maturity` and `source_evidence`.

Format, and only these formats:

- `YYYY-MM-DD` when the day is stated
- `YYYY-MM` when only the month is stated
- `YYYY` when only the year is stated

If you cannot find a date in the source, omit `publication_date`. Leave the clue in `maturity` (for example `Preprint (bioRxiv Mar 2026)`). Do not invent a month or a day. The site can parse a year or a month back out of `maturity` as a fallback, but that parser is a temporary aid, not a substitute for the field. Backfill `publication_date` on the existing records.

`maturity` stays a short provenance line: `Peer-reviewed (Genetics 2026)`, `Preprint (medRxiv Aug 2026)`, `Peer-reviewed protocol (STAR Protocols 2026)`. The fallback parser reads a `Mon YYYY` or a year out of this string, so keep that shape when you know it.

## Fields the site reads

Missing any required field breaks the page for that record. Keep the names exactly.

| Field | Required | How the site uses it |
|---|---|---|
| `innovation_id` | yes | Stable identity. Never reuse or renumber. Next id continues the sequence (`DON-2026-040`, …). |
| `name` | yes | Title on the featured card, the list, the chart, and the hero. |
| `description` | yes | The summary under the title. One or two sentences from the source. |
| `investigators` | yes | Array. `name` and `affiliation` are shown. Include the lead at minimum. |
| `originating_lab` | yes | Shown on the card and on every row. |
| `category` | yes | Free text, shown as-is (`protocol/method`, `instrument/device`). Keep it short. |
| `domain` | yes | Controlled value. Drives color, the hero clusters, and the domain filter. See below. |
| `source_evidence` | yes | Array of absolute `http(s)` URLs. Shown as links. The hero node grows with the count, so link the real sources and do not pad it. |
| `lead_don_status` | yes | `core`, `affiliate`, or `external/co-author only`. Drives the hero counts and the Core-led / Affiliate-led / External chip. Bucket is by prefix: `core…`, `affiliate…`, anything else is external. |
| `discovery_date` | yes | The day you first recorded it. Stored, not shown. |
| `publication_date` | expected | Shown and used for sort order. See above. |
| `technical_advantage` | expected | Shown as a Scout note. On the featured card, text split on `;` becomes up to three chips, so write two or three short clauses separated by semicolons when there is more than one advantage. |
| `maturity` | expected | Provenance line, and the publication-date fallback. |
| `top10` | yes | Boolean you set. The featured card is the `top10` record with the latest `publication_date` (higher `scientific_utility.score` breaks a tie). Set it on the core-led records you judge strongest. Do not wait for a person to pick them. |
| `scientific_utility.score` | yes | Number 0–100. Horizontal axis of the landscape. |
| `commercial_potential.score` | yes | Number 0–100. Vertical axis of the landscape. |
| `image_url` | no | A real public image URL (a figure or a lab page). The featured card and the row use it. Omit the field when you do not have one. Do not invent, generate, or hotlink a decorative photo. The site draws a stand-in. |

`scientific_utility` and `commercial_potential` may keep their component subscores. The site plots only `.score`, and it labels both axes as Scout estimates, not verified assessments. Do not drop these two objects. An older note in this folder said not to publish scores; that is superseded for the two summary scores.

## Domain values

Use one of these, exactly:

- `research-tool`
- `software`
- `device`
- `diagnostic`
- `digital-health`

These are the clusters, colors, and filter buttons. Prefer this list. Add a new lowercase hyphenated value only when a record genuinely fits none of them, and then use that same value for every similar record. An unknown value still renders; it gets a fallback color.

## Fields to keep in the bank but not shown

You can continue to fill these. The site ignores them, so do not put reader-facing facts only here.

`problem_solved`, `difference_from_prior`, `confidence`, `translational_pathway`, `status`, `next_action`, `recommended_resources`, `investigator_brief`, `observations_validated`, `inferences`, `lead_home_department`, `stage_code_estimate`, `history`, `related_innovations`, score components other than `.score`.

`related_innovations` stays empty unless you are pointing at another real `innovation_id`. Do not invent relationships, network links, or edges. The hero draws no links on purpose.

## Record shape

Keep the bank object: `schema_version`, `generated`, `scope`, `records`, `changelog`.

- Set `generated` to the date of your run, `YYYY-MM-DD`. The footer prints it as "Updated".
- Append a changelog entry. Do not rewrite older entries.
- Adding `publication_date` and `image_url` does not require a new schema. When you do bump `schema_version`, say why in the changelog.
- Valid JSON only. No comments, no trailing commas.
- Leave existing `innovation_id`s untouched when you retag, rescore, or add `publication_date`.

New record, minimum:

```json
{
  "innovation_id": "DON-2026-040",
  "name": "",
  "description": "",
  "investigators": [{ "name": "", "affiliation": "" }],
  "originating_lab": "",
  "category": "",
  "domain": "research-tool",
  "source_evidence": ["https://doi.org/10.xxxx/xxxx"],
  "technical_advantage": "First advantage; second advantage",
  "maturity": "Preprint (bioRxiv Mar 2026)",
  "publication_date": "2026-03-12",
  "discovery_date": "2026-10-24",
  "lead_don_status": "core",
  "top10": false,
  "scientific_utility": { "score": 0 },
  "commercial_potential": { "score": 0 }
}
```

## Checks before you commit

- Every record has a unique `innovation_id` and at least one working `source_evidence` URL.
- `publication_date` matches a date stated by the source, or the field is absent. It is never the day you ran.
- `domain` is one of the five values unless you deliberately added a new one.
- `lead_don_status` is `core`, `affiliate`, or `external/co-author only`.
- Both scores are numbers from 0 to 100.
- `top10` is a boolean you decided, not a placeholder left for a person.
- `generated` is today's date, and the changelog has a new line.
