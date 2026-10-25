# Signals — Dashboard Revision Spec

## Objective

Refine the existing **Signals** single-page dashboard to support multiple research departments while retaining the ability to isolate Department of Neuroscience (DoN) innovations.

Address two issues:

1. Remove DoN-specific terminology from the general dashboard.
2. Make the archive's **time-bounded, exploratory coverage** immediately apparent.

Preserve the existing visual identity, animated hero, and editorial discovery feed. This is a refinement, not a redesign.

## 1. Department Scope Selector

Add a subtle segmented control in the top-right header:

`All indexed | Department of Neuroscience`

- Default: `All indexed`
- Selecting DoN updates the URL to `?dept=don`.
- Returning to All indexed removes the `dept` parameter.
- The selection filters the entire page: hero nodes, category counts, headline metrics, discovery feed, and analytical plots.
- Support direct URL loading, browser back/forward navigation, and preservation of other query parameters.

**DoN filtering rules:**
- Initially, `lead_don_status === "core"` identifies DoN-led innovations.
- Extend the schema with `lead_department_id` and `participating_department_ids` to support future departmental Scouts.
- Use `lead_department_id === "don"` once metadata is migrated.
- Retain affiliate/collaborator information internally, but remove "Core-led," "Affiliate-led," and "External/joint" from the general-facing metrics and prominent badges.
- Departmental participation is distinct from departmental leadership; do not conflate them.

Until other departmental datasets are incorporated, "All indexed" means all records in the current Scout archive, not comprehensive coverage of all WashU departments.

## 2. Time Window and Archive Coverage

Make the observation period an explicit part of the hero.

Display a subtle date-range label above the headline metrics:

**PUBLIC RESEARCH · OCT 2024 – OCT 2026**

Add a compact time-window selector:

- Past 12 months
- Past 24 months (default)
- Past 36 months
- All indexed dates

Use `?window=24m`, `?window=12m`, `?window=36m`, and `?window=all`.

Changing the window should filter the hero visualization, discovery feed, metrics, and charts.

The selected period should be visually conveyed through a minimalist date rail or range indicator integrated into the hero. Avoid a prominent dashboard-style date picker.

### Required date metadata

Extend each record with:

- `first_public_date`: Earliest reliably documented public disclosure date.
- `first_seen_at`: Date the Scout first identified the innovation.
- `last_checked_at`: Most recent Scout review.
- `date_precision`: `day`, `month`, `year`, or `unknown`.

Do not treat the initial October 24, 2026 bulk-import date as the research publication date.

Backfill dates from source evidence where possible. Handle unknown or partially known dates explicitly rather than inventing dates. Do not implement misleading historical charts before the metadata is sufficiently complete.

The observation window filters on `first_public_date`; the feed can separately identify recently discovered records using `first_seen_at`.

## 3. Generalize the Hero Metrics

Replace the existing four metrics:

- 39 Innovations
- 18 Core-led
- 5 Affiliate-led
- 16 External/joint

With three scope-independent metrics:

| Metric | Definition |
|---|---|
| **Signals surfaced** | Distinct innovations identified within selected scope and time window |
| **Researchers represented** | Unique investigators associated with matching records |
| **Public sources** | Unique evidence URLs supporting matching records |

Calculate these dynamically from the filtered JSON. Deduplicate investigators and source URLs appropriately.

Display the current observation period alongside the metrics, and show **Last scanned** as small supporting metadata.

Use language such as "identified," "surfaced," or "indexed" rather than implying total institutional output.

## 4. Preserve the Interactive Hero

Retain the existing dark, immersive cluster visualization.

- One node per innovation.
- Group and color by normalized domain.
- Node counts update when scope or date window changes.
- Hover/click reveals innovation details.
- Preserve animation, glow effects, and the existing layout.
- Do not invent relationships between innovations or use decorative nodes that could be mistaken for records.

Retain the **Signals** logo only in the header. The hero should focus on the project tagline:

**Neuroscience innovation emerging from St. Louis neuroscience.**

## 5. Discovery Feed and Analytics

Preserve the current editorial feed, featured discovery, and Scientific Utility × Commercial Potential plot.

Changes:

- All content responds to shared scope/date filters.
- Remove prominent DoN-specific leadership labels from the general feed.
- Keep investigator, originating lab, research domain, source links, and Scout observations.
- Display research publication dates rather than archive-import dates.
- Preserve the distinction between verified source information and AI-generated interpretations.
- Ensure the featured discovery is selected from the currently filtered records.
- Show an appropriate empty state when no records match.

No new pages or major features are required.

## 6. Editorial Framing

Signals is an independent discovery project, not an official institutional inventory.

Use subtle introductory language:

*An evolving collection of publicly disclosed neuroscience innovations identified through automated research scouting.*

Near the time-range control or headline metrics, include:

*Coverage reflects the selected research period and may be incomplete.*

Footer:

*Signals is an independent project exploring publicly disclosed innovations involving the St. Louis neuroscience community. It is not an official Washington University website or a comprehensive record of institutional activity.*

Clearly label scientific utility and commercial potential scores as **Scout estimates**, not independently validated assessments.

## 7. Implementation

- Retain React, TypeScript, Tailwind CSS, and the current component architecture.
- Continue using `innovation_bank.json` as the primary data source.
- Centralize scope and date filtering in a shared selector or hook.
- Derive all chart data, metrics, and feed entries from the same filtered record collection.
- Keep the dashboard fully functional as a static GitHub Pages application.
- Preserve responsive layouts, accessible controls, and reduced-motion support.
- Do not hardcode archive counts or category totals.

## 8. Acceptance Criteria

- Default dashboard shows all matching indexed innovations.
- `?dept=don` restricts the view to DoN-led innovations (currently 18 before date filtering).
- Returning to All indexed restores the full current archive (39 before date filtering).
- Selected scope and time window survive page refresh.
- All visible metrics, nodes, feed entries, and analytical plots remain synchronized.
- The selected observation window is clear without requiring users to read the methodology.
- No date-based visualization uses the pilot's bulk-import date as a proxy for publication history.
- The general interface does not expose unexplained core/affiliate terminology.
- The site never suggests that its archive represents all institutional innovation.

## Design Principle

**Signals should communicate what the Scout has discovered within a defined observation window—not everything that exists.**

Keep the experience visual, lightweight, exploratory, and inviting. Time and departmental scope should feel like natural lenses on the same evolving collection rather than separate reporting systems.

# Signals — Hero Constellation Rendering Spec

## Objective

Refine the existing Signals hero visualization to match the approved visual reference.

**The current nodes look too much like colored balls. They should resemble luminous cosmic signals—small, bright points radiating soft light into a dark atmospheric field.**

Preserve the existing data mapping, layout, interactions, and category groupings. This is a visual refinement, not a redesign.

## 1. Visual Style

Target a scientific constellation aesthetic:

- Bright, star-like cores surrounded by diffuse colored light.
- Subtle atmospheric haze surrounding each domain cluster.
- Thin, translucent connecting lines.
- Small scattered particles and occasional starbursts.
- Deep navy background with understated gradients.
- Slow, organic animations.

Avoid glossy spheres, opaque bubbles, thick outlines, strong 3D shading, or cartoon-like nodes.

## 2. Node Rendering

Each innovation node should contain multiple concentric visual layers.

| Layer | Appearance | Suggested size |
|---|---|---|
| Core | Bright, nearly white center tinted by category | 2–8px radius |
| Inner halo | Saturated colored glow | 2–3× core radius |
| Outer bloom | Large, diffuse transparent glow | 4–8× core radius |
| Starburst | Optional faint radial streaks | Major nodes only |

Suggested implementation:

```tsx
<g className="signal-node">
  <circle className="glow-outer" r="30" />
  <circle className="glow-inner" r="15" />
  <circle className="signal-core" r="5" />
</g>
```

```css
.signal-core {
  fill: var(--node-color);
  opacity: 0.95;
}

.glow-inner {
  fill: var(--node-color);
  opacity: 0.4;
  filter: blur(7px);
}

.glow-outer {
  fill: var(--node-color);
  opacity: 0.15;
  filter: blur(20px);
}
```

Use SVG filters or Canvas radial gradients as appropriate. Gradients should fade smoothly to full transparency.

**Important:** Only the innermost core should have a relatively crisp boundary. Everything outside it should appear as emitted light.

## 3. Atmospheric Cluster Glows

Behind each research-domain cluster, render a large, feathered radial glow.

Suggested palette:

| Domain | Color |
|---|---|
| Research tools | `#9565FF` |
| Software / AI | `#3B91FF` |
| Devices / Neurotechnology | `#FF9D32` |
| Behavior / Ethology | `#25D9C5` |
| Diagnostics / Translation | `#FF5F9C` |
| Imaging | `#F5C34D` |

Cluster haze:

- Diameter approximately 1.5–2× the node cluster.
- Opacity 0.08–0.18.
- Strong Gaussian blur or radial gradient.
- No visible hard boundary.
- Slight variations in shape and intensity.

The clusters should resemble illuminated regions of space rather than colored containers.

## 4. Connecting Lines

Introduce faint connections to create a constellation effect.

- Stroke width: 0.5–1px.
- Opacity: 0.05–0.20.
- Prefer curved or gently flowing paths.
- Slight glow on selected connections.
- Brighten nearby connections on node hover.

**Data integrity:** Connections must not imply actual research collaborations or relationships unless supported by the dataset. Decorative lines should be treated as visual texture, not analytical edges.

Avoid dense, uniformly connected graph structures.

## 5. Supporting Particles

Add subtle secondary particles surrounding clusters.

- Radius: 0.5–2px.
- Vary brightness and opacity.
- Use category colors with occasional white highlights.
- Add faint bloom to selected particles.
- Distribute organically, avoiding regular grids.

These particles are decorative only and should remain visually distinguishable from interactive innovation nodes.

Do not include decorative particles in hover detection or record counts.

## 6. Background

Use multiple atmospheric layers:

```css
.hero {
  background:
    radial-gradient(
      ellipse at 65% 45%,
      rgba(24, 68, 150, 0.18),
      transparent 60%
    ),
    radial-gradient(
      ellipse at 90% 80%,
      rgba(96, 35, 130, 0.10),
      transparent 55%
    ),
    #061225;
}
```

Additional treatment:

- Subtle vignette.
- Sparse, faint background stars.
- Optional extremely low-opacity noise texture.
- Avoid obvious repeating patterns.
- Maintain sufficient text contrast.

## 7. Animation

Use restrained, asynchronous motion.

### Nodes
- Slow glow pulsation: 3–7 seconds.
- Brightness variation: approximately ±15%.
- Minimal positional drift: 1–3px.
- Different animation delays per node.

### Clusters
- Very slow atmospheric brightness fluctuations.
- No obvious movement of cluster boundaries.

### Particles
- Occasional subtle twinkles.
- Avoid continuous rapid motion.

### Hover
- Increase core brightness.
- Expand halo approximately 15%.
- Highlight local connections.
- Show the existing innovation tooltip.

Avoid scaling nodes into large bubbles.

Example:

```css
@keyframes signalPulse {
  0%, 100% {
    opacity: 0.18;
    transform: scale(1);
  }

  50% {
    opacity: 0.28;
    transform: scale(1.06);
  }
}

.glow-outer {
  animation: signalPulse 5s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
```

Respect `prefers-reduced-motion`.

## 8. Implementation

Preferred stack: **React + TypeScript + SVG or Canvas**.

For best visual quality, consider a hybrid renderer:

- **Canvas:** Ambient glow, particles, background connections.
- **SVG:** Data nodes, labels, interactive hit targets.
- **HTML:** Tooltips and detail cards.

Use radial gradients and additive compositing (`screen` or `lighter`) selectively for luminous effects.

Maintain device-pixel-ratio scaling for Canvas and ensure the visualization remains responsive.

Avoid excessive DOM nodes, expensive full-scene blur filters, or unnecessarily high animation frame rates.

## 9. Acceptance Criteria

- Nodes visually resemble glowing stars, not spheres.
- Each node has a bright core and multiple soft glow layers.
- Domain clusters have noticeable but restrained atmospheric haze.
- The visualization retains the approved category colors.
- Supporting particles introduce visual richness without misrepresenting data.
- Connecting lines remain subtle.
- Hover interactions remain functional.
- The hero feels alive without distracting motion.
- Performance remains smooth on desktop and mobile.
- Reduced-motion accessibility is preserved.

## Design Principle

**Render light, not objects.**

The constellation should look like a field of scientific signals radiating into darkness—not a collection of colored balls floating in space.

Match the approved reference's depth, luminosity, atmospheric glow, and visual restraint while preserving the actual innovation data.

# When Complete
- Update ./docs/grok.md with new rules for GrokBot
- Change "Latest Discoveries" to "Latest Innovations"
- We need the "The innovation landscape" axes to autofit the data--it's currently too clustered.