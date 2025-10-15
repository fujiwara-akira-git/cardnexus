# Neon Database - Environment Variables

## Production Environment Variables for Vercel

Copy these environment variables to your Vercel Dashboard:

### Required Variables

```env
# Neon Database
DATABASE_URL="postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-cardnexus-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Optional OAuth Variables

```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"

# Discord OAuth (Optional)  
DISCORD_CLIENT_ID="your-discord-application-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## How to Get Neon Database URL

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project: `cardnexus-production`
3. Select region: `Asia Pacific (Singapore)` (closest to Japan)
4. Copy the connection string from "Connection Details"
5. Format: `postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require`

Example:
```
postgresql://cardnexus_user:abc123xyz@ep-bold-mountain-12345.us-east-1.aws.neon.tech/cardnexus?sslmode=require
```

## NextAuth Secret Generation

Generate a secure secret:

```bash
openssl rand -base64 32
```

Or online: https://generate-secret.vercel.app/32

## Setting up in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with the appropriate value
4. Select "Production" environment
5. Save and redeploy

## Database Migration

After setting up environment variables, the first deployment will automatically:

1. Generate Prisma Client
2. Run database migrations  
3. Build the application

No manual migration needed - it's handled by the `vercel-build` script.