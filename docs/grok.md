# Signals data contract for the Innovation Scout

You maintain `data/innovation_bank.json`. A developer no longer marks, tags, scores, or approves each innovation by hand. The pipeline is fully AI-driven: you discover the record, fill every field below, and commit the JSON. The site rebuilds from that file. Do not edit the website source, and do not hold a record back waiting for a person to confirm it.

`human_confirmed` may stay `false`. The site does not read it and does not treat it as a gate.

The site imports only `innovation_bank.json`. It does not read `innovation_bank.csv` or `audit_log.jsonl`.

## What changed in the dashboard revision (read this first)

The site now shows the archive through two lenses, both driven by record fields you own:

1. **Department scope** — `All indexed` or one leading department. The URL carries `?dept=<id>` (today the page offers `don`; other registered ids appear once they are added to the site).
2. **Observation window** — past 12 / 24 / 36 months or all indexed dates, anchored to your last run (`generated`). The URL carries `?window=12m|24m|36m|all`; all indexed dates is the default.

Every number on the page is computed from the records that survive both lenses. Nothing is hardcoded. Three things follow for you:

- **Dates decide visibility.** A record with no usable public date is invisible in every bounded window and only appears under "All indexed dates". Backfilling dates is now the highest-value work after discovery itself.
- **Leadership decides department scope.** A department's view shows records that department *leads*, not records it touches. See "Department fields".
- **The pilot's core / affiliate / external labels are no longer shown.** Keep `lead_don_status` in step with whether `don` leads or participates. The public page does not print it.

The bank is schema 1.3. This pass is department classification. Do not renumber ids, do not rewrite dates, and do not edit the website source. A record with no `lead_department_id` still falls back to `lead_don_status === "core"` for the Neuroscience scope only.

## Migration you own (schema 1.3)

Add these fields to every record. Do not renumber ids, do not rewrite history, do not touch unrelated fields.

| Field | Type | Rule |
|---|---|---|
| `first_public_date` | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` | Earliest reliably documented public disclosure. Usually the same value you already put in `publication_date`; copy it over, then correct it if an earlier public version (preprint, protocol, repository release) exists. The window filters on this field. |
| `date_precision` | `day` \| `month` \| `year` \| `unknown` | How precise `first_public_date` is. Matches the format you wrote: day for `YYYY-MM-DD`, month for `YYYY-MM`, year for `YYYY`. Use `unknown` only when you also omit `first_public_date`. |
| `first_seen_at` | `YYYY-MM-DD` | The day you first identified the record. For the pilot import this is `2026-10-24` for every row. It is **never** a publication date and the site never shows it as one. |
| `last_checked_at` | `YYYY-MM-DD` | Your most recent review of this record. Update it every time you re-verify the record. |
| `lead_department_id` | lowercase id | The one department that **leads** the work. Use an id from the registry below. Omit the field (do not write `""`) when the lead is outside Washington University or not on the registry. |
| `participating_department_ids` | array of ids | Departments that participate without leading. A Neuroscience co-author on a Radiology-led paper is `["don"]` here, not in `lead_department_id`. May be `[]`. |

Date fields from steps 1–2 are already on the bank. Do not redo them. This pass is step 3.

1. Copy `publication_date` → `first_public_date` and set `date_precision`. Done. On a new record, `first_public_date` is the earliest public date and `publication_date` prefers peer review. Keep both.
2. Set `first_seen_at` from `discovery_date` and `last_checked_at` from the run date. Done for the pilot import. On a later review, update `last_checked_at` only.
3. Classify `lead_department_id` and `participating_department_ids` on every record using the registry in "Department fields". Do not leave a WashU-led record on the old `lead_don_status` flag alone.
4. Schema `1.3` is already in place. Set `generated`, and append a changelog line that lists each `lead_department_id` you used and how many records carry it.

Do not guess dates. If a source states no date, omit `first_public_date`, set `date_precision: "unknown"`, and leave the clue in `maturity`. An undated record hidden from the default view is correct; an invented date is not.

## Public date, not the day you found it

`discovery_date` and `first_seen_at` say when the Scout found the record. Keep them, do not overwrite them on later reviews, and do not treat them as when the work was published. The site never displays them as a date for the work, and it never uses the October 24, 2026 bulk-import date as a proxy for publication history.

`first_public_date` (falling back to `publication_date`) is the date the site shows, sorts on, and filters the observation window with. Find it in the source.

How to choose it:

1. The earliest public version counts for `first_public_date`: a bioRxiv/medRxiv "posted" date, a protocols.io or Zenodo "published" date, a GitHub release date the source itself states, or the journal's published date if nothing earlier exists.
2. `publication_date` keeps the peer-reviewed date when one exists (the journal's published date, from the article page or Crossref — not the date you retrieved it). When there is no peer-reviewed version the two fields are equal.
3. Keep the earlier preprint in `maturity` and `source_evidence` either way.

Format, and only these formats:

- `YYYY-MM-DD` when the day is stated
- `YYYY-MM` when only the month is stated
- `YYYY` when only the year is stated

Partial dates are handled honestly: a `2025` record is treated as a range (Jan 1 – Dec 31, 2025) and appears in any window that overlaps it. You do not need to pad a month or day to make a record show up.

`maturity` stays a short provenance line: `Peer-reviewed (Genetics 2026)`, `Preprint (medRxiv Aug 2026)`, `Peer-reviewed protocol (STAR Protocols 2026)`. The site can parse a `Mon YYYY` or a year back out of it as a last-resort fallback, so keep that shape when you know it. That parser is a temporary aid, not a substitute for the field.

## Department fields

`lead_department_id` is the filter. It answers one question: which department leads this work? Only that department's scope shows the record. `lead_home_department` is a note for humans. The site does not filter on it.

**One lead.** Set `lead_department_id` to the department of the senior or corresponding author whose lab produced the work. Use exactly one id. When the lead is outside Washington University, or you cannot tell which WashU department leads, omit `lead_department_id`. Do not write `""`.

**Everyone else participates.** Other WashU departments on the paper go in `participating_department_ids`. A Neuroscience co-author on a Radiology-led paper is `lead_department_id: "radiology"` and `participating_department_ids: ["don"]`. Participation never goes in `lead_department_id`.

**Use only these ids.** Lowercase, no spaces. Do not invent another id in this pass. When a real WashU department is missing from the list, omit `lead_department_id`, write the appointment in `lead_home_department`, and name the department in the changelog so it can be registered. The page offers a department as a scope only after that id is registered in the site; classify the records now anyway.

| id | Department |
|---|---|
| `don` | Department of Neuroscience |
| `radiology` | Radiology |
| `neurology` | Neurology |
| `neurosurgery` | Neurosurgery |
| `psychiatry` | Psychiatry |
| `anesthesiology` | Anesthesiology |
| `otolaryngology` | Otolaryngology |
| `ophthalmology` | Ophthalmology |
| `bme` | Biomedical Engineering |
| `medicine` | Medicine |
| `pathology` | Pathology & Immunology |

**Keep `lead_don_status` in step with `don`.**

- `lead_department_id: "don"` means `lead_don_status: "core"`.
- `don` only in `participating_department_ids` means `lead_don_status: "affiliate"`.
- No `don` on the record means `lead_don_status: "external/co-author only"`.

Until a record carries `lead_department_id`, the site still treats `lead_don_status === "core"` as DoN-led. Once `lead_department_id` is set, that field wins.

Write `lead_home_department` as the appointment you actually used, for example `Radiology` or `External (Stanford; Schnitzer lab)`. Do not put "verify", lab parentheticals, or co-author lists in that field. Uncertainty belongs in the changelog, and an uncertain lead stays unset.

"All indexed" means every record in the bank, whatever leads it. It does not claim coverage of every WashU department. Keep that distinction in any text you write.

## Fields the site reads

Missing any required field breaks the page for that record. Keep the names exactly.

| Field | Required | How the site uses it |
|---|---|---|
| `innovation_id` | yes | Stable identity. Never reuse or renumber. Next id continues the sequence (`DON-2026-040`, …). |
| `name` | yes | Title on the featured card, the list, the chart, and the hero. |
| `description` | yes | The summary under the title. One or two sentences from the source. |
| `investigators` | yes | Array. `name` and `affiliation` are shown. Include the lead at minimum. **Researchers represented** counts unique names across the visible records (case- and whitespace-insensitive), so spell a person the same way on every record. |
| `originating_lab` | yes | Shown on the card and on every row. |
| `category` | yes | Free text, shown as-is (`protocol/method`, `instrument/device`). Keep it short. |
| `domain` | yes | Controlled value. Drives color, the hero clusters, and the domain filter. See below. |
| `source_evidence` | yes | Array of absolute `http(s)` URLs. Shown as links. **Public sources** counts unique URLs across the visible records, and the hero node's core grows with the count, so link the real sources and do not pad or duplicate. The Data sources page lists every one of these URLs, grouped by website. There is no separate sources file to edit: add or remove a URL on the record and the page follows. |
| `first_public_date` | expected (1.3) | Shown, sorted on, and used by the observation window. See above. |
| `date_precision` | expected (1.3) | Interprets `first_public_date`. |
| `publication_date` | yes | Peer-reviewed date when one exists; the fallback when `first_public_date` is absent. |
| `first_seen_at` | expected (1.3) | Stored. May later mark recently surfaced records; never shown as a publication date. |
| `last_checked_at` | expected (1.3) | Stored. |
| `lead_department_id` | expected (1.3) | Department scope. One id from the registry above. The department that leads. |
| `participating_department_ids` | expected (1.3) | Stored, internal. Does not put a record into a department's scope. |
| `lead_don_status` | yes (transitional) | `core`, `affiliate`, or `external/co-author only`, kept in step with whether `don` leads or participates. Not displayed. |
| `discovery_date` | yes | The day you first recorded it. Stored, not shown. |
| `technical_advantage` | expected | Shown as a Scout note. On the featured card, text split on `;` becomes up to three chips, so write two or three short clauses separated by semicolons when there is more than one advantage. |
| `maturity` | expected | Provenance line, and the last-resort date fallback. |
| `top10` | yes | Boolean you set. The featured card is the `top10` record with the latest public date **among the records currently visible** (higher `scientific_utility.score` breaks a tie). If no `top10` record is visible, the latest visible record is featured. Set it on the records you judge strongest; do not wait for a person to pick them. |
| `scientific_utility.score` | yes | Number 0–100. Horizontal axis of the landscape. The axes fit the visible points, so outliers stretch the chart. |
| `commercial_potential.score` | yes | Number 0–100. Vertical axis of the landscape. |
| `image_url` | no | A real public image URL (a figure or a lab page). The featured card and the row use it. Omit the field when you do not have one. Do not invent, generate, or hotlink a decorative photo. The site draws a stand-in. |

`scientific_utility` and `commercial_potential` may keep their component subscores. The site plots only `.score`, and it labels both axes as Scout estimates on a 0–100 scale. Do not drop these two objects.

### What the three headline metrics mean

- **Signals surfaced** — number of visible records.
- **Researchers represented** — unique investigator names across visible records.
- **Public sources** — unique `source_evidence` URLs across visible records.

The old Core-led / Affiliate-led / External counts are gone from the page. Do not try to reintroduce them through text fields.

## Domain values

Use one of these, exactly:

- `research-tool`
- `software`
- `device`
- `diagnostic`
- `digital-health`

These are the clusters, colors, and filter buttons. Prefer this list. Add a new lowercase hyphenated value only when a record genuinely fits none of them, and then use that same value for every similar record. An unknown value still renders; it gets a fallback color.

## About the hero visualization

One point per visible record, grouped by `domain`. Point size follows `source_evidence.length`. The faint lines you see inside a cluster are drawn between a point and its nearest neighbours **in the same domain**; they are visual texture and do not come from any field. Nothing in the data draws a line between two records, and you should not add fields to try to. `related_innovations` stays empty unless you are pointing at another real `innovation_id`, and even then the site does not draw it.

The small background particles are decorative and are not records.

## Fields to keep in the bank but not shown

You can continue to fill these. The site ignores them, so do not put reader-facing facts only here.

`problem_solved`, `difference_from_prior`, `confidence`, `translational_pathway`, `status`, `next_action`, `recommended_resources`, `investigator_brief`, `observations_validated`, `inferences`, `lead_home_department`, `lead_don_status` (display), `participating_department_ids`, `first_seen_at`, `last_checked_at`, `stage_code_estimate`, `history`, `related_innovations`, score components other than `.score`.

## Record shape

Keep the bank object: `schema_version`, `generated`, `scope`, `records`, `changelog`.

- Set `generated` to the date of your run, `YYYY-MM-DD`. It anchors the observation window ("past 24 months" ends at `generated`, not at the visitor's clock) and prints as "Last scanned". A stale `generated` silently shrinks every window, so set it on every run.
- Append a changelog entry. Do not rewrite older entries.
- Bump `schema_version` to `1.3` when you add the migration fields, and say so in the changelog.
- Valid JSON only. No comments, no trailing commas.
- Leave existing `innovation_id`s untouched when you retag, rescore, or add dates.

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
  "first_public_date": "2026-03-12",
  "date_precision": "day",
  "publication_date": "2026-03-12",
  "first_seen_at": "2026-11-02",
  "last_checked_at": "2026-11-02",
  "discovery_date": "2026-11-02",
  "lead_department_id": "don",
  "participating_department_ids": [],
  "lead_don_status": "core",
  "top10": false,
  "scientific_utility": { "score": 0 },
  "commercial_potential": { "score": 0 }
}
```

## Checks before you commit

- Every record has a unique `innovation_id` and at least one working `source_evidence` URL.
- `first_public_date` matches a date stated by the source, or the field is absent with `date_precision: "unknown"`. It is never the day you ran and never the bulk-import date.
- `date_precision` matches the format of `first_public_date`.
- `publication_date` is the peer-reviewed date when one exists; otherwise it equals `first_public_date`.
- `lead_department_id` is one id from the registry, and only on records that department leads. Omit it for an external or uncertain lead. Co-author departments are in `participating_department_ids`.
- `lead_don_status` matches the `don` rule: `core` when `don` leads, `affiliate` when `don` only participates, `external/co-author only` otherwise.
- `domain` is one of the five values unless you deliberately added a new one.
- Both scores are numbers from 0 to 100.
- `top10` is a boolean you decided, not a placeholder left for a person.
- Investigator names are spelled consistently across records.
- `generated` is today's date, and the changelog has a new line.
