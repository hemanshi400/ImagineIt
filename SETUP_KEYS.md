# SaySee API Keys Setup Guide

Everything is already integrated into the code. You just need to provide 3 API keys:

## Step 1: OpenAI (Whisper, GPT, Image Generation)

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key starting with `sk-proj-`
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxx
   OPENAI_API_KEY=sk-proj-xxxxx
   ```

**What it does:**
- Speech-to-text (Whisper) in generate page
- Emotion/intent analysis with GPT-4
- Generate reaction images with DALL-E

## Step 2: Supabase (Auth + Database)

1. Go to: https://supabase.com
2. Create a new project
3. Go to Settings → API
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret** → `SUPABASE_SERVICE_ROLE_KEY`

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**What it does:**
- User sign in/sign up (Sign In button in header)
- Save user profile and reaction history
- Store generation history

### Google Sign-In (Optional)

If you want "Continue with Google" to work:

1. In Supabase: Authentication -> Providers -> Google -> Enable
2. Add Google OAuth client ID and secret
3. In your `.env.local`, add:
   ```
   NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
   ```

If this flag is missing or false, the Google button stays disabled to avoid redirect errors.

## Step 3: Cloudinary (Media Storage)

1. Go to: https://cloudinary.com
2. Sign up or log in
3. Go to Dashboard → Settings → API
4. Copy **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
5. Create Upload Preset:
   - Settings → Upload → Presets → Add one
   - Choose "Unsigned" mode
   - Copy preset name → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Add to `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=yourcloudname
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yourpreset
```

**What it does:**
- Store generated images/GIFs on Cloudinary CDN
- Download and share reactions

## Final `.env.local` File

```env
# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_API_KEY=sk-proj-your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=yourcloudname
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yourpreset
```

## Run the App

```bash
npm run dev
```

Open http://localhost:3000

## What Happens Without Keys?

The app will still work! It uses mock AI with these limitations:
- Voice input won't work (needs OpenAI Whisper)
- Sign in button won't save data (needs Supabase)
- Share/Download won't save to CDN (needs Cloudinary)
- But all UI/pages work perfectly

## Cost Estimates

| Service | Free Tier | Typical Cost |
|---------|-----------|--------------|
| OpenAI | $5 credit | $0.002 per image (DALL-E 3) |
| Supabase | Free 500MB | $25/month per million rows |
| Cloudinary | 25 credits/month | Free with limits |

## Troubleshooting

**"API key not found"** → Check `.env.local` is in project root
**"Module not found"** → Run `npm install`
**"Port 3000 in use"** → Kill process with `Get-Process node | Stop-Process`

## Next: Deploy to Vercel

1. Add `.env.local` values to Vercel project settings
2. Push to GitHub
3. Vercel deploys automatically

See README.md for full deployment instructions.
