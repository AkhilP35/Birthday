# Her Birthday Date Website 💌

_____
# CLICK HERE FOR THE WEBSITE: 
https://akhilp35.github.io/Girlfriend-Birthday-Date-Picker-Website/ 
______

A single-page, no-build website: welcome screen → personal message → date invitation → four quick questions →
a confetti reveal with a countdown to the actual date.

It's plain HTML/CSS/JS on purpose — no npm install, no build step, so
you can preview it by just double-clicking `index.html`, and deploy it
in under a minute.

## 1. Personalise it

Open **`script.js`** and edit the `CONFIG` object at the very top:

- `girlfriendName` — shown on the cover screen
- `personalMessage` — the note on the second screen
- `memories` — 2-4 emoji + captions for the "our story" tiles (swap in
  real photos if you want — instructions are commented right above the
  array)
- `restaurantName` / `restaurantAddress` — leave blank to keep the
  place a surprise until the actual date; fill in to show a "Get
  directions" link on the reveal
- `pickupNote` — the closing line under the ticket

You can also tweak the questions and options directly in `index.html`
(cuisine, dress code, time slots, etc. are plain buttons — add, remove,
or relabel them freely).

## 2. Get her answers sent to you

Right now the site doesn't know where to send her answers — you need
to plug in **one** of these (both are free):

**Discord webhook (easiest, ~2 minutes)**
1. In a Discord server you control: Server Settings → Integrations →
   Webhooks → New Webhook → Copy Webhook URL.
2. Paste it into `discordWebhookUrl` in `script.js`.

**Google Sheets (no Discord needed)**
1. Create a Google Sheet.
2. Extensions → Apps Script, paste a small script that reads
   `e.postData.contents` and appends a row (search "Apps Script web
   app form submission" for a template — it's a common 10-line
   snippet).
3. Deploy → New deployment → Web app → execute as "Me", access
   "Anyone" → copy the `/exec` URL into `sheetsWebAppUrl` in
   `script.js`.

**Important:** test whichever one you choose yourself before sending
her the link, so you know for certain her answer reaches you.

If you skip this step, the site still works and still feels complete
for her — you just won't automatically receive her answers.

## 3. Preview it

Just double-click `index.html`, or in a terminal:

```
npx serve .
```

## 4. Deploy it for free

**Netlify (drag and drop, no account setup needed for a quick link)**
1. Go to https://app.netlify.com/drop
2. Drag the whole `birthday-date` folder onto the page.
3. You'll get a live URL instantly (you can rename it in site settings).

**Vercel**
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new and import the repo.
3. No build settings needed — it deploys as a static site.

**GitHub Pages**
1. Push this folder to a GitHub repo.
2. Repo Settings → Pages → set source to the main branch.

Any of these gives you a free `https://...` link you can text her.

## Notes

- Everything runs client-side — there's no backend, so keep the
  webhook URL in mind: anyone who views the page source could see it.
  That's normal for a small personal project like this, but don't
  reuse a webhook you care about keeping private.
- The site respects "reduce motion" accessibility settings and is
  fully keyboard-operable.
