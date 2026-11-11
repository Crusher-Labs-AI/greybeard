#!/usr/bin/env bash
# Writes the planted-defect fixture app into the empty eval workspace (the agent's working folder).
set -euo pipefail

cat > '.env.example' <<'GREYBEARD_EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GREYBEARD_EOF

mkdir -p "app/leaderboard"
cat > 'app/leaderboard/Leaderboard.tsx' <<'GREYBEARD_EOF'
"use client";

import { useEffect, useState } from "react";
import { adminClient } from "@/lib/supabase";

type Row = { score: number; profiles: { display_name: string } | null };

export function Leaderboard({ day }: { day: string }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    adminClient
      .from("scores")
      .select("score, profiles(display_name)")
      .eq("day", day)
      .order("score", { ascending: false })
      .limit(50)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [day]);

  return (
    <ol>
      {rows.map((r, i) => (
        <li key={i}>
          {r.profiles?.display_name ?? "anonymous"}: {r.score}
        </li>
      ))}
    </ol>
  );
}
GREYBEARD_EOF

mkdir -p "app/play"
cat > 'app/play/SubmitScore.tsx' <<'GREYBEARD_EOF'
"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase";

export function SubmitScore({ day, correct, secondsTaken }: { day: string; correct: number; secondsTaken: number }) {
  const [saved, setSaved] = useState(false);

  async function save() {
    const supabase = browserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const score = correct * 100 - secondsTaken;
    await supabase.from("scores").insert({ user_id: user.id, day, score });
    setSaved(true);
  }

  return saved ? <p>Saved!</p> : <button onClick={save}>Save my score</button>;
}
GREYBEARD_EOF

mkdir -p "lib"
cat > 'lib/supabase.ts' <<'GREYBEARD_EOF'
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export function browserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Used for the leaderboard so it always loads, even for logged-out visitors.
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
GREYBEARD_EOF

cat > 'middleware.ts' <<'GREYBEARD_EOF'
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Refreshes the Supabase session cookie on every request.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
GREYBEARD_EOF

cat > 'package.json' <<'GREYBEARD_EOF'
{
  "name": "daily-puzzle",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.80.0",
    "next": "16.4.6",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
GREYBEARD_EOF

mkdir -p "supabase/migrations"
cat > 'supabase/migrations/20261101000000_init.sql' <<'GREYBEARD_EOF'
-- Players
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "players edit their own profile" on public.profiles for update using (auth.uid() = id);

-- One puzzle per day
create table public.puzzles (
  day date primary key,
  question text not null,
  answer text not null
);
alter table public.puzzles enable row level security;
create policy "anyone can read puzzles" on public.puzzles for select using (true);

-- Scores
create table public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id),
  day date not null references public.puzzles (day),
  score integer not null,
  created_at timestamptz not null default now()
);
create index scores_day_score_idx on public.scores (day, score desc);
GREYBEARD_EOF

git init -q . 2>/dev/null || true
