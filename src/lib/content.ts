export type Project = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  blurb: string;
  tags: string[];
  stack: string[];
  year: string;
  status: string;
  github?: string;
  live?: string;
  /** URL of the running app to embed as a live insert. TODO(rohan): swap localhost for deployed URLs. */
  demo?: string;
  accent: string;
};

export const site = {
  name: "Rohan Ahire",
  handle: "ROHAN",
  role: "Builder · Systems · Product",
  location: "India · Remote",
  email: "rohanahire1607@gmail.com",
  github: "https://github.com/rohan-ahire1",
  linkedin: "https://linkedin.com/in/rohanahire",
  tagline: "I build trading systems, games, and AI tools — end to end, solo.",
  bio: "I'm an engineer who takes ideas all the way from first commit to something people can use. Right now that means a scanner for Indian stock markets, a geography game with daily challenges, and a chess coach that reads your games. Small tools, done properly.",
  availability: "Open to interesting work",
};

export const contactHref =
  `mailto:${site.email}?subject=${encodeURIComponent("Project inquiry — via rohanahire.com")}`;

export const marquee = [
  "NEXT.JS",
  "PYTHON",
  "TYPESCRIPT",
  "POLARS",
  "RUST",
  "REACT NATIVE",
  "SUPABASE",
  "STOCKFISH",
  "DUCKDB",
  "FRAMER",
  "EXPO",
  "FASTAPI",
];

export const projects: Project[] = [
  {
    id: "flaggo",
    number: "01",
    title: "FLAGGO",
    subtitle: "Geography, one round at a time",
    blurb:
      "A geography game with flag, capital, map, arcade, and daily-challenge modes. Spaced repetition decides what you see next, so the countries you miss keep coming back until they stick. Leaderboards and friend challenges for the competitive; works offline as a PWA.",
    tags: ["Game", "PWA", "Education"],
    stack: ["Vite", "React", "TypeScript", "Supabase", "Tailwind"],
    year: "2025–26",
    status: "Active",
    live: "https://flaggo.rohanahire.com",
    demo: "https://flaggo.rohanahire.com",
    accent: "#E10600",
  },
  {
    id: "chess-coach",
    number: "02",
    title: "COACHMATE",
    subtitle: "A chess coach that reads your games",
    blurb:
      "Type a Chess.com username and get a plain-English report on the mistakes you keep repeating — then drill those exact positions, or play a bot tuned to your level. Stockfish runs in the browser, so your games never leave your device; only the patterns do. Free, mobile-first.",
    tags: ["AI", "Chess", "WASM"],
    stack: ["Next.js", "Stockfish", "chess.js", "OpenRouter"],
    year: "2026",
    status: "Shipped",
    accent: "#1A4D2E",
  },
  {
    id: "multibagger",
    number: "03",
    title: "MULTIBAGGER",
    subtitle: "Daily swing-trade scanner for Indian stocks",
    blurb:
      "A daily scanner that watches every NSE stock for one specific setup: the Minervini-style swing entry. It pulls prices each evening, runs the signals in Polars, and pings Telegram only when something is actually worth a look. No dashboard-watching, no noise.",
    tags: ["Quant", "Markets", "CLI"],
    stack: ["Python", "Polars", "DuckDB", "FastAPI", "React"],
    year: "2026",
    status: "Active",
    accent: "#0B3D91",
  },
  {
    id: "extracta",
    number: "04",
    title: "EXTRACTA",
    subtitle: "Documents in, structured data out",
    blurb:
      "A demo of what document extraction should feel like: drop in an invoice or a resume and watch it become editable, confidence-scored fields. The AI path is mocked on purpose — this one exists to get the product experience right, not the plumbing.",
    tags: ["AI Demo", "Docs", "Product"],
    stack: ["Next.js", "Framer Motion", "Three.js", "Tailwind"],
    year: "2025",
    status: "Demo",
    accent: "#5B2C6F",
  },
  {
    id: "whatsapp-cleaner",
    number: "05",
    title: "WA CLEANER",
    subtitle: "Duplicate media, safely deleted",
    blurb:
      "An Android app that finds the duplicate photos and forgotten large files eating your storage, then deletes them safely — with trash and undo. Built on Android's own storage framework, so it only ever touches the folders you pick.",
    tags: ["Mobile", "Android", "Utility"],
    stack: ["Expo", "React Native", "Room", "Kotlin module"],
    year: "2025",
    status: "Built",
    accent: "#0D7377",
  },
  {
    id: "clenow",
    number: "06",
    title: "CLENOW NSE",
    subtitle: "Momentum investing, tested then traded",
    blurb:
      "Andreas Clenow's momentum rules, adapted for Indian equities: rank the Nifty universe by trend strength, size positions by volatility, rebalance monthly. Backtested across a decade of data, now producing live signals through a broker API.",
    tags: ["Quant", "Backtest", "Live"],
    stack: ["Python", "yfinance", "Dhan API", "Pandas"],
    year: "2025–26",
    status: "Research",
    accent: "#C45C26",
  },
];

export const now = [
  "SHIPPING FLAGGO DAILY CHALLENGES",
  "TUNING MULTIBAGGER SIGNALS",
  "COACHMATE BOT DIFFICULTY MODES",
  "READING: CLENOW — STOCKS ON THE MOVE",
  "EXPLORING WASM ENGINES",
];

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  note: string;
  decimals?: number;
};

// TODO(rohan): replace commits/repos/rating/cagr with real numbers.
// Token count is real — refresh with `python3 scripts/token_stats.py`.
export const stats: Stat[] = [
  { value: 3.29, suffix: "B", decimals: 2, label: "LLM TOKENS", note: "claude + codex, work & personal" },
  { value: 700, suffix: "+", label: "COMMITS", note: "last 12 months" },
  { value: 24, suffix: "", label: "PUBLIC REPOS", note: "github" },
  { value: 1600, suffix: "", label: "RAPID RATING", note: "chess.com" },
  { value: 18, suffix: "%", label: "BACKTEST CAGR", note: "clenow nse, 2015–25" },
];

export type ChessPuzzle = {
  fen: string;
  from: string;
  to: string;
  san: string;
  hint: string;
};

// All puzzles: white to move, mate in one.
export const chessPuzzles: ChessPuzzle[] = [
  {
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    from: "a1",
    to: "a8",
    san: "Ra8#",
    hint: "The back rank is soft.",
  },
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    from: "f3",
    to: "f7",
    san: "Qxf7#",
    hint: "The oldest trick in the book.",
  },
  {
    fen: "6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1",
    from: "h6",
    to: "f7",
    san: "Nf7#",
    hint: "Smothered by his own men.",
  },
  {
    fen: "7k/8/5N1K/8/8/8/8/6Q1 w - - 0 1",
    from: "g1",
    to: "g7",
    san: "Qg7#",
    hint: "The king escorts his queen.",
  },
  {
    fen: "6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1",
    from: "d1",
    to: "d8",
    san: "Qd8#",
    hint: "Straight down the middle.",
  },
  {
    fen: "1k6/ppp5/8/8/8/8/6PP/4R1K1 w - - 0 1",
    from: "e1",
    to: "e8",
    san: "Re8#",
    hint: "Every pawn is a wall.",
  },
];

export type FlagQuestion = {
  flag: string;
  answer: string;
  options: string[];
};

export const flagQuestions: FlagQuestion[] = [
  { flag: "🇸🇮", answer: "Slovenia", options: ["Slovakia", "Slovenia", "Serbia", "Russia"] },
  { flag: "🇹🇩", answer: "Chad", options: ["Romania", "Andorra", "Chad", "Moldova"] },
  { flag: "🇮🇩", answer: "Indonesia", options: ["Monaco", "Poland", "Singapore", "Indonesia"] },
  { flag: "🇦🇺", answer: "Australia", options: ["Australia", "New Zealand", "Fiji", "Tuvalu"] },
  { flag: "🇮🇪", answer: "Ireland", options: ["Côte d'Ivoire", "Italy", "Ireland", "India"] },
  { flag: "🇱🇺", answer: "Luxembourg", options: ["Netherlands", "Luxembourg", "Russia", "Croatia"] },
  { flag: "🇲🇾", answer: "Malaysia", options: ["United States", "Liberia", "Malaysia", "Puerto Rico"] },
  { flag: "🇧🇬", answer: "Bulgaria", options: ["Hungary", "Iran", "Bulgaria", "Mexico"] },
  { flag: "🇦🇷", answer: "Argentina", options: ["Uruguay", "Argentina", "Honduras", "El Salvador"] },
  { flag: "🇸🇳", answer: "Senegal", options: ["Mali", "Cameroon", "Guinea", "Senegal"] },
  { flag: "🇳🇴", answer: "Norway", options: ["Iceland", "Denmark", "Norway", "Finland"] },
  { flag: "🇻🇪", answer: "Venezuela", options: ["Colombia", "Ecuador", "Venezuela", "Bolivia"] },
];

export const skills = [
  { group: "Product", items: ["Next.js", "React", "Expo", "Vite", "Tailwind"] },
  { group: "Systems", items: ["Python", "TypeScript", "Rust", "FastAPI", "Node"] },
  { group: "Data", items: ["Polars", "DuckDB", "Parquet", "SQL", "Optuna"] },
  { group: "AI", items: ["OpenRouter", "Claude", "GPT", "RAG", "WASM engines"] },
];
