# Gunaso - Frontend

A mental health support platform that connects anonymous seekers with verified helpers and AI-assisted tools. Built for a hackathon.

---

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | React 18                            |
| Build tool | Vite 4                              |
| Routing    | React Router DOM v7                 |
| State      | React Context API                   |
| Styling    | CSS Modules + CSS custom properties |
| Font       | Manrope (Google Fonts)              |

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

| Script            | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start dev server at `http://localhost:5173` |
| `npm run build`   | Production build to `dist/`                 |
| `npm run preview` | Preview production build locally            |
| `npm run lint`    | Run ESLint                                  |

---

## Project Structure

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Root — wraps context providers + router
├── index.css                   # Global reset + CSS design tokens
│
├── router/
│   └── index.jsx               # All routes + SeekerGuard / HelperGuard
│
├── context/
│   ├── AuthContext.jsx         # user state, loginAsSeeker, loginAsHelper, logout
│   └── OnboardingContext.jsx   # Multi-step onboarding answers + navigation
│
├── design-system/
│   └── tokens.js               # Colour, typography, spacing, shadow tokens
│
├── components/
│   ├── layout/
│   │   ├── AppLayout           # Sidebar + main content shell
│   │   ├── Sidebar             # Role-aware nav (seeker / helper)
│   │   ├── Navbar              # Public top nav (landing page)
│   │   └── TopBar              # In-app top bar
│   ├── ui/                     # Shared atoms: Button, Card, TagChip, AnonId, Breadcrumb
│   └── onboarding/             # ProgressBar, QuestionCard
│
└── pages/
    ├── LandingPage             # Public homepage
    ├── AuthPage                # Seeker signup + login (tab-switched)
    ├── OnboardingPage          # Multi-step questionnaire (new seekers only)
    ├── OnboardingResultsPage   # Onboarding summary
    ├── SeekerDashboard
    ├── AIChatPage
    ├── ProfessionalSupportPage
    ├── SessionPage
    └── helper/
        ├── HelperAuthPage      # Helper signup + login (tab-switched)
        ├── HelperDashboard
        ├── HelperHistoryPage
        ├── RequestBriefPage
        └── HelperSessionPage
```

---

## Routes

### Public

| Path                  | Page                                        |
| --------------------- | ------------------------------------------- |
| `/`                   | Landing page                                |
| `/signup`             | Seeker sign up                              |
| `/login`              | Seeker log in                               |
| `/onboarding`         | Onboarding questionnaire (new seekers only) |
| `/onboarding/results` | Onboarding results                          |
| `/helper/signup`      | Helper sign up                              |
| `/helper/login`       | Helper log in                               |

### Seeker (protected — requires `role: seeker`)

| Path                    | Page                    |
| ----------------------- | ----------------------- |
| `/dashboard`            | Seeker dashboard        |
| `/chat`                 | AI chat                 |
| `/professional-support` | Browse verified helpers |
| `/session/:sessionId`   | Live session            |

### Helper (protected — requires `role: helper`)

| Path                         | Page                                  |
| ---------------------------- | ------------------------------------- |
| `/helper/dashboard`          | Clinical overview + incoming requests |
| `/helper/history`            | Past sessions + feedback              |
| `/helper/request/:requestId` | Request brief detail                  |
| `/helper/session/:sessionId` | Live helper session                   |

---

## Auth Model

Auth lives entirely in `AuthContext`. Two distinct user roles:

```
Seeker   { role: 'seeker', anonId, sessionToken }
Helper   { role: 'helper', name, sessionToken }
```

- `SeekerGuard` — wraps seeker routes, redirects non-seekers to `/`
- `HelperGuard` — wraps helper routes, redirects non-helpers to `/`
- Onboarding runs only on **signup**, not on login
- `logout()` clears user state and redirects to `/`

> Auth is currently mocked (no backend). Tokens are `'mock-token'` placeholders.

---

## Design System

All design tokens are defined once in `src/index.css` as CSS custom properties and mirrored in `src/design-system/tokens.js`.

**Key colour roles**

| Variable               | Value                    | Used for                                                  |
| ---------------------- | ------------------------ | --------------------------------------------------------- |
| `--color-primary`      | `#3c676e`                | Brand, buttons, active nav — shared across the whole app  |
| `--color-helper-blue`  | `→ var(--color-primary)` | Helper portal accents (references primary, stays in sync) |
| `--color-seeker-green` | `#0F6E56`                | Seeker-specific highlights                                |
| `--color-alert-red`    | `#CC3B1A`                | Errors, emergency button                                  |
| `--color-background`   | `#F5F5F3`                | Page background                                           |
| `--color-surface`      | `#FFFFFF`                | Cards, sidebar                                            |

To change the brand colour, update `--color-primary` in `index.css` — the entire app updates.
