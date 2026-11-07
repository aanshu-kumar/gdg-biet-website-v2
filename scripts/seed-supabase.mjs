// Uploads every image the bundled JSON references from /public to the Supabase
// `assets` bucket, then upserts the JSON content into the tables from
// supabase/schema.sql. Safe to re-run: uploads and rows are upserted.
//
//   npm run seed        (reads .env.local)

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const readJson = async (name) => JSON.parse(await readFile(path.join(root, "src/data", name), "utf8"));

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };

/** Uploads /public<localPath> and returns its bucket key, or passes through remote URLs. */
async function upload(localPath) {
  if (!localPath || /^https?:\/\//.test(localPath)) return localPath ?? null;
  const key = localPath.replace(/^\//, "");
  const body = await readFile(path.join(root, "public", key));
  const { error } = await supabase.storage.from("assets").upload(key, body, {
    contentType: MIME[path.extname(key).toLowerCase()] ?? "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(`upload ${key}: ${error.message}`);
  console.log("  uploaded", key);
  return key;
}

async function upsert(table, rows) {
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length} rows`);
}

const events = await readJson("events.json");
await upsert("events", await Promise.all(events.map(async (e) => ({
  id: e.id, title: e.title, description: e.description, date: e.date, location: e.location,
  status: e.status, image_path: await upload(e.image), tags: e.tags,
  register_url: e.registerUrl, resources_url: e.resourcesUrl,
}))));

const team = await readJson("team.json");
await upsert("team_members", await Promise.all(team.map(async (m) => ({
  id: m.id, name: m.name, role: m.role, year: m.year, image_path: await upload(m.image),
  linkedin_url: m.linkedin, twitter_url: m.twitter, is_lead: m.lead, sort_order: m.order,
}))));

const projects = await readJson("projects.json");
await upsert("projects", await Promise.all(projects.map(async (p) => ({
  id: p.id, title: p.title, description: p.description, image_path: await upload(p.image),
  tags: p.tags, github_url: p.githubUrl, live_url: p.liveUrl, sort_order: p.order,
}))));

const faqs = await readJson("faqs.json");
await upsert("faqs", faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, sort_order: f.order })));

const sponsors = await readJson("sponsors.json");
await upsert("sponsors", await Promise.all(sponsors.map(async (s) => ({
  id: s.id, name: s.name, logo_path: await upload(s.logo), url: s.url, sort_order: s.order,
}))));

const stories = await readJson("stories.json");
await upsert("stories", await Promise.all(stories.map(async (s) => ({
  id: s.id, quote: s.quote, name: s.name, role: s.role, image_path: await upload(s.image),
}))));

console.log("Done.");
