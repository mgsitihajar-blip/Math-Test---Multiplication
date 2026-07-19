# Math Test - Multiplication

A browser-based multiplication practice test. Five sets of ten questions each, with answer checking, a correction pass for wrong answers, and a running score.

## Features

- 5 sets × 10 randomly generated multiplication questions (2–12 times tables)
- **Check Answers** — grades your answers and circles the question numbers you got wrong
- **Correction** — unlocks only the wrong questions so you can retry them
- **Next Set** — advances once every answer in the set is correct
- Score shown top-right: current set mark plus a running total across sets
- End-of-test summary with a per-set score breakdown and a restart option

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- [React](https://react.dev/) 18
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons

## Project structure

```
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src
    ├── App.jsx        # main app component
    ├── index.css      # Tailwind entry
    └── main.jsx        # React entry point
```
