const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (fs.existsSync(envPath)) {
  console.log(
    "[pozivnica] .env exists → set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY), then npm run dev",
  );
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error("[pozivnica] Missing .env.example");
  process.exit(1);
}

fs.copyFileSync(examplePath, envPath);

console.log(`
[pozivnica] Created .env from .env.example

1) Supabase → Settings → API
   URL → VITE_SUPABASE_URL
   Publishable key → VITE_SUPABASE_PUBLISHABLE_KEY (or legacy anon JWT → VITE_SUPABASE_ANON_KEY)
2) SQL Editor → run supabase/schema.sql
3) Ctrl+C → npm run dev
`);
