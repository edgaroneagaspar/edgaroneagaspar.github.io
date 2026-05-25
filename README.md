# Edgar Onea publications site

This folder contains a static GitHub Pages publication page.

## Upload to GitHub

Copy these files into the root of the repository `edgaroneagaspar.github.io`:

- `index.html`
- `styles.css`
- `site.js`
- `publications.js`

Then commit the files. GitHub Pages will publish the site from the repository root.

## Updating publications

Do not maintain separate lists. Update only `publications.js`.

Each publication has this structure:

```js
{
  year: 2026,
  authors: "Author One; Author Two",
  title: "Title.",
  type: "Journal article",
  subtype: "Research article",
  venue: "Journal Name 1(2)",
  pages: "1–20",
  doi: "10.xxxx/xxxxx",
  primaryTopic: "Questions and discourse",
  topics: ["Questions and discourse", "Experimental semantics and pragmatics"],
  note: ""
}
```

The website automatically generates the chronological, type-based and thematic views from this single data source.

## Note

The page uses the publication list supplied by Edgar Onea and has not been independently bibliographically verified. One obvious duplicate was merged: “The nearly missed account of narrative suspense” appeared once under 2024 and once under 2023 in the supplied list.
