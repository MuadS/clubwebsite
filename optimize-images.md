# Image Optimization Guide

## Current Image Status
- `imgmenu2.png`: 58KB - Consider optimization
- `imgmenu3.png`: 133KB - Needs optimization (large)
- `imgmenu4.png`: 2KB - Already optimized

## Optimization Recommendations

### 1. Convert to WebP Format
WebP provides 25-35% better compression than PNG/JPEG while maintaining quality.

```bash
# Install imagemagick or use online tools
brew install imagemagick

# Convert PNG to WebP
convert imgmenu2.png -quality 85 imgmenu2.webp
convert imgmenu3.png -quality 85 imgmenu3.webp
convert imgmenu4.png -quality 85 imgmenu4.webp
```

### 2. Optimize PNG Files
For browsers that don't support WebP, optimize PNG files:

```bash
# Install pngquant for PNG optimization
brew install pngquant

# Optimize PNG files
pngquant --quality=65-80 --ext .png --force imgmenu2.png
pngquant --quality=65-80 --ext .png --force imgmenu3.png
```

### 3. Implement Progressive Loading
Use the `loading="lazy"` attribute for images below the fold:

```html
<img src="imgmenu3.png" alt="Description" loading="lazy">
```

### 4. Use Picture Element for Format Fallbacks
```html
<picture>
  <source srcset="imgmenu3.webp" type="image/webp">
  <img src="imgmenu3.png" alt="Description" loading="lazy">
</picture>
```

### 5. Responsive Images
For different screen sizes:

```html
<picture>
  <source media="(max-width: 768px)" srcset="imgmenu3-mobile.webp" type="image/webp">
  <source media="(max-width: 768px)" srcset="imgmenu3-mobile.png">
  <source srcset="imgmenu3.webp" type="image/webp">
  <img src="imgmenu3.png" alt="Description" loading="lazy">
</picture>
```

## Performance Targets
- Images should be under 100KB each
- Use WebP format when possible
- Implement lazy loading for below-fold images
- Use appropriate dimensions (don't scale down large images with CSS)

## Tools for Optimization
- **Online**: TinyPNG, Squoosh.app, Cloudinary
- **CLI**: imagemagick, pngquant, cwebp
- **Build tools**: imagemin (for future build process)