#!/usr/bin/env node

/**
 * Simple accessibility validation script
 * Checks HTML files for common accessibility issues
 */

const fs = require('fs');
const path = require('path');

// HTML files to check
const htmlFiles = [
    'index.html',
    'projects.html',
    'about.html',
    '404.html',
    'projects/tumor-detector.html',
    'projects/crystal-growth.html'
];

function checkAccessibility(filePath) {
    console.log(`\n🔍 Checking ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let issues = 0;
    
    // Check for lang attribute
    if (!content.includes('lang="en"')) {
        console.log('❌ Missing lang attribute on html element');
        issues++;
    } else {
        console.log('✅ HTML lang attribute present');
    }
    
    // Check for skip links
    if (!content.includes('skip-link')) {
        console.log('❌ Missing skip link');
        issues++;
    } else {
        console.log('✅ Skip link present');
    }
    
    // Check for ARIA labels on navigation
    if (content.includes('<nav') && !content.includes('aria-label')) {
        console.log('❌ Navigation missing ARIA label');
        issues++;
    } else if (content.includes('<nav')) {
        console.log('✅ Navigation has ARIA label');
    }
    
    // Check for alt text on images
    const imgMatches = content.match(/<img[^>]*>/g) || [];
    let imagesWithoutAlt = 0;
    imgMatches.forEach(img => {
        if (!img.includes('alt=')) {
            imagesWithoutAlt++;
        }
    });
    
    if (imagesWithoutAlt > 0) {
        console.log(`❌ ${imagesWithoutAlt} images missing alt text`);
        issues += imagesWithoutAlt;
    } else if (imgMatches.length > 0) {
        console.log(`✅ All ${imgMatches.length} images have alt text`);
    }
    
    // Check for form labels
    const inputMatches = content.match(/<input[^>]*>/g) || [];
    let inputsWithoutLabels = 0;
    inputMatches.forEach(input => {
        const idMatch = input.match(/id="([^"]*)"/);
        if (idMatch) {
            const id = idMatch[1];
            const labelRegex = new RegExp(`<label[^>]*for="${id}"`);
            const ariaLabelRegex = /aria-label="[^"]*"/;
            const ariaLabelledbyRegex = /aria-labelledby="[^"]*"/;
            
            if (!labelRegex.test(content) && !ariaLabelRegex.test(input) && !ariaLabelledbyRegex.test(input)) {
                inputsWithoutLabels++;
            }
        }
    });
    
    if (inputsWithoutLabels > 0) {
        console.log(`❌ ${inputsWithoutLabels} inputs missing labels`);
        issues += inputsWithoutLabels;
    } else if (inputMatches.length > 0) {
        console.log(`✅ All ${inputMatches.length} inputs have labels`);
    }
    
    // Check for heading structure
    const h1Matches = content.match(/<h1[^>]*>/g) || [];
    if (h1Matches.length !== 1) {
        console.log(`❌ Found ${h1Matches.length} H1 elements (should be exactly 1)`);
        issues++;
    } else {
        console.log('✅ Proper H1 structure (exactly 1 H1)');
    }
    
    // Check for ARIA live regions
    if (content.includes('aria-live')) {
        console.log('✅ ARIA live regions present');
    }
    
    // Check for role attributes
    if (content.includes('role=')) {
        console.log('✅ ARIA roles present');
    }
    
    console.log(`📊 Total issues found: ${issues}`);
    return issues;
}

function main() {
    console.log('🚀 Running accessibility validation...\n');
    
    let totalIssues = 0;
    
    htmlFiles.forEach(file => {
        totalIssues += checkAccessibility(file);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📋 SUMMARY: ${totalIssues} total accessibility issues found`);
    
    if (totalIssues === 0) {
        console.log('🎉 All accessibility checks passed!');
    } else {
        console.log('⚠️  Please address the issues above');
    }
    
    console.log('='.repeat(50));
}

if (require.main === module) {
    main();
}

module.exports = { checkAccessibility };