# Explorer Offers Collection: Codex Instructions

## Source of truth

- This repository is the maintained Explorer Offers Collection application.
- `ARCHITECTURE.md` describes the current production design.
- The parent workspace contains legacy Python/SQLite and static prototypes. Do not copy behaviour from those implementations unless a task explicitly requests it.
- Keep documentation and implementation changes in the same pull request when behaviour, configuration, integrations, or operating procedures change.

## Application boundaries

- The browser application is `index.html`, `styles.css`, `app.js`, `auth.js`, `site-header.js`, and the confirmation-page files.
- Privileged operations belong in `netlify/functions/`; never expose service secrets in browser code.
- Google Drive, Google Sheets, and stakeholder-domain operations are implemented by `integrations/google-apps-script/Code.gs`.
- Google Drive and Google Sheets are the primary storage and operational register.
- Asana integration is optional and must remain disabled unless `ENABLE_ASANA_TASK_CREATION=true` is deliberately configured.

## Working agreements

- Use Node.js and npm. Install reproducibly with `npm ci`.
- Run the complete test suite with `npm test` after changing application or function code.
- Add or update focused tests under `tests/` whenever behaviour changes.
- Preserve the permanent `accor.com` and `accorplus.com` authentication-domain rules unless the product owner explicitly approves a policy change.
- Treat uploaded offer content, submitter identity, images, PDFs, credentials, and generated archives as potentially sensitive.
- Never commit `.env`, service credentials, access tokens, webhook secrets, production IDs, or customer submission data.
- Do not deploy, rotate credentials, change external-service configuration, or modify production data without explicit human approval.
- Avoid adding production dependencies unless the need and operational impact are documented.

## Mandatory brand compliance

- Always read and follow `docs/brand-style-guide.md` before creating or changing user-facing copy, translations, layouts, components, colours, typography, imagery, icons, spacing, or interaction patterns.
- Inspect `docs/assets/explorer-visual-style-guide.png` for visual-brand work; do not rely on memory or infer missing visual rules.
- Treat the brand guide, approved assets, and existing shared components as the source of truth for the areas they govern.
- Apply the Explorer tone of voice to all user-facing copy: Down to Earth, Explorers at Heart, and Sophisticated Yet Simple. Use British English for English-language copy.
- Preserve brand intent across every supported language, responsive layout, form state, authentication view, and confirmation page.
- Do not introduce a new visual style, alter approved brand assets, or weaken accessibility to achieve a visual effect without explicit product-owner approval.
- If the brand guide, existing implementation, supplied design, or requested change conflict, stop and report the conflict before implementing a subjective resolution.

## Validation

Before declaring an implementation task complete:

1. Run `npm test`.
2. Check that secrets remain server-side and authenticated functions still enforce identity/domain checks.
3. For form changes, manually exercise the affected conditional fields, validation, uploads, translation state, and confirmation flow through Netlify Dev where practical.
4. Update `README.md`, `ARCHITECTURE.md`, or `docs/` when the operational contract changes.
5. Report tests run, manual checks performed, and any remaining risk or unverified external integration.

## Handover references

- Onboarding and local setup: `README.md`
- System design and data flow: `ARCHITECTURE.md`
- Business behaviour: `docs/business-rules.md`
- Mandatory brand and content rules: `docs/brand-style-guide.md`
- Testing: `docs/testing.md`
- Deployment, monitoring, rollback, and incidents: `docs/operations.md`
- Known risks and handover gaps: `docs/known-issues.md`
- Durable technical decisions: `docs/decisions/`

