# Explorer Brand Style Guide

## Status and scope

This guide is mandatory for all user-facing application work. It incorporates the supplied Explorer Tone of Voice reference and the supplied Explorer visual style guide, reproduced in this repository at [`docs/assets/explorer-visual-style-guide.png`](assets/explorer-visual-style-guide.png).

The visual source governs approved logos, minimum logo widths, iconography, member-card artwork, colour roles, and information-state treatments. The application implementation and approved design specifications provide the corresponding web tokens, typography, component dimensions, responsive behaviour, and accessibility requirements.

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

## Visual identity

### Logos

- Use only approved ALL Accor+, ALL Accor+ Explorer, ALL+ Accor, and ALL Accor logo artwork supplied in the visual guide or repository assets.
- Maintain the clear proportions and padding of the supplied artwork. Never redraw, distort, stretch, outline, recolour, or add effects to a logo.
- The horizontal ALL Accor+ Explorer lockup has a minimum rendered width of 78px.
- The stacked ALL Accor+ Explorer lockup has a minimum rendered width of 56px.
- Use white lockups on the approved navy background and navy lockups on light backgrounds; ensure sufficient contrast.
- Do not substitute a text approximation when approved artwork is available.

### Core colour roles

Use the repository CSS custom properties rather than introducing near-duplicate colours:

| Role | Token | Value |
| --- | --- | --- |
| Primary navy | `--accent` | `#050033` |
| Body copy | `--ink` | `#221b1a` |
| Secondary text | `--muted` | `#504d70` |
| Primary hover / success | `--teal` | `#27666e` |
| Information dark | `--info-dark` | `#38326c` |
| Warning | `--warning` | `#f2d166` |
| Error | `--danger` | `#ba1f1a` |
| Offer emphasis | `--offer` | `#d4024d` |
| Surface | `--surface` | `#ffffff` |
| Light information panel | `--panel` | `#f4f2fd` |

- Use navy as the primary brand anchor and teal for successful or completed states.
- Reserve offer pink for offer-specific emphasis, not general decoration.
- Use warning, information, success, error, and offer colours according to their semantic roles.
- Pair semantic colours with text or icons; never rely on colour alone to communicate meaning.
- Preserve accessible foreground/background contrast. Accessibility takes precedence over decorative usage.

### Iconography and imagery

- Reuse the approved iconography and repository sprites, including `assets/offer-icons.svg`, `assets/offer-type-icons.svg`, and `assets/header-icons.svg`.
- Keep icons single-colour where the component system expects `currentColor`.
- Do not replace approved icons with emoji, generic text glyphs, or a visually inconsistent icon library.
- Use the supplied Explorer member-card artwork when a member card is required; do not reconstruct it in HTML or CSS.
- Use imagery that accurately represents the offer and retains the required crop, focal point, and placement dimensions.

### Typography and shape language

- Use Montserrat with the repository fallbacks for application UI.
- Use weights 400-700; do not introduce weight 800.
- Follow the established hierarchy: clear, concise headings; readable body text; compact labels; and visible helper and status text.
- The established component system uses square corners. Do not introduce rounded cards, pills, or controls unless an approved design explicitly requires them.

## Component and interaction consistency

- Reuse `site-header.js`, existing form controls, offer-type tiles, dialogs, confirmation components, icon sprites, and CSS patterns.
- Use approved assets from `assets/`; do not crop brand marks destructively or replace them without approval.
- Extend existing CSS variables, dimensions, spacing rhythms, responsive breakpoints, and interaction states instead of creating a parallel style system.
- Maintain consistent treatment across authentication, the main form, validation and progress states, dialogs, and confirmation pages.
- Verify all supported responsive and right-to-left layouts affected by a change.
- Use motion only when it communicates state or improves comprehension; respect reduced-motion preferences.

The visual source image and existing implementation work together: the image defines brand assets and roles, while the application encodes the approved web implementation. Neither is permission to preserve an accessibility defect or inconsistency. Report and resolve such conflicts explicitly.

## Change checklist

For any user-facing change:

1. Read this guide before implementation.
2. Identify affected copy, languages, states, layouts, and shared components.
3. Reuse established components and assets.
4. Check the three voice pillars and British English where applicable.
5. Verify factual accuracy, accessibility, responsive behaviour, and RTL behaviour where affected.
6. Run automated tests and relevant manual regression checks.
7. Obtain product-owner approval for new visual direction, altered brand assets, or intentional exceptions.

