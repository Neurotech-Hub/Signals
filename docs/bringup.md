# Signals — Website Implementation Spec

## Overview
Build **Signals**, a modern, single-page dashboard highlighting publicly disclosed neuroscience innovations emerging from the St. Louis research community.

**Tagline:** Neuroscience innovation emerging from St. Louis neuroscience.

The website is an independent, experimental discovery platform powered by an automated Innovation Scout—not an official WashU publication or comprehensive institutional record.

## Design Direction
Use the latest approved mockup as the primary visual reference.

- Modern, clean, scientific, and editorial.
- Strong contrast between a **dark, immersive hero** and **light content area**.
- Navy backgrounds, vibrant blue/purple/teal/orange accents, subtle glows.
- Contemporary sans-serif typography, generous whitespace, restrained UI elements.
- Smooth, purposeful animations. Avoid conventional enterprise dashboard aesthetics.

## 1. Header and Logo
- Lowercase **signals** wordmark, no standalone period.
- Integrate a small purple/blue dot immediately after the final "s", surrounded by concentric circles.
- Rings should be centered precisely on the dot and animate outward using CSS, fading as they expand.
- Build the logo using text and SVG/CSS rather than raster images.
- Minimal navigation using anchors to sections on the same page.

## 2. Interactive Hero
Dark navy, approximately 450–550px tall on desktop.

**Left:** Logo/title, tagline, short introduction, archive metrics, and scroll CTA.

**Right:** Beautiful, interactive visualization of the innovation archive.

- Each innovation represented by a node.
- Group nodes by normalized research category/domain.
- Color-coded clusters with subtle ambient glows.
- Hover reveals innovation title; click opens a detail popover.
- Allow gentle motion and subtle hover interactions.
- All nodes and category counts must originate from the actual dataset.
- No fabricated relationships, network links, or scores.

The hero should feel like an interactive scientific visualization, not a static illustration.

## 3. Innovation Feed
White background, immediately below the hero.

**Main column (~65–70%):**
- Section title: **Latest discoveries**
- One prominent featured innovation with an image when available.
- Remaining innovations displayed as compact editorial entries.
- Each entry includes title, brief summary, investigator, category, source/publication information, and links.
- Include short **Scout insights** describing technical advantages or potential applications.
- Category filters, search, and progressive loading.
- Expandable details for evidence, potential next steps, and assessments.

**Sidebar (~30–35%):**
- Interactive Scientific Utility × Commercial Potential scatterplot.
- Brief intelligence highlights derived from the records.
- Optional small category-distribution visualization.

Avoid excessive KPI cards and redundant charts.

## 4. Data Integration
Primary source: `innovation_bank.json`.

Use existing fields including:
- `name`, `description`, `investigators`, `category`, `domain`
- `technical_advantage`, `problem_solved`, `translational_pathway`
- `scientific_utility.score`, `commercial_potential.score`
- `confidence`, `lead_don_status`, `source_evidence`, `next_action`

Normalize categories for consistent presentation without modifying the underlying records.

Distinguish publication dates from Scout discovery dates. Do not generate artificial timelines from the initial bulk import.

Scores and commercialization assessments are automated estimates, not verified conclusions.

## 5. Technical Requirements
- React + TypeScript + Vite
- Tailwind CSS
- SVG/D3 or Visx for visualizations
- Static deployment via GitHub Pages
- Responsive desktop/mobile layouts
- Data-driven components that automatically reflect updates to the JSON
- Accessible interactions and `prefers-reduced-motion` support
- Keep animations lightweight and performant

## 6. Editorial Voice
Curious, exploratory, and evidence-based.

Prefer phrases such as "identified by the Scout," "potential application," and "suggested pathway."

Avoid implying endorsement, comprehensive coverage, validated commercialization potential, or official university oversight.

Include a subtle footer disclaimer:

*Signals is an independent project exploring publicly disclosed innovations involving the WashU neuroscience community. Coverage may be incomplete. Not an official Washington University website.*

## Guiding Principle
**Build a beautiful, interactive discovery experience—not a conventional news site or administrative dashboard.**

The experience should emphasize the discoveries themselves, with data visualizations providing context and intelligence without overwhelming the editorial content.