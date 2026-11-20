# The Kallah Club: project guide

Read this first. It explains how the site is built and connected so you can
pick up work without the owner re-explaining it. It contains no passwords or
secret keys. Never add any to this repo: it is public and served on the website.

## What this is

**The Kallah Club** is an online kallah (Jewish bride) preparation course built
around Rabbanit Rachel Benchimol. She is the **owner and only admin**: there are no
other teachers, and she must be able to manage everything from the dashboard.
Her son helps run the project. Neither is a developer. Explain things in
plain words and short steps, and show screenshots when you can.

- Live site: https://thekallahclub.com (www redirects to it; HTTPS is enforced)
- Old address that still works: https://kallah-club.github.io/Kallah/

## How it fits together

| Piece | What it does | Where |
|---|---|---|
| GitHub Pages | Hosts the site (static files, no build step) | This repo, branch `main`, repo root |
| Supabase | Accounts (login), database, security rules | Project ref `damndwwdymxtwpjyxnsx` |
| Wix | Domain registrar and DNS for thekallahclub.com | Wix account → Domains → Manage DNS records |
| Vercel | Connected but **not used** for hosting today | Optional future host |

**Deploying = committing to `main`.** GitHub Pages republishes in about 1 minute.
Keep the `CNAME` file (it holds `thekallahclub.com`); deleting it breaks the domain.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page (one big self-contained file; one line is a huge base64 logo, so edit with targeted replacements, never rewrite the file). Has the waitlist form and a "Log in" nav link. |
| `account.html` | Log in, create account (first name, last name, phone, email, password), forgot / reset password, "check your inbox", "link expired". |
| `course.html` | Student area: course home (progress ring, wedding countdown, continue card, announcements, 12 lessons in 4 parts), lesson view `?lesson=ID`, profile `?view=profile`. |
| `admin.html` | Admin dashboard for the owner: Overview, Students (search, CSV), Waitlist (CSV), Lessons (editor, publish), Announcements. Only admins get data. |
| `app.js` | Shared code: Supabase client, auth guards, DOM helper `h()`, sanitizer, CSV export. |
| `app.css` | Shared styles for the app pages. |
| `preview.js` | Preview mode with fake sample data (see below). |

Libraries come from jsdelivr with exact pinned versions and integrity hashes:
`@supabase/supabase-js@2.45.4`, `dompurify@3.1.6`, `marked@12.0.2`.

## Preview mode

Add `?preview=1` to any app page (for example `admin.html?preview=1`) to see it
filled with clearly labeled sample data, with no login. It never touches the real
database; everything lives in the browser tab. `?preview=0` or "Exit preview"
turns it off. Use it to show the owners design changes.

## Database (Supabase)

The source of truth is the live project. Inspect it with the Supabase connector
(`list_tables`, `list_migrations`, `execute_sql` read-only queries) before changing it.

Tables in `public` (all have Row Level Security on):

- `profiles`: one per user. `first_name`, `last_name`, `phone`, `wedding_date`,
  `full_name` (filled automatically from first + last), `email`, `role`
  (`student` or `admin`). Created by a trigger at sign-up from the sign-up form data.
- `lessons`: 12 seeded lessons (4 parts × 3). Lesson text is empty until the
  owner writes it; empty published lessons show as locked "Coming soon".
- `lesson_progress`: per student per lesson (`completed_at`, `last_viewed_at`).
- `announcements`: posts from the owner shown on the course home.
- `waitlist`: emails from the landing page. Visitors can only add; only admins can read.

Helpers live in the `private` schema (not reachable from the website):
`private.is_admin()`, sign-up trigger, column guards, and
`private.preapproved_admins` (the owner's email; her account becomes admin
automatically once that email is confirmed).

### Security rules you must keep

- The key in `app.js` is the **publishable** key; it is public by design. All
  protection comes from RLS. Never put a `service_role` or secret key in any file.
- Students read only published lessons and only their own profile and progress.
  Only admins read all students and the waitlist, or edit lessons and announcements.
- Students can never change `role`, `id` or `email` (column grants + trigger).
- Lesson text and announcements are rendered through DOMPurify; user-entered text
  is always inserted as plain text (the `h()` helper does this).
- After any database change, run the Supabase security advisor and fix what it flags.
- Use test emails at `example.com` only, and delete test users and rows afterwards.

## Design

Match the landing page exactly. Tokens: paper `#f7f4f0`, panel `#fcfaf7`,
blue jean `#5d7184`, text `#4f5a66`, mauve `#887289`, petal `#a794a8`,
silken line `#d6ccc0`. Fonts: Cormorant (display, uppercase, wide spacing),
Herr Von Muellerhoff (script accents), Inter (body). Pill buttons, framed panels,
one light theme. Check every change at phone width (375px).

## Open to-do list

1. **Emails to students.** Supabase's built-in sender only reaches project team
   members. Before real students sign up, connect a free sender (Resend) as custom
   SMTP in Supabase → Authentication → Emails, and add Resend's DNS records in Wix.
2. **Supabase URL settings** (Authentication → URL Configuration): Site URL
   `https://thekallahclub.com`; redirect URLs for `account.html*` and `course.html*`
   on both thekallahclub.com and kallah-club.github.io/Kallah.
3. **Owner account.** She signs up on the site with her email and confirms it;
   she becomes admin automatically.
4. **Lesson content.** She writes lessons in the dashboard's Lessons tab.

## Notes on working with the owners

- They mostly work from a phone, so keep messages short and give links.
- Ask before anything that costs money, deletes data, or changes account settings.
- Show changes with screenshots or `?preview=1` links before and after publishing.
