# AWS Developer Associate Power Reviewer ⚡

> Remember faster. Review smarter.

A modern, mobile-first web application for studying the **AWS Certified Developer – Associate** exam using your own Excel reviewer.

---

## Purpose

Transform your Excel-based AWS reviewer into an interactive, memory-focused study tool. The application supports five study modes, topic filtering, search, and keyboard shortcuts — all running 100% in your browser with no server required.

---

## Technology

| Layer | Stack |
|-------|-------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Excel Parsing | SheetJS / xlsx |
| Persistence | Browser localStorage only |
| Backend | None |

---

## Excel File Format

Your reviewer must be an `.xlsx` or `.xls` file with columns in this order:

| Column | Field | Required |
|--------|-------|----------|
| A | Item / Topic | ✅ |
| B | Question | ✅ |
| C | Answer | ✅ |
| D | Power Memory 1 | Optional |
| E | Power Memory 2 | Optional |

An optional header row is automatically detected and skipped.

### Example

| A | B | C | D | E |
|---|---|---|---|---|
| AWS Lambda | What happens at timeout? | Lambda terminates and returns an error. | Timeout = Hard stop | Max 15 min, design for idempotency |
| Amazon S3 | What does S3 stand for? | Simple Storage Service — object storage | S3 = Object storage | Files, backups, static websites |

> ⚠️ Do **not** change column positions. The app maps columns by position (A→E), not by header name.

---

## How to Import Your Reviewer

1. Open the application.
2. Click **Import Excel File** on the dashboard.
3. Drag-and-drop or click to browse for your `.xlsx` / `.xls` file.
4. If the file has multiple worksheets, select the correct one.
5. The app validates and imports the cards.
6. Your data is parsed in the browser and stored in localStorage — **the file is never uploaded anywhere**.

---

## Study Modes

### 📚 Study Mode
Step-by-step review with explicit "Think First" → "Show Answer" → "Power Memory" flow. Best for focused learning.

### ⚡ Quick Review
Minimal UI. Keyboard-shortcut-driven fast review. Show question, reveal answer, mark and advance.

**Keyboard shortcuts:**
- `Space` / `→` — Reveal answer, then next question  
- `1` — Mark as Known  
- `2` — Mark as Review Again  
- `Esc` — Return to dashboard

### 🎲 Random Review
All questions shuffled randomly. No repeats within a session. Reshuffles automatically after all cards are seen.

### 🧠 Power Memory Mode
Memory-first. Shows the Power Memory cues first, prompts active recall ("What AWS concept does this remind you of?"), then reveals the question and answer.

### 🔁 Review Again
Shows only cards you marked for review. If empty, shows a celebration message and prompts you to start a full review.

---

## Topic Filtering

The **Topics** view lists all unique values from Column A (Item / Topic). Selecting a topic filters the active study mode to only that topic's cards. Selecting "All Topics" resets the filter.

---

## Search

The **Search** view lets you search across:
- Item / Topic
- Question
- Answer
- Power Memory 1 & 2

Matching text is highlighted in results. Click any result to jump to that topic in Study Mode.

---

## localStorage Usage

Progress is stored in `localStorage` under these keys:

```json
{
  "aws-reviewer-progress": {
    "knownQuestions": ["id1", "id2"],
    "reviewAgainQuestions": ["id3"],
    "reviewedQuestions": ["id1", "id2", "id3"]
  },
  "aws-reviewer-cards": [ /* imported review cards array */ ],
  "aws-reviewer-last-mode": "study",
  "aws-reviewer-using-sample": false
}
```

Progress is **never sent to a server**. All data lives in your browser.

### Reset Progress

On the Dashboard → Settings, click **Reset Progress** to clear all known/review tracking. Your imported cards are unaffected.

### Export Progress

Click **Export Progress JSON** on the Dashboard to download a snapshot of your current progress and statistics as a `.json` file.

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone / navigate to project
cd aws-power-reviewer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

---

## Vercel Deployment

1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Vercel auto-detects Next.js — no configuration needed.
4. Click **Deploy**.

The app is a fully static client-side application after the initial load. No environment variables or server-side configuration is needed.

---

## Privacy

> 🔒 **Your Excel file is never uploaded to a server.**
> 
> The file is parsed entirely in your browser using the SheetJS library. Once imported, the card data is stored only in your browser's localStorage. Clearing your browser data removes all saved cards and progress.

---

## Architecture

```
Excel File (.xlsx/.xls)
       ↓
  Browser (FileReader API)
       ↓
  SheetJS / xlsx parser
       ↓
  ReviewCard[] (typed array)
       ↓
  React Context (ReviewerContext)
       ↓
  Study Mode Components
       ↓
  localStorage (progress only)
```

No backend. No database. No accounts. Just you and your reviewer.
