# VERIFY list: what Rishi still needs to confirm

None of these items appear as markers in the page copy. Each unconfirmed claim was either **cut** (not core) or **reworded to something safe and true**. Confirming an item lets you add the detail back. "Cut" = removed from the copy; "Safe" = kept in a softer, true form.

## A. Homepage and brand
1. **Homepage Free-plan lines contradict `/pricing`.** The homepage still says "GLB export" and "No card required" for Free. `/pricing` says every plan exports every format and makes no card claim for Free (the trial needs a card). The homepage body is frozen (Rishi), so they stay for now. Decide whether to fix them later.
2. **Optional homepage JSON-LD fix** (hidden, no visible change): make Hawan Research Labs a `subOrganization` of Hydrilla AI. Yes or no? (`seo-geo/schema.md` section 2)
3. **"AI for 3D":** where else is it set (brand assets, OG images, social bios, favicon)? The new header drops it; the homepage body keeps anything inside it.
4. **Legal meta descriptions** for `/privacy`, `/terms`, `/cookies` drop "Hydrilla AI". OK to ship?

## B. Water Agent
5. Capabilities **cut** until confirmed: reference images as input, one art style held across a set, variations, pieces named and grouped.
6. **Safe:** "plans the set with you before it builds" (was "lists every piece before it builds"); step 2 "Review the plan and adjust it" (was "add, cut, or rename pieces").
7. Real UI step names for `/docs#water` (copy says it opens in the Hydrilla app or through the plugin in Blender, Unity, Unreal, or Godot).
8. Keep the `/features` close line "New models will be available through Water Agent as they arrive."?

## C. Pricing
9. Hourly Pro window length. **Safe:** "a chosen daily window".
10. Plan-switching rules (not on the page).
11. REST API on plans other than Pro (the API row was **cut**; the page only says "Pro includes REST API access").
12. Pro seats and 10,000 API calls a month (**cut** from the table).
13. Checkout slugs `hourly` and `hourly-pro`.

## D. BlueFox and research
14. Spec numbers **cut** from `/bluefox`: triangle count, texture size, generation time, quality levels, release date.
15. PBR map names (**cut**; copy says "PBR maps").
16. Wording "generally available to everyone in Hydrilla", the limits line, and the intended-use row (kept from the live model card).
17. **Safe:** "Select one part in Studio and leave the rest alone" (was "rework one part in your DCC").
18. Model card: the Evaluation row was **cut**; confirm the "What we work on" focus line.
19. Hugging Face repo URL (`huggingface.co/Hydrilla/BlueFox3D`) is used in schema `sameAs` and the `/research` link (label "Hugging Face"). Update both if the repo is renamed.

## E. Product, integrations, API, docs
20. Official name "Studio" for the signed-in app.
21. Image to 3D: image plus a prompt (the section was **cut**); drawings and concept art; multi-view input; accepted file types and sizes (the checklist bullet was **cut**).
22. Whether Edit prompts in text to 3D cost credits (no claim made).
23. Plugin supported versions (**cut** from date lines), download URLs (use the live ones), Blender troubleshooting steps, the sign-in matrix per tool, and Bridge OS support.
24. Unity and Unreal: the line about where Studio sends land was **cut**. Unity render pipeline support.
25. MCP: the tools list was **cut**; supply the exact config and launch command.
26. API: base URL, auth header, rate limits, and SDKs (the table was **cut**), the API docs host (buttons now point to `/docs`), a real request sample, and whether keys are self-serve on every plan.
27. Docs: UI step names; **Safe:** "your account shows what is left" (was "the Usage page"); whether exports convert units or axis.

## F. Solutions and enterprise
28. Games: character generation and variations (both **cut**).
29. Enterprise: per-seat sign-in (**cut**), concurrency terms, credit pools and queue priority terms, pipeline support scope, retention (**cut**), invoicing (Q&A **cut**), and written data terms (row **cut**).
30. XR and product pages: the format lines were replaced with a link to `/features#exports`, following "don't mention formats". The blog import guide keeps its GLB or FBX how-to as technical import detail. OK?

## G. Company, legal, support
31. Legal entity name, founding year, and base (**cut** from `/about`).
32. Team: the spelling "Rishik Kalyan" and every role.
33. Careers: the go-to-market row was **cut**. Show the "We're hiring" badge only while roles are open.
34. Scope of "no training on customer data" (`/security` names prompts, reference images, and generated models).
35. Terms: the ownership wording, and an `id="ownership"` anchor. The FAQ no longer says "personal and commercial work".
36. Account deletion process and timeline; support response time (no claim made).
37. Changelog: the 24 Aug 2026 plugins and Bridge entry was **cut** (unconfirmed date); confirm the 19 Aug 2026 entries.

## H. Assets and publish checks
38. Real captures for every `Visual:` slot: Studio, Water Agent session, BlueFox viewer, plugin screenshots, solution stills.
39. Re-check the compare pages on the publish date. "Hyper3D, from Deemos" was **cut**; Tripo's model version isn't named.
40. Blog publish dates (author set to "Hydrilla Team").
41. Which brand marks may be shared on `/brand`.
42. Whether http already redirects to https.
43. Plugin, MCP, and REST API pages still say "API key" (Hydrilla's own `hyd_live_` keys for sign-in). There's no key wording near Water Agent anywhere. OK?
