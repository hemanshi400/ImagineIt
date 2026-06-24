# SaySee

SaySee is a modern multilingual AI reaction generation platform prototype built with Next.js, TypeScript, Tailwind CSS, and integrated with OpenAI, Supabase, and Cloudinary.

## Features

- **Landing page** with product positioning and pricing
- **Generate page** with text and browser voice input
- **AI-thinking animation** states (🐵 → 🐱 → 🦊)
- **Results page** with 4 outputs: Sticker, GIF, Meme, Image
- **Trending page** with hot phrases and one-click generation
- **Profile page** with user authentication and history
- **Mobile-first layout** with fixed bottom navigation
- **Multilingual support** (English, Hindi, Gujarati)
- **Real AI integration** (OpenAI, Supabase auth, Cloudinary storage)

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion
- **AI:** OpenAI (Whisper, GPT, DALL-E)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Storage:** Cloudinary
- **Deployment:** Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

#### Get API Keys:

| Service | Get Key | Free Tier |
|---------|---------|-----------|
| **OpenAI** | https://platform.openai.com/api-keys | $5 credit |
| **Supabase** | https://supabase.com | Free tier included |
| **Cloudinary** | https://cloudinary.com | 25 credits/month |

**OpenAI Setup:**
- Create project at https://platform.openai.com
- Go to API keys → Create new secret key
- Copy into `NEXT_PUBLIC_OPENAI_API_KEY` and `OPENAI_API_KEY` in `.env.local`

**Supabase Setup:**
- Create project at https://supabase.com
- Go to Settings → API
- Copy `Project URL` into `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` secret into `SUPABASE_SERVICE_ROLE_KEY`

**Cloudinary Setup:**
- Create account at https://cloudinary.com
- Go to Dashboard → Settings
- Copy Cloud Name into `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Create Upload Preset (Settings → Upload) and copy into `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app                      # Next.js app router
  /api/generate          # AI generation API
  /generate              # Generation page
  /results               # Results page
  /trending              # Trending phrases
  /profile               # User profile
  /layout.tsx            # Root layout with auth provider
  /page.tsx              # Landing page

/components              # Reusable React components
  /auth-modal.tsx        # Sign in/up modal
  /bottom-nav.tsx        # Mobile bottom navigation
  /top-nav.tsx           # Header with auth button
  /reaction-card.tsx     # Reaction output card

/lib                     # Utilities and clients
  /auth-context.tsx      # Auth context provider
  /reaction-engine.ts    # Mock AI logic (fallback)
  /openai-client.ts      # OpenAI API wrapper
  /supabase-client.ts    # Supabase client
  /cloudinary-client.ts  # Cloudinary uploader
  /utils.ts              # Helper functions

/public                  # Static assets
```

## Features by API Integration

### OpenAI
- Speech-to-text (Whisper) - in generate page
- Emotion/intent analysis (GPT)
- Image generation (DALL-E)

### Supabase
- User authentication (email/password)
- User profiles and history storage
- Real-time updates

### Cloudinary
- Media storage and CDN
- Image optimization
- URL-based transformations

## Fallback Behavior

If API keys are not configured, the app will:
- Use mock emotion/intent detection
- Show demo results without saving
- Still maintain full UI/UX functionality

This lets you test the app before adding real services.

## Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial SaySee MVP"
git remote add origin https://github.com/yourusername/saysee.git
git push -u origin main
```

2. Deploy on Vercel:
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Add environment variables from `.env.local`
- Deploy

## Next Steps

- [ ] Connect real DALL-E image generation to results
- [ ] Add user history persistence to Supabase
- [ ] Build NestJS backend service for heavy lifting
- [ ] Add bulk generation API for Creator plan
- [ ] Implement payment processing (Stripe)
- [ ] Add analytics and trending algorithm
- [ ] Create mobile app (React Native)

## License

MIT

