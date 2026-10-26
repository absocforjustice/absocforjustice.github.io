# ABSoC for Justice (AFJ)

Static website for ABSoC for Justice — a student-led initiative campaigning for
justice through education and empowerment.

**Live site:** https://absocforjustice.netlify.app

---

## What this is

Plain HTML, CSS and a little JavaScript. **No build step, no framework, no
dependencies.** If you can edit a text file, you can edit this site.

The repository root *is* the website — what you see here is exactly what gets served.

| Path | What it holds |
|------|---------------|
| `index.html` | Home |
| `about.html` | About Us |
| `work.html` | Our Work — the five pillars |
| `gallery.html` | Photo gallery |
| `reading-list.html` | Reading List — 35 books across 5 themes |
| `articles.html` | Articles / think pieces |
| `statements.html` | Statements |
| `get-involved.html` | Get Involved |
| `contact.html` | Contact |
| `assets/css/style.css` | **All** styling — one file |
| `assets/js/main.js` | Mobile nav, scroll reveal, footer year |
| `assets/img/gallery/` | Photography |
| `assets/img/books/` | Reading-list covers |

---

## Working on it locally

You need Python installed (it comes with most systems).

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

> **If your changes don't show up**, your browser has cached the old files.
> Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac) to force a reload.

Opening the `.html` files directly by double-clicking mostly works, but the
local server is closer to how the real site behaves.

---

## Making common changes

### Text

Open the relevant `.html` file and edit the text between the tags. Everything is
plain, readable HTML — there's no templating to learn.

### Colours and fonts

All defined once at the top of `assets/css/style.css`:

```css
:root {
  --green-900: #3f1113;  /* deepest maroon  */
  --green-700: #6e1f22;  /* primary maroon  */
  --gold:      #c8a24a;
  --cream:     #f7f2ea;
  ...
}
```

Change them there and the whole site follows.

> The variables are named `--green-*` for historical reasons but hold the
> maroon palette. Don't let the names confuse you.

### Adding a photo to the gallery

1. **Strip the metadata first** — see [Before adding any photo](#before-adding-any-photo).
2. Save it into `assets/img/gallery/` with a short descriptive name
   (`march-crowd.jpeg`, not `IMG_4821.jpeg`).
3. Copy an existing block in `gallery.html` and point it at your file:

```html
<figure class="gallery-item">
  <img src="assets/img/gallery/YOUR-FILE.jpeg" alt="Describe the photo" loading="lazy">
  <figcaption>Your caption</figcaption>
</figure>
```

### Adding a book to the reading list

Save the cover into `assets/img/books/`, then copy a `<div class="book">` block
in `reading-list.html` and edit the title, author and description.

### Changing a page's banner photo

Banner images live in **`style.css`**, not in the HTML. Find the block near
`/* Page banners */` and change the filename:

```css
.page-hero--work { background-image: linear-gradient(...), url("../img/gallery/YOUR-FILE.jpeg"); }
```

> ⚠️ **Note the `../img/` path.** Paths inside `style.css` are relative to
> `assets/css/`, not to the page. Writing `assets/img/...` here will silently
> fail and you'll get a plain maroon banner with no photo.

---

## Before adding any photo

Photos straight from a camera or phone carry hidden metadata — **GPS coordinates,
device details, timestamps**. Publishing that to a public website exposes where a
photo was taken and on whose device.

Strip it before committing:

```bash
python -c "
from PIL import Image
import sys
f = sys.argv[1]
im = Image.open(f)
clean = Image.new(im.mode, im.size)
clean.putdata(list(im.getdata()))
clean.convert('RGB').save(f, 'JPEG', quality=85, optimize=True)
" path/to/photo.jpeg
```

Also: **rename the file.** A messaging-app export name like
`Image 2026-01-01 at 09.30.00.jpeg` leaks a timestamp and the source app. Use `march-crowd.jpeg`.

And keep images under roughly 1400px wide — the site doesn't need more, and
large files make the gallery slow on mobile.

---

## Publishing your changes

The site is hosted on **Netlify**. There are two ways to update it.

### Option A — drag and drop (no setup)

1. Go to **app.netlify.com** → the **absocforjustice** site → **Deploys** tab
2. Drag this whole folder onto the drop zone
3. Live in a few seconds, on the same URL

> ⚠️ Don't use `netlify.com/drop` — that creates a **brand new site** with a
> different random URL instead of updating this one. Use the **Deploys** tab.

Netlify keeps every past deploy, so you can roll back with one click if
something breaks.

### Option B — automatic deploys (recommended)

Connect this repository to Netlify once, and every push deploys itself:

1. Netlify → **Site configuration** → **Build & deploy** → **Link repository**
2. Choose this GitHub repo
3. Leave the build command **empty** and set the publish directory to `/`
   (there's nothing to build)

After that, `git push` is all it takes.

---

## Contributing

```bash
git clone <this-repo-url>
cd <folder>
python -m http.server 8000      # check your change locally
git add -A
git commit -m "Describe what you changed"
git push
```

Please keep commits focused and describe the actual change
("Add three photos to gallery", not "update").

### Privacy note for contributors

Commits in this repository are authored as **ABSoC for Justice**, not under
personal names. If you clone and commit, set the identity **for this repo only**
before you start:

```bash
git config user.name "ABSoC for Justice"
git config user.email "Info.absocforjustice@gmail.com"
```

Without the `--global` flag this applies only here and leaves your own git
settings alone. Check it took effect with `git log` after your first commit —
the author must not be your personal name or address.

---

## Known gaps

- **Donate** is marked "Coming soon" — no payment platform connected yet
- **The contact form** is front-end only; submissions go nowhere. To make it
  work, connect it to Formspree, Google Forms or Netlify Forms
- **Statements** and **Articles** are placeholder "coming soon" pages

---

## Contact

**Email:** Info.absocforjustice@gmail.com
**Instagram:** [@absocforjustice](https://instagram.com/absocforjustice)
