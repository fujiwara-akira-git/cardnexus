#!/bin/bash
# Next.js 15 API Routes Migration Script
# Fix API route parameter handling for Next.js 15

echo "🔧 Migrating API routes to Next.js 15 format..."

# Find all API route files that need updating
files=(
  "src/app/api/board/[id]/route.ts"
  "src/app/api/decks/[id]/route.ts"
  "src/app/api/decks/[id]/like/route.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Replace { params }: { params: { id: string } } with context: { params: Promise<{ id: string }> }
        sed -i '' 's/{ params }: { params: { id: string } }/context: { params: Promise<{ id: string }> }/g' "$file"
        
        # Add await context.params after try {
        sed -i '' '/try {/a\
    const params = await context.params\
' "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️ File not found: $file"
    fi
done

echo "🎉 API routes migration completed!"