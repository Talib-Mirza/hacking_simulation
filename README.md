# Signal Zero — The Meridian Protocol

An immersive, story-led cybersecurity learning app built with React, TypeScript, and Vite. You arrive at Meridian knowing nothing about security. A forgotten relay, a familiar enemy called The Choir, and the city’s emergency communications draw you into your first investigation.

## Run

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

The development server uses port 5173 by default. `npm run build` checks TypeScript and produces a static site in `dist/`. `npm run preview` serves that production build. No backend, API keys, account, external fonts, or paid tool subscriptions are required.

## Open without a server

Run `npm run build:standalone` to create `release/Signal-Zero.html`. Download or copy that single file and open it directly in Chrome or Edge. It contains the app, story, tools, styles, icons, and fonts; no install or internet connection is needed to play. Keep the file at the same location to retain its browser-local progress. Run `npm run test:standalone` after building to verify offline loading, the first mission, supervisor reactions, and saved progress without any network access. The managed cloud Chromium blocks `file://` navigation, so this check fulfills the single HTML document in memory at a test origin with network access disabled; direct file-origin storage behavior depends on your browser.

## How it plays

Start with **Begin operation** in the command center. Read your assignment and enter the field. Investigate a real-feeling fictional artifact rather than copying an answer into a completion box. Mira observes meaningful actions: resolving a host, opening a hidden path, comparing two invoices, inspecting a packet, correlating a successful session, or reviewing a code diff. After a short delay she responds in your secure channel and gives you the next lead. Most discoveries lead straight to new instructions while you keep exploring. At seven consequential moments, you send a practical decision to the secure channel. Mira’s response explains the reasoning and moves the story forward.

Only relevant tools appear. Evidence is captured as you investigate; there is no separate “record finding” gate. Terminal commands permit equivalent discovery methods where supported. Optional hints and a field guide are available. The two reporting operations ask you to make actual triage and handoff decisions.

Progress and evidence persist in this browser’s local storage. The case file can be exported as text. Settings provide optional sound and a confirmed restart. Progress does not sync between browsers or devices.

## Act I

| Operation | Investigation                  | Main concepts                                    |
| --------- | ------------------------------ | ------------------------------------------------ |
| 01        | A seat at the table            | Scope, permission, CIA triad, evidence           |
| 02        | The room behind the room       | Linux, files, permissions, privilege             |
| 03        | A name in the static           | DNS, addresses, routing, TCP/UDP                 |
| 04        | The door left open             | Ports, Nmap, services, attack surface            |
| 05        | Someone else’s map             | Passive reconnaissance and indexed exposure      |
| 06        | The page nobody linked         | HTTP, TLS, headers, robots.txt                   |
| 07        | An anonymous invitation        | FTP, encryption, anonymous access                |
| 08        | A conversation in fragments    | Packet captures, filters, privacy                |
| 09        | Borrowed identity              | Sessions, cookies, authentication, authorization |
| 10        | The wrong envelope             | IDOR/BOLA and ownership boundaries               |
| 11        | When words become instructions | SQL injection, XSS, command injection            |
| 12        | The commit that stayed         | Git history, exposed secrets, supply chain       |
| 13        | A number isn’t a verdict       | CVE research, conditions, patch verification     |
| 14        | A familiar voice               | Phishing, headers, SPF/DKIM/DMARC                |
| 15        | A fingerprint, not a promise   | Hashes, signatures, trusted releases             |
| 16        | The sky has doors, too         | Cloud IAM, storage policies, segmentation        |
| 17        | 03:17                          | Detection, logs, correlation, timelines          |
| 18        | Hold the line                  | Containment, recovery, preserving service        |
| 19        | What matters first             | Risk, uncertainty, remediation, retesting        |
| 20        | Leave a light on               | Reporting, disclosure, defensible handoff        |

The field guide adds a threat-surface atlas for wireless and VPNs, physical and mobile endpoints, web/API controls including CSRF and SSRF, identity lifecycle, containers, backups, coverage, and operational response. These are introductory reference briefings, not separate full labs. Advanced exploitation and Act II are outside the current release.

## The lab boundary

The terminal, browser, exposure index, CVE catalog, source mirror, traffic analyzer, inbox, and report builder are local simulations. They do not execute shell commands, open remote websites, run SQL, send messages, or contact the real services they resemble. All hosts and identities are fictional `.test` artifacts. The CVE reference is a curated historical example, not a live vulnerability feed. The simulator deliberately teaches the difference between observed exposure, a hypothesis, and a confirmed finding.

## Validate

```sh
npm run build
npm test
```

Playwright exercises the complete 20-operation campaign sequentially, including all tools, scope rejection, locked chapters, supervisor observation, incorrect decisions, persistence, and exported evidence. The cloud environment has Chromium at `/usr/bin/chromium`. Elsewhere set `CHROMIUM_PATH` to a compatible system Chromium executable, or install Playwright Chromium with `npx playwright install chromium` (the test configuration uses the bundled browser when the system path is absent).

## Project map

- `src/content.ts` — hand-authored story, lessons, decisions, glossary, and threat atlas.
- `src/App.tsx` — narrative state, delayed handler reactions, tool unlocks, case file, local persistence.
- `src/components/LabTools.tsx` — eight fictional, interactive tool experiences.
- `src/lib/simulator.ts` — deterministic terminal interpreter; no command execution or network calls.
- `src/components/NetworkMap.tsx` — animated schematic of Meridian’s training network.
- `tests/campaign.spec.ts` — full narrative integration test.

## Publish with GitHub Pages

The `.github/workflows/pages.yml` workflow builds and deploys pushes to `main`. The app uses relative asset paths, so it works at a repository subpath as well as a custom domain. In repository **Settings → Pages**, select **GitHub Actions** as the build source. The workflow then publishes the built `dist/` artifact. No application secrets or backend are needed.
