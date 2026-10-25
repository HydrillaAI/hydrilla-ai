# Page: /terms (metadata only)

| Field | Value |
|---|---|
| Route | `/terms` |
| Status | Rename (was `/terms-and-conditions`), metadata only |
| Title (absolute, do not append the template suffix) | Terms of Service \| Hydrilla AI |
| Meta description | The terms for using Hydrilla and BlueFox generation, including accounts, payments, ownership of generated 3D assets, and acceptable use. |
| OG title | Terms of Service |
| H1 | Terms of Service (unchanged) |
| Canonical | `https://hydrilla.ai/terms` (self) |
| Robots | index, follow |
| Schema type | WebPage (full JSON-LD rules in `seo-geo/schema.md`) |

## Layout note
Keep the existing legal layout and the legal text exactly as it is. Move the page to `/terms`, add the 301 from `/terms-and-conditions` (see `routing.md`), and remove today's reversed `/terms` → `/terms-and-conditions` rule in the same deploy where one exists. Add `id="ownership"` to the existing section on ownership of generated assets, because `/faq` links to `/terms#ownership`. Do not change its wording.

## Page copy
<!-- COPY:START -->
No copy change. Keep the current legal text word for word.
<!-- COPY:END -->

## CTAs
None.

## Internal links on this page
- Legal bar: `/privacy`, `/terms`, `/cookies`
