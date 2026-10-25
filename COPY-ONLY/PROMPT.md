# Update page text

The folder `COPY-ONLY/pages/` holds the new text for every page on the site except the homepage. One file per page; the file name matches the route (a hyphen stands for a slash, e.g. `integrations-blender.md` = `/integrations/blender`, `solutions-games.md` = `/solutions/games`).

For each file:
1. Open the page at the route given in the file's `Route` row.
2. Replace the page's visible text with everything between `<!-- COPY:START -->` and `<!-- COPY:END -->`. Copy every paragraph exactly, in order. Don't shorten, merge, reword or move text between pages.
3. `**[Section …]**` labels mark sections; they are not text to show. `Visual:` lines are image slots: leave a placeholder there and use the `Alt text:` line as the image's alt text.
4. Use the page's existing components and styling. If the file has a section the page doesn't have yet, add it with the same components.
5. Update the page's title and meta description to match the table at the top of the file.

Legal pages (`privacy.md`, `terms.md`, `cookies.md`): replace the old legal text completely. Keep each numbered section's `id` so links like `/terms#ownership` work. Leave bracketed blanks such as `[LEGAL ENTITY NAME]` exactly as written.

Rules:
- Don't touch the homepage.
- Don't change routes, links, buttons, header or footer.
- Change text only.

When done, list each page you updated and anything you couldn't place.
