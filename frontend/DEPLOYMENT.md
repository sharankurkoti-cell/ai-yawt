# YawtAI Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Domain name (optional)

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Update environment variables:**
   ```bash
   # Replace with your actual Supabase values
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_URL=https://your-domain.com
   ```

### Build for Production

#### Option 1: Using Scripts
```bash
# On Windows
deploy.bat

# On Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual Build
```bash
# Install dependencies
npm ci

# Build for production
npm run build
```

### Deployment Options

#### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### 3. GitHub Pages
```bash
# Install gh-pages
npm i -g gh-pages

# Deploy
gh-pages -d dist
```

#### 4. Custom Hosting
Upload the `dist` folder to your web server's public directory.

### Post-Deployment Checklist

- [ ] Update Supabase CORS settings to include your domain
- [ ] Test authentication flow
- [ ] Test download functionality
- [ ] Verify AI chat functionality
- [ ] Check desktop app download links

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_APP_URL` | Your deployed app URL | ✅ |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | ❌ |
| `VITE_GA_ID` | Google Analytics ID | ❌ |

### Build Output

The production build creates optimized files in the `dist/` folder:

- **HTML**: `index.html` (1.6 kB)
- **CSS**: Optimized styles (91 kB)
- **JavaScript**: Code-split into chunks (~650 kB total)
- **Assets**: Images and desktop installers

### Performance Optimization

- ✅ Code splitting for faster initial load
- ✅ Image optimization
- ✅ CSS/JS minification
- ✅ Gzip compression ready
- ✅ Browser caching headers

### Security Considerations

- ✅ Environment variables not exposed in build
- ✅ Supabase security rules configured
- ✅ HTTPS enforced in production
- ✅ Content Security Policy headers

### Monitoring

Consider setting up:
- Error tracking (Sentry, etc.)
- Performance monitoring
- Uptime monitoring
- Analytics tracking

### Troubleshooting

#### Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

#### Deployment Issues
- Check environment variables
- Verify Supabase configuration
- Test CORS settings
- Check browser console for errors

### Support

For deployment issues:
1. Check this guide first
2. Review error logs
3. Verify environment setup
4. Test in staging environment

---

**🎉 Your YawtAI platform is ready for production deployment!**
