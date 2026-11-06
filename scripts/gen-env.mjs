// Writes public/assets/js/env.js from environment variables so the legacy
// static pages can read config at runtime without it living in git.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const env = { ...process.env };
if (existsSync(".env.local")) {
  for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
}
const out = {
  SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};
writeFileSync("public/assets/js/env.js", `window.__YAS_ENV__=${JSON.stringify(out)};\n`);
console.log("env.js written", out.SUPABASE_URL ? "(configured)" : "(EMPTY — set NEXT_PUBLIC_SUPABASE_*)");
