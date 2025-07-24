#!/bin/bash

echo "🚀 Running accessibility validation..."
echo ""

# Files to check
files=("index.html" "projects.html" "about.html" "404.html" "projects/tumor-detector.html" "projects/crystal-growth.html")

total_issues=0

for file in "${files[@]}"; do
    echo "🔍 Checking $file..."
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        continue
    fi
    
    issues=0
    
    # Check for lang attribute
    if ! grep -q 'lang="en"' "$file"; then
        echo "❌ Missing lang attribute on html element"
        ((issues++))
    else
        echo "✅ HTML lang attribute present"
    fi
    
    # Check for skip links
    if ! grep -q 'skip-link' "$file"; then
        echo "❌ Missing skip link"
        ((issues++))
    else
        echo "✅ Skip link present"
    fi
    
    # Check for ARIA labels on navigation
    if grep -q '<nav' "$file" && ! grep -q 'aria-label' "$file"; then
        echo "❌ Navigation missing ARIA label"
        ((issues++))
    elif grep -q '<nav' "$file"; then
        echo "✅ Navigation has ARIA label"
    fi
    
    # Check for alt text on images
    img_count=$(grep -o '<img[^>]*>' "$file" | wc -l)
    img_without_alt=$(grep -o '<img[^>]*>' "$file" | grep -v 'alt=' | wc -l)
    
    if [ "$img_without_alt" -gt 0 ]; then
        echo "❌ $img_without_alt images missing alt text"
        ((issues += img_without_alt))
    elif [ "$img_count" -gt 0 ]; then
        echo "✅ All $img_count images have alt text"
    fi
    
    # Check for H1 structure
    h1_count=$(grep -o '<h1[^>]*>' "$file" | wc -l)
    if [ "$h1_count" -ne 1 ]; then
        echo "❌ Found $h1_count H1 elements (should be exactly 1)"
        ((issues++))
    else
        echo "✅ Proper H1 structure (exactly 1 H1)"
    fi
    
    # Check for ARIA live regions
    if grep -q 'aria-live' "$file"; then
        echo "✅ ARIA live regions present"
    fi
    
    # Check for role attributes
    if grep -q 'role=' "$file"; then
        echo "✅ ARIA roles present"
    fi
    
    echo "📊 Issues found in $file: $issues"
    ((total_issues += issues))
    echo ""
done

echo "=================================================="
echo "📋 SUMMARY: $total_issues total accessibility issues found"

if [ "$total_issues" -eq 0 ]; then
    echo "🎉 All accessibility checks passed!"
else
    echo "⚠️  Please address the issues above"
fi

echo "=================================================="