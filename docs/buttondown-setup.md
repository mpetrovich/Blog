# Buttondown setup

Manual account steps for email subscribe on [petro.blog](https://petro.blog). The site posts a plain HTML form to Buttondown; a Cursor skill (`/notify-subscribers`) sends “new post” emails via the API.

## 1. Create the newsletter

1. Sign up at [buttondown.com](https://buttondown.com/register).
2. Create a newsletter and note its **username** (used in the embed URL).
3. Set that username in [`site/src/_data/site.js`](../site/src/_data/site.js) as `buttondownUsername` (currently `mpetrovich`). Until it is set, the subscribe form is hidden.

## 2. Double opt-in

In Buttondown settings for subscribing, enable **double opt-in** so new readers confirm by email before joining the list.

## 3. Sending domain (recommended)

Sending from a custom domain improves From: branding and deliverability. It is available on the free plan.

1. In Buttondown: Settings → sending domain (e.g. `mail.petro.blog`).
2. Add the DNS records Buttondown shows (managed NS on a dedicated subdomain, or manual SPF/DKIM).
3. Wait until the domain verifies, then set the From address you want (e.g. `hello@mail.petro.blog`).

Do not reuse the same subdomain for both site hosting and managed sending DNS.

## 4. API key

1. Create a key at [Buttondown → API keys](https://buttondown.com/keys).
2. Grant at least **email** and **sending** write access.
3. Put it in the repo-root **`.env`** (gitignored; copy from `.env.example` if needed):

```bash
BUTTONDOWN_API_KEY=your-key-here
```

Never commit `.env`. The `/notify-subscribers` skill and `site/scripts/notify-subscribers.mjs` load this file automatically.

## 5. Smoke test

1. Subscribe with a real address from the homepage form; you should land on `/unconfirmed/` asking you to confirm by email.
2. Complete confirmation if double opt-in is on.
3. After a test publish (or against an existing slug), run `/notify-subscribers` and confirm the email arrives with an unsubscribe path.

If the form does not redirect to `/unconfirmed/`, check Buttondown **Settings → Embedding** (or subscribing) for a post-subscribe redirect URL and set it to `https://petro.blog/unconfirmed/`.
