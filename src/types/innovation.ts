/**
 * Types mirroring data/innovation_bank.json (schema 1.2, with the 1.3 fields
 * described in docs/grok.md marked optional until the Scout backfills them).
 * Only fields the site reads are typed strictly; everything else is preserved
 * via the index signature so the Scout can add fields without breaking the build.
 */

export interface Investigator {
  name: string;
  affiliation: string;
  don_role?: string;
  authorship_role?: string;
  atlas_verified?: boolean;
}

export type DatePrecision = 'day' | 'month' | 'year' | 'unknown';

export interface ScoreBlock {
  score: number;
  [component: string]: number;
}

export interface InnovationRecord {
  innovation_id: string;
  name: string;
  description: string;
  investigators: Investigator[];
  originating_lab: string;
  /** Free-text category, e.g. "protocol/method", "algorithm/software". Normalize before display. */
  category: string;
  /** Controlled vocabulary: research-tool | software | device | diagnostic | digital-health */
  domain: string;
  source_evidence: string[];
  problem_solved?: string;
  technical_advantage?: string;
  difference_from_prior?: string;
  maturity?: string;
  stage_code_estimate?: string;
  confidence?: string;
  translational_pathway?: string;
  status?: string;
  next_action?: string;
  /** Date the Scout first recorded the innovation. Not a publication date. */
  discovery_date: string;
  /**
   * When the work was published. ISO: YYYY, YYYY-MM, or YYYY-MM-DD.
   * Peer-reviewed date when one exists, otherwise the preprint/protocol posted date.
   * Superseded by `first_public_date` when that field is present.
   */
  publication_date?: string;
  /**
   * Earliest reliably documented public disclosure. ISO: YYYY, YYYY-MM, or
   * YYYY-MM-DD. The observation window filters on this field (falling back to
   * `publication_date`, then a year/month parsed from `maturity`).
   */
  first_public_date?: string;
  /** How precise `first_public_date` is. Inferred from the string format when absent. */
  date_precision?: DatePrecision;
  /** When the Scout first identified the record. Never shown as a publication date. */
  first_seen_at?: string;
  /** Most recent Scout review of the record. */
  last_checked_at?: string;
  /** Optional public image URL. The featured card renders it when present. */
  image_url?: string;
  /** Scout-selected spotlight flag. The featured card is the latest-published top10 record. */
  top10?: boolean;
  last_review_date?: string;
  /**
   * Legacy leadership flag from the DoN pilot: core | affiliate | external/co-author only.
   * Kept internally; the general interface no longer shows it. Until
   * `lead_department_id` is populated, `core` is how the site identifies DoN-led work.
   */
  lead_don_status: string;
  lead_home_department?: string;
  /** Department that leads the work (e.g. "don"). Preferred over `lead_don_status` when present. */
  lead_department_id?: string;
  /** Departments that participate without leading. Participation is not leadership. */
  participating_department_ids?: string[];
  /** Scout estimate, 0–100. Plotted on the innovation landscape and labeled as an estimate. */
  scientific_utility?: ScoreBlock;
  /** Scout estimate, 0–100. Plotted on the innovation landscape and labeled as an estimate. */
  commercial_potential?: ScoreBlock;
  [key: string]: unknown;
}

export interface ChangelogEntry {
  date: string;
  version?: string;
  note?: string;
  [key: string]: unknown;
}

export interface InnovationBank {
  schema_version: string;
  generated: string;
  scope: string;
  records: InnovationRecord[];
  changelog?: ChangelogEntry[];
  [key: string]: unknown;
}
