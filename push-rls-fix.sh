#!/usr/bin/env bash
# Usage: bash push-rls-fix.sh YOUR_DB_PASSWORD
# Get your DB password from: Supabase Dashboard → Project Settings → Database

set -e

if [ -z "$1" ]; then
  echo "❌  Usage: bash push-rls-fix.sh YOUR_DB_PASSWORD"
  echo ""
  echo "   Get your password from:"
  echo "   Supabase Dashboard > Project Settings > Database > Database password"
  exit 1
fi

export PATH="/opt/homebrew/bin:$PATH"

echo "🔧  Pushing RLS fix migration to Supabase..."
npx supabase db push --linked -p "$1" --yes

echo ""
echo "✅  Done! Verifying..."
node check-rls-deep.mjs
