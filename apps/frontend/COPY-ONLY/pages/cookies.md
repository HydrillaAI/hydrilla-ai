# Page: /cookies

| Field | Value |
|---|---|
| Route | `/cookies` |
| Status | Rename (was `/cookie-policy`) and full rewrite of the legal text (24 Oct 2026). Lawyer review before launch. |
| Title (absolute, do not append the template suffix) | Cookie Policy \| Hydrilla AI |
| Meta description | How Hydrilla uses essential session cookies, preferences, and analytics on hydrilla.ai, and how you can manage them. |
| OG title | Cookie Policy |
| H1 | Cookie Policy |
| Canonical | `https://hydrilla.ai/cookies` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Legal template: kicker, H1, effective-date line, a summary box, then numbered sections, each H2 with the id given in its label, and an "On this page" table of contents built from the H2s. Bracketed placeholders such as [LEGAL ENTITY NAME] are facts Rishi and counsel must supply (`VERIFY-LIST.md` section I). Render them as-is on a local build, but never deploy a legal page that still contains a bracketed placeholder: stop and report. A lawyer reviews these pages before launch. Move the page to `/cookies`, add the 301 from `/cookie-policy` (see `routing.md`), and remove any reversed `/cookies` → `/cookie-policy` rule in the same deploy.

## Page copy (render only what is between the markers; `**[Section …]**` labels are structure, not text)
<!-- COPY:START -->
**[Section 0: Header]**

Kicker: Legal

# Cookie Policy

Date line: Effective [EFFECTIVE DATE] | Hydrilla Legal

This Cookie Policy explains how Hydrilla AI uses cookies and similar technologies on hydrilla.ai and in the Hydrilla workspace, what each category does, and how you can control them. It should be read together with our [Privacy Policy →](/privacy), which explains how we handle personal information more generally.

**[Section 1: What cookies are, anchor #what-are-cookies]**

## 1. What cookies are

Cookies are small text files that a website stores in your browser. Similar technologies, such as local storage and session storage, keep information on your device in the same way. Together they let a site keep you signed in, remember your settings, and understand how it is used. In this policy, "cookies" covers all of these technologies.

Some cookies are set by us (first-party cookies). Others are set by service providers that help us run the site (third-party cookies), and those providers act on our behalf.

**[Section 2: How we use cookies, anchor #categories]**

## 2. The cookies we use

We keep our use of cookies small and focused on signing in, the workspace, and reliability. We do not use advertising cookies, and we do not allow third parties to use cookies on our site to build advertising profiles [CONFIRM NO ADVERTISING COOKIES].

| Category | What it does | Provider | Can you switch it off? |
|---|---|---|---|
| Strictly necessary | Keeps you signed in, secures your session, and gives you access to your workspace | Hydrilla AI and [AUTHENTICATION PROVIDER] | No, the Service cannot work without it |
| Functional | Remembers workspace settings such as the viewport, theme, and the local Bridge connection state | Hydrilla AI (local storage) | Yes, through your browser, but settings will reset |
| Analytics | Measures reliability, page speed, and how features are used in aggregate, so we can improve the Service | [ANALYTICS PROVIDERS] | Yes |

A current list of the individual cookies, their providers, and how long each one lasts is available at [COOKIE LIST].

**[Section 3: Your choices, anchor #your-choices]**

## 3. Your choices

Where the law requires consent, such as in the European Economic Area and the United Kingdom, we ask before setting cookies that are not strictly necessary [CONFIRM CONSENT BANNER]. Your choice can be updated whenever you like through [COOKIE SETTINGS LINK], and saying no to analytics cookies leaves every feature of the Service working.

Your browser settings also let you block or delete cookies. Most browsers let you refuse new cookies, delete existing ones, or alert you before a cookie is stored. If you block strictly necessary cookies, you will not be able to sign in or use the workspace. Browser "Do Not Track" signals are not consistently defined, so we rely on the choices above instead [CONFIRM DO NOT TRACK HANDLING].

**[Section 4: Plugins and API, anchor #plugins]**

## 4. Plugins, the MCP server, and the API

Our plugins, the MCP server, and the REST API run outside your browser. They authenticate with your account sign-in or an API key, as described on [integrations →](/integrations#sign-in). When you sign in to a plugin through the browser, the strictly necessary cookies above are used for that sign-in. Information the plugins and API send is handled as described in our Privacy Policy.

**[Section 5: Changes, anchor #changes]**

## 5. Changes to this policy

We will update this policy when the cookies we use change, and post the new version here with a new effective date. If we add a category that needs your consent, we will ask for it again.

**[Section 6: Contact, anchor #contact]**

## 6. Contact

Questions about cookies or browser storage? Email founders@hydrilla.ai, or write to [LEGAL ENTITY NAME], [REGISTERED ADDRESS].
<!-- COPY:END -->

## CTAs
None.

## Internal links on this page
- `/cookies`
- `/integrations#sign-in`
- `/privacy`
- `/terms`
