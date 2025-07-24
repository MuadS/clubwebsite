# Deployment Testing Guide

## Environment Variables Required

### Netlify
Set these in Netlify dashboard under Site settings > Environment variables:
```
HF_TOKEN=your_huggingface_token_here
NODE_ENV=production
```

### Vercel
Set these in Vercel dashboard under Project Settings > Environment Variables:
```
HF_TOKEN=your_huggingface_token_here
NODE_ENV=production
```

## Testing Checklist

### 1. Local Development Test
```bash
# Install dependencies
npm install

# Test local development
npm run dev

# Verify:
- Site loads at http://localhost:8888
- Tumor detector form works
- All navigation links function
- Images load properly
```

### 2. Security Headers Test
Use online tools or curl to verify headers:

```bash
# Test security headers
curl -I https://your-site.netlify.app

# Should include:
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# Content-Security-Policy: [policy string]
```

### 3. Performance Test
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/

Target metrics:
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### 4. Functionality Test
- [ ] Homepage loads and displays events
- [ ] Projects page loads with tumor demo
- [ ] File upload works in tumor detector
- [ ] Project cards are clickable and navigate correctly
- [ ] About page displays team members
- [ ] All internal links work
- [ ] 404 page displays for invalid URLs
- [ ] Mobile responsive design works

### 5. API Integration Test
```bash
# Test tumor detection API
curl -X POST https://your-site.netlify.app/api/run-tumor \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image_data"}'

# Should return:
# - 200 status for valid requests
# - Proper error handling for invalid requests
# - CORS headers for cross-origin requests
```

## Deployment Commands

### Netlify
```bash
# Deploy via CLI
netlify deploy --prod

# Or connect GitHub repo in Netlify dashboard
```

### Vercel
```bash
# Deploy via CLI
vercel --prod

# Or connect GitHub repo in Vercel dashboard
```

### Manual Deployment Verification
1. Check all pages load without errors
2. Verify SSL certificate is active (https://)
3. Test form submissions
4. Check console for JavaScript errors
5. Validate responsive design on mobile devices