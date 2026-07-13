# AmanOr — Safe Workplaces for Women

> *"We build safe workplaces and strengthen woman voices."*

AmanOr is a mobile-first React Native application built with Expo that empowers women to report workplace sexual harassment, access their legal rights, connect with a support community, and preserve evidence — safely and anonymously.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup and Installation](#setup-and-installation)
- [Appwrite Configuration](#appwrite-configuration)
- [Fonts](#fonts)
- [Navigation Flow](#navigation-flow)
- [Pages Reference](#pages-reference)
- [Assets](#assets)
- [Colour Palette](#colour-palette)
- [Known Limitations](#known-limitations)

---

## Overview

AmanOr is designed as a safe, anonymous platform for women experiencing workplace sexual harassment in Israel. It provides tools to report incidents, upload audio and video evidence, understand legal rights under Israeli law, and connect with a survivor support community — all under one app.

The app runs on **iOS**, **Android**, and **Web** via Expo.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Auth | Username + password login and signup with anonymous nickname support |
| 🚨 Report Incident | Report anonymously or with your name, attach recordings |
| 🎙️ Voice Setup | Set up a trigger word for voice-activated recording |
| 🎧 My Media | Upload, store, and play back private audio and video files |
| 🚩 Flagged Workplaces | See which companies have been reported or had recordings filed |
| 📌 Support Board | Community posts for emotional support |
| 💬 Discussion | Threaded comment system for deeper conversations |
| ⚖️ Legal Rights | Israeli sexual harassment law explained clearly |
| 👩‍⚖️ Lawyer Directory | Demo page to connect with a legal professional |
| 🙏 Donate | Support the platform via Buy Me a Coffee, PayPal, or Patreon |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo (React Native) |
| Navigation | Expo Router — file-based drawer navigation |
| Backend / Database | Appwrite Cloud |
| Storage | Appwrite Storage (audio and video files) |
| Fonts | Otomanopee One + Ledger via @expo-google-fonts |
| Media Picker | expo-document-picker, expo-image-picker |
| Audio / Video | expo-av |
| Web SDK | appwrite (for browser file uploads) |
| Native SDK | react-native-appwrite |

---

## Project Structure

```
meet_startap_app/
│
├── app/
│   ├── index.jsx              # Welcome screen
│   ├── auth.jsx               # Login / Sign Up
│   ├── modal.jsx              # Modal screen
│   ├── _layout.jsx            # Root stack layout
│   │
│   └── (drawer)/
│       ├── _layout.jsx        # Drawer navigation layout
│       ├── home.jsx           # Main hub — feature cards
│       ├── index.jsx          # Support Board (posts)
│       ├── explore.jsx        # Discussion / threaded comments
│       ├── report.jsx         # Report Incident landing
│       ├── report-pick.jsx    # Choose recordings to attach
│       ├── report-form.jsx    # Report submission form
│       ├── Recording2.jsx     # Voice-activated recording setup
│       ├── files.jsx          # My Media — upload and playback
│       ├── flagged.jsx        # Flagged Workplaces
│       ├── legal-intro.jsx    # Legal Rights landing
│       ├── legal-what.jsx     # What Is Workplace Sexual Harassment?
│       ├── legal.jsx          # Your Rights and Legal Options
│       ├── legal-lawyer.jsx   # Choose A Lawyer (demo)
│       └── donate.jsx         # Donation page
│
├── assets/
│   ├── bulblogo.png           # Small bulb icon — top-left on all pages
│   ├── AmanOr_1.png           # Full AmanOr logo with text
│   ├── AmanOr_LOGO_bg.jpg     # Logo with background — used on home page
│   └── icons/
│       ├── incident.png
│       ├── rights.png
│       ├── support.png
│       ├── flaged.png
│       ├── donate.png
│       └── recording.png
│
└── README.md
```

---

## Database Schema

All data is stored in Appwrite Cloud.
- **Project ID:** `69af49d80022d666076a`
- **Database ID:** `69b0806500366fecf954`

### `users`
| Attribute | Type | Required | Notes |
|---|---|---|---|
| `username` | String | ✅ | Fulltext index required |
| `password` | String | ✅ | Plain text — hash before production |

### `posts`
| Attribute | Type | Required |
|---|---|---|
| `title` | String | ✅ |
| `content` | String | ✅ |
| `author` | String | — |

### `comments`
| Attribute | Type | Required | Notes |
|---|---|---|---|
| `post_id` | String | ✅ | References a post `$id` |
| `text` | String | ✅ | |
| `author` | String | — | Defaults to "anon" |
| `parent_id` | String | — | NULL for top-level comments |

### `files`
| Attribute | Type | Required | Notes |
|---|---|---|---|
| `fileId` | String | ✅ | Appwrite Storage file ID |
| `username` | String | ✅ | Owner. Fulltext index required. |
| `fileName` | String | ✅ | Original filename |
| `mimeType` | String | ✅ | e.g. `audio/mpeg`, `video/mp4` |
| `name` | String | — | User-given display name |
| `description` | String | — | Optional description |
| `company` | String | — | Company this file relates to |

### `reports`
| Attribute | Type | Required | Notes |
|---|---|---|---|
| `name` | String | — | "Anonymous" if anonymous |
| `email` | String | — | |
| `company` | String | ✅ | Used in Flagged Workplaces. Fulltext index required. |
| `position` | String | — | Reporter's job position |
| `personPosition` | String | — | Accused person's position |
| `relationship` | String | — | Supervisor / Coworker / Manager etc. |
| `recordingIds` | String | — | Comma-separated file `$id`s |
| `anonymous` | Boolean | — | |

### Storage Bucket
| Setting | Value |
|---|---|
| Bucket ID | `69b5e659000ecd76ce30` |
| Display Name | `media` |
| Permissions | Any — Create + Read |
| Recommended max file size | 50MB+ |

---

## Setup and Installation

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- An Appwrite Cloud account

### 1. Clone and install dependencies

```bash
git clone <https://github.com/fugazi-lab/amanor>
cd meet_startap_app
npm install
```

### 2. Install Expo packages

```bash
npx expo install expo-document-picker expo-av expo-image-picker expo-font
```

### 3. Install Google Fonts

```bash
npm install @expo-google-fonts/otomanopee-one @expo-google-fonts/ledger
```

### 4. Install Appwrite SDKs

```bash
npm install react-native-appwrite appwrite
```

### 5. Start the development server

```bash
npx expo start
```

---

## Appwrite Configuration

### Indexes

All indexes must be **Fulltext** type. Using Key type will cause a MySQL 767-byte limit error.

| Collection | Attribute | Index Name |
|---|---|---|
| `users` | `username` | `username_index` |
| `files` | `username` | `username_index` |
| `reports` | `company` | `company_index` |

### Permissions

For each collection and the storage bucket, add role `Any` with Create and Read permissions.

- `users` — Any: Create, Read
- `posts` — Any: Create, Read
- `comments` — Any: Create, Read
- `files` — Any: Create, Read
- `reports` — Any: Create, Read
- Storage bucket `media` — Any: Create, Read

### Web Platform (CORS fix)

To run in a browser on localhost, register a Web platform in Appwrite:

Appwrite Console → Settings → Platforms → Add Platform → Web → Hostname: `localhost`

Add your production domain here before deploying.

---

## Fonts

| Font | Package | Usage |
|---|---|---|
| Otomanopee One | `@expo-google-fonts/otomanopee-one` | Titles, headings, brand name |
| Ledger | `@expo-google-fonts/ledger` | Body text, buttons, inputs, labels |

Both fonts are loaded per-screen using `useFonts()`. Each screen shows an `ActivityIndicator` spinner until fonts are ready.

---

## Navigation Flow

```
Welcome (index.jsx)
    ↓
Auth (auth.jsx)
    ↓
(drawer)/home.jsx  ←──────────────────────────────────────┐
    │                                                       │
    ├── Report Incident (report.jsx)                        │
    │       ↓                                               │
    │   report-pick.jsx  — choose recordings               │
    │       ↓                                               │
    │   report-form.jsx  — fill in details → submit ───────┘
    │
    ├── Voice Setup (Recording2.jsx)
    │
    ├── My Media (files.jsx)
    │
    ├── Flagged Workplaces (flagged.jsx)
    │
    ├── Support Board (index.jsx)
    │       ↓
    │   explore.jsx  — threaded comments per post
    │
    ├── Legal & Rights (legal-intro.jsx)
    │       ├── legal-what.jsx   — what is harassment?
    │       ├── legal.jsx        — your rights
    │       └── legal-lawyer.jsx — choose a lawyer
    │
    └── Donate (donate.jsx)
```

---

## Pages Reference

| File | Route | Description |
|---|---|---|
| `app/index.jsx` | `/` | Welcome screen |
| `app/auth.jsx` | `/auth` | Login and signup |
| `(drawer)/home.jsx` | `/(drawer)/home` | Feature hub with cards |
| `(drawer)/index.jsx` | `/(drawer)/` | Support Board — community posts |
| `(drawer)/explore.jsx` | `/(drawer)/explore` | Threaded discussion per post |
| `(drawer)/report.jsx` | `/(drawer)/report` | Choose anonymous or named report |
| `(drawer)/report-pick.jsx` | `/(drawer)/report-pick` | Select recordings to attach |
| `(drawer)/report-form.jsx` | `/(drawer)/report-form` | Report submission form |
| `(drawer)/Recording2.jsx` | `/(drawer)/Recording2` | Voice trigger word setup |
| `(drawer)/files.jsx` | `/(drawer)/files` | Private audio/video upload and playback |
| `(drawer)/flagged.jsx` | `/(drawer)/flagged` | Companies with reports or recordings |
| `(drawer)/legal-intro.jsx` | `/(drawer)/legal-intro` | Legal rights landing page |
| `(drawer)/legal-what.jsx` | `/(drawer)/legal-what` | What is workplace sexual harassment? |
| `(drawer)/legal.jsx` | `/(drawer)/legal` | Rights under Israeli law |
| `(drawer)/legal-lawyer.jsx` | `/(drawer)/legal-lawyer` | Choose a lawyer (demo) |
| `(drawer)/donate.jsx` | `/(drawer)/donate` | Donation page |

---

## Assets

| File | Used In |
|---|---|
| `assets/bulblogo.png` | Top-left icon on all pages + bottom of welcome/auth |
| `assets/AmanOr_1.png` | Welcome page centre logo |
| `assets/AmanOr_LOGO_bg.jpg` | Home page header logo with background |
| `assets/icons/incident.png` | Home feature card — Report an Incident |
| `assets/icons/rights.png` | Home feature card — Know Your Legal Rights |
| `assets/icons/support.png` | Home feature card — Get Emotional Support |
| `assets/icons/flaged.png` | Home feature card — Check Out Flagged Workplaces |
| `assets/icons/donate.png` | Home feature card — Donate |
| `assets/icons/recording.png` | Home feature card — Set Up Recording |

---

## Colour Palette

| Name | Hex | Used For |
|---|---|---|
| Cream | `#F5F0E4` | App background |
| Burgundy | `#7a2035` | Brand colour, titles, primary buttons |
| Dark Brown | `#2C1810` | Body text |
| Muted Brown | `#6B5B4E` | Secondary text, subtitles, placeholders |
| Warm Brown | `#6B4F3A` | Secondary buttons |
| Divider | `#C4B8A8` | Borders, input underlines |
| White | `#ffffff` | Cards, input backgrounds |

---

## Known Limitations

- **Passwords are stored as plain text.** Acceptable for a prototype — replace with hashed passwords (e.g. bcrypt) before any production release.
- **Voice-activated recording** in `Recording2.jsx` is a UI demo only. Real speech recognition requires a native module such as `@react-native-voice/voice`.
- **Lawyer payments** in `legal-lawyer.jsx` are a demo — the Pay To Start buttons show an alert. A real payment provider (e.g. Stripe) is needed before launch.
- **No persistent login session** — users must log in again each time the app is opened. Implement secure session storage for production.
- **File uploads on web** use the `appwrite` web SDK. Native uses `react-native-appwrite`. Both paths are handled automatically via `Platform.OS` detection.
- The app has been tested on **web (browser)** and **Android (Expo Go)**. iOS behaviour should be verified separately.

---

*Built with care for the women who deserve safer workplaces.*
