# ABSoC for Justice (AFJ)

Static website for ABSoC for Justice — a student-led initiative campaigning for
justice through education and empowerment.

Live site: https://absocforjustice.netlify.app

## Structure

Plain HTML, CSS and a little JavaScript. No build step, no framework.

| Path | Contents |
|------|----------|
| `*.html` | The nine pages |
| `assets/css/style.css` | All styling; palette and fonts are the `:root` variables at the top |
| `assets/js/main.js` | Mobile nav, scroll reveal, footer year |
| `assets/img/gallery/` | Photography |
| `assets/img/books/` | Reading-list covers |

## Working on it locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploying

The repository root is the deployable site — no build required.
Any static host will serve it as-is (Netlify, Cloudflare Pages, GitHub Pages).
