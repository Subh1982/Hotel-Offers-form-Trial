# Explorer Brand Style Guide

## Status and scope

This guide is mandatory for all user-facing application work. It incorporates the supplied Explorer Tone of Voice reference and records how brand consistency must be maintained in this repository.

The supplied reference governs voice and copy. It does not define a complete corporate visual identity system with official colour, typography, spacing, or component tokens. Until an approved visual identity guide is added, preserve the established application styles, shared components, and approved assets rather than inventing new brand rules.

If a requested change conflicts with this guide, an approved design, accessibility, or the existing application system, report the conflict and request product-owner direction before proceeding.

## Brand identity

Explorer communicates:

- a sense of community;
- the spirit of exploration; and
- exclusive access to elevated experiences.

The experience should celebrate thoughtfully designed travel, inspire seamless journeys, and recognise members as discerning explorers seeking more from every experience.

## Tone of voice

All user-facing copy must express all three pillars.

### Down to Earth

Warm, inviting, and human.

- Speak like a trusted companion, not a corporation.
- Make readers feel valued, understood, and included.
- Use welcoming, inclusive, naturally conversational language with a premium character.
- Avoid impersonal formality, forced friendliness, and slang.

### Explorers at Heart

Lively, engaging, and evocative.

- Inspire curiosity and discovery.
- Bring travel experiences to life with controlled sensory detail.
- Address the reader directly as “you” where natural.
- Avoid unclear over-description and cleverness at the expense of meaning.

### Sophisticated Yet Simple

Direct, elevated, and clear.

- Communicate concisely and foreground tangible benefits.
- Prefer short, impactful sentences and precise value-led language.
- Avoid long or complex sentences, generic claims, vague wording, and an aggressively sales-driven tone.

## Content priorities

Apply this order when priorities compete:

1. Brand tone
2. Clarity
3. Literal accuracy

Copy must still be factually correct. The priority order means localisation may be naturally rewritten to preserve meaning and tone; it never permits inventing benefits, prices, availability, inclusions, or terms.

## Accessibility and clarity

- Make content understandable on first reading, including for people unfamiliar with Explorer.
- Avoid internal jargon, unexplained brand references, and assumptions of prior knowledge.
- Clarify meaning without losing concision or premium positioning.
- Keep labels, instructions, errors, and status messages action-oriented and unambiguous.
- Never trade semantic structure, keyboard usability, readable contrast, focus visibility, or clear error handling for visual styling.

## Writing principles

- Communicate the member value immediately.
- Focus on what the member gains.
- Maintain emotional connection and premium positioning.
- Use concise, purposeful sentences and evocative but controlled language.
- Write English-language UI and marketing copy in British English.
- Retain material facts and mandatory legal or operational meaning.
- Do not add unsupported superlatives, urgency, scarcity, guarantees, or inclusions.

## Vocabulary

Use these ideas naturally and sparingly; do not force them into every message.

- Emotional: unforgettable, meaningful, enriching, welcoming
- Discovery: explore, discover, journey, escape, uncover
- Premium clarity: exclusive, curated, seamless, refined, effortless

Brand vocabulary is inspiration, not filler. Prefer a plain, accurate word when a brand word would sound unnatural or obscure the meaning.

## Localisation

- Localise for meaning and a natural target-language experience rather than translating word for word.
- Preserve the three tone pillars and clarity in every supported language.
- Keep product names, offer facts, dates, prices, URLs, property names, and legal terms accurate.
- Reuse approved terminology from `netlify/functions/translation-glossary.json` where applicable.
- Maintain full translation-key parity when changing shared interface copy.
- Treat generated translations as drafts that remain editable and subject to human review.

## Visual and interaction consistency

Until an approved visual identity specification is committed:

- Reuse `site-header.js`, existing form controls, offer-type tiles, dialogs, confirmation components, icon sprites, and CSS patterns.
- Use approved assets from `assets/`; do not redraw, recolour, stretch, crop destructively, or replace brand marks without approval.
- Extend existing CSS variables, dimensions, spacing rhythms, responsive breakpoints, and interaction states instead of creating a parallel style system.
- Maintain consistent treatment across authentication, the main form, validation and progress states, dialogs, and confirmation pages.
- Verify all supported responsive and right-to-left layouts affected by a change.
- Use motion only when it communicates state or improves comprehension; respect reduced-motion preferences.

Existing implementation is evidence of the current approved application style, but it is not permission to preserve an accessibility defect or inconsistency. Report and resolve such conflicts explicitly.

## Change checklist

For any user-facing change:

1. Read this guide before implementation.
2. Identify affected copy, languages, states, layouts, and shared components.
3. Reuse established components and assets.
4. Check the three voice pillars and British English where applicable.
5. Verify factual accuracy, accessibility, responsive behaviour, and RTL behaviour where affected.
6. Run automated tests and relevant manual regression checks.
7. Obtain product-owner approval for new visual direction, altered brand assets, or intentional exceptions.

