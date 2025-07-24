# Design Document

## Overview

The UH Med-Tech Society website will be built as a static site using vanilla HTML, CSS, and JavaScript with serverless functions for ML model integration. The architecture prioritizes simplicity, maintainability, and fast deployment while providing an engaging user experience that showcases the club's technical capabilities. Color scheme must be centered around #4ECCF2.

## Architecture

### Site Structure
```
/
├── index.html              # Home page with events and navigation
├── projects.html           # Projects hub with tumor demo + project cards
├── about.html              # Executive team profiles
├── projects/
│   ├── tumor-detector.html # Individual project pages
│   ├── crystal-growth.html
│   └── _template.html      # Template for new projects
├── css/
│   └── style.css          # Global styles
├── js/
│   ├── tumor.js           # Tumor demo functionality
│   └── cards.js           # Project card interactions (optional)
├── functions/
│   └── run-tumor.js       # Serverless proxy for HuggingFace API
└── assets/
    ├── images/            # Project screenshots, logos
    └── headshots/         # Executive team photos
```

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Deployment**: Netlify/Vercel/Cloudflare Pages
- **ML Integration**: HuggingFace Inference API via serverless functions
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **No Build Tools**: Direct deployment of source files

## Components and Interfaces

### 1. Navigation Component
**Purpose**: Consistent navigation across all pages
**Implementation**: 
- Simple HTML nav element with CSS styling
- Active page highlighting
- Mobile-responsive hamburger menu (if needed)

### 2. Hero Section Component
**Purpose**: Prominent display of key content (events, tumor demo)
**Styling Classes**:
```css
.hero {
  padding: 4rem 1rem;
  text-align: center;
  background: #f5f5ff;
}
```

### 3. Card Grid Component
**Purpose**: Display projects and team members in responsive grid
**Implementation**:
```css
.card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  padding: 2rem 1rem;
}

.card {
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 10px rgba(0,0,0,.08);
  transition: transform .15s ease;
}

.card:hover {
  transform: scale(1.04);
}
```

### 4. Tumor Demo Component
**Purpose**: Interactive ML model demonstration
**Elements**:
- File upload input (accept="image/*")
- Submit button with loading states
- Result display area for heat-map visualization
- Error handling display

### 5. Project Template Component
**Purpose**: Consistent layout for individual project pages
**Sections**:
- Navigation breadcrumb
- Project hero with title and description
- Problem & Dataset section
- Method section
- Interactive demo section

## Data Models

### Project Data Structure
```javascript
{
  title: "Tumor Detector",
  slug: "tumor-detector",
  description: "Vision Transformer, histology slides",
  tags: ["vision", "medical", "team-rishav"],
  methodology: "Vision Transformer fine-tuned on TCGA slides",
  dataset: "Histology slides from multiple cancer types",
  performance: "92% AUROC",
  demoType: "file-upload" | "iframe" | "link"
}
```

### Team Member Data Structure
```javascript
{
  name: "Member Name",
  role: "President | Vice President | Secretary | etc.",
  bio: "1-2 sentence biography",
  headshot: "/assets/headshots/member-name.jpg",
  expertise: ["machine-learning", "web-development", "research"]
}
```

### Event Data Structure
```javascript
{
  title: "Weekly Meeting",
  date: "2024-01-15",
  time: "6:00 PM",
  location: "Engineering Building Room 101",
  description: "Discussion of current projects and new member orientation"
}
```

## Error Handling

### File Upload Errors
- **File too large**: Display size limit message
- **Invalid file type**: Show accepted formats
- **Network errors**: Retry mechanism with user feedback
- **API errors**: Clear error messages with status codes

### Navigation Errors
- **404 pages**: Custom 404.html with navigation back to home
- **Broken links**: Validation during development
- **Missing assets**: Fallback images and graceful degradation

### API Integration Errors
- **HuggingFace API failures**: Timeout handling and error messages
- **Serverless function errors**: Proper HTTP status codes
- **Rate limiting**: User-friendly messages about usage limits

## Testing Strategy

### Manual Testing Checklist
1. **Cross-browser compatibility**: Chrome, Firefox, Safari, Edge
2. **Responsive design**: Mobile (320px+), tablet (768px+), desktop (1024px+)
3. **File upload functionality**: Various image formats and sizes
4. **Navigation flow**: All internal links work correctly
5. **Performance**: Page load times under 3 seconds
6. **Accessibility**: Keyboard navigation, screen reader compatibility

### Automated Testing (Future Enhancement)
- **Unit tests**: JavaScript functions using Jest
- **Integration tests**: API endpoints using Cypress
- **Visual regression tests**: Screenshot comparisons
- **Performance tests**: Lighthouse CI integration

### Content Validation
- **Link checking**: Ensure all internal/external links work
- **Image optimization**: Compress images for web delivery
- **Content review**: Spelling, grammar, and technical accuracy
- **SEO validation**: Meta tags, structured data, sitemap

## Deployment Configuration

### Netlify Configuration
```toml
# netlify.toml
[build]
  functions = "functions"
  publish = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### Environment Variables
- `HF_TOKEN`: HuggingFace API token for model inference
- `NODE_ENV`: Environment setting for development/production

### Performance Optimizations
- **Image optimization**: WebP format with fallbacks
- **CSS minification**: Production build optimization
- **JavaScript bundling**: Minimal, only when necessary
- **CDN delivery**: Automatic via deployment platform
- **Caching headers**: Static asset caching configuration

## Security Considerations

### API Security
- **Token protection**: HuggingFace token stored as environment variable
- **CORS configuration**: Restrict origins in production
- **Rate limiting**: Implement request throttling
- **Input validation**: Sanitize file uploads

### Content Security
- **XSS prevention**: Escape user-generated content
- **CSRF protection**: Not applicable for static site
- **HTTPS enforcement**: Automatic via deployment platform
- **Security headers**: CSP, HSTS, X-Frame-Options

This design provides a solid foundation for the UH Med-Tech Society website that meets all requirements while maintaining simplicity and extensibility for future enhancements.