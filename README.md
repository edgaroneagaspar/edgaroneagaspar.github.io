# Edgar Onea website prototype

This is a static GitHub Pages prototype.

## How to publish

Upload the contents of this folder to the root of the GitHub repository `edgaroneagaspar.github.io`.

The main English version will be available at:

`https://edgaroneagaspar.github.io/en/`

The root page redirects to `/en/`.

## Structure

- `en/` contains the first English working version.
- `de/`, `ro/`, and `hu/` contain language placeholders.
- `assets/css/styles.css` controls the design.
- `assets/js/site.js` generates the common header and footer.
- `assets/js/publications.js` renders the publication list.
- `assets/data/publications.json` is the single toy publication database.
- `assets/img/discourse-map.svg` is the abstract visual used on the homepage.

## Editing publications

Edit `assets/data/publications.json`. Each publication has the following fields:

```json
{
  "year": 2026,
  "type": "Journal article",
  "authors": ["Edgar Onea"],
  "title": "Title",
  "venue": "Journal or book details",
  "doi": "10.xxxx/xxxxx",
  "topics": ["Topic 1", "Topic 2"]
}
```

The publication page then automatically provides search, grouping by year/type/topic, and filters.

## Local preview

Because the publication list is loaded from JSON, some browsers block it when opening the file directly with `file://`. For local preview, use a tiny web server from the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/en/`.
