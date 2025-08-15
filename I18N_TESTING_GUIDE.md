# FilmFusion Internationalization Testing Guide

## Overview
This guide provides comprehensive testing procedures for FilmFusion's multi-language functionality across 6 supported languages: English (en), Spanish (es), French (fr), German (de), Chinese (zh), and Japanese (ja).

## Pre-Testing Setup

### Environment Variables
Ensure the following are configured:
- Next.js i18n middleware is active
- All translation files are present in `/messages/` directory
- Locale routing is properly configured

### Required Files Checklist
- ✅ `i18n.ts` - Main i18n configuration
- ✅ `middleware.ts` - Locale detection and routing
- ✅ `i18n/routing.ts` - Routing configuration
- ✅ `messages/en.json` - English translations
- ✅ `messages/es.json` - Spanish translations
- ✅ `messages/fr.json` - French translations
- ✅ `messages/de.json` - German translations
- ✅ `messages/zh.json` - Chinese translations
- ✅ `messages/ja.json` - Japanese translations

## Testing Procedures

### 1. URL Routing Tests

**Test 1.1: Default Locale Redirect**
1. Navigate to root URL: `http://localhost:3000/`
2. ✅ Should redirect to: `http://localhost:3000/en`
3. ✅ Page should display in English

**Test 1.2: Direct Locale Access**
Test each locale URL:
- `http://localhost:3000/en` → English content
- `http://localhost:3000/es` → Spanish content
- `http://localhost:3000/fr` → French content
- `http://localhost:3000/de` → German content
- `http://localhost:3000/zh` → Chinese content
- `http://localhost:3000/ja` → Japanese content

**Test 1.3: Invalid Locale Handling**
1. Navigate to: `http://localhost:3000/invalid`
2. ✅ Should return 404 Not Found
3. ✅ Should not crash the application

### 2. Language Switcher Tests

**Test 2.1: Language Switcher Visibility**
1. Navigate to any page
2. ✅ Language switcher should be visible in header
3. ✅ Current language should be highlighted
4. ✅ Flag and language name should display correctly

**Test 2.2: Language Switching Functionality**
For each language pair, test switching:
1. Start on English (`/en`)
2. Click language switcher
3. Select Spanish
4. ✅ URL should change to `/es`
5. ✅ Content should update to Spanish
6. ✅ Language switcher should show Spanish as selected
7. Repeat for all language combinations

**Test 2.3: Language Persistence**
1. Switch to a non-English language
2. Navigate to different pages (auth, pricing, etc.)
3. ✅ Language should persist across navigation
4. ✅ All pages should display in selected language

### 3. Content Translation Tests

**Test 3.1: Landing Page Content**
For each language, verify all sections are translated:

**Navigation**
- ✅ Features
- ✅ How It Works
- ✅ Pricing
- ✅ Reviews
- ✅ Sign In
- ✅ Start Free Trial

**Hero Section**
- ✅ Badge text
- ✅ Main heading with dynamic content
- ✅ Description paragraph
- ✅ CTA buttons
- ✅ Statistics (creators, rating, faster)

**Features Section**
- ✅ Section title and description
- ✅ All 6 feature cards (titles and descriptions)

**How It Works Section**
- ✅ Section title and description
- ✅ All 4 steps (titles and descriptions)

**Pricing Section**
- ✅ Section title and description
- ✅ All 3 plans (names, prices, descriptions, features, CTAs)
- ✅ "Most Popular" badge

**Testimonials Section**
- ✅ Section title and description
- ✅ All 3 testimonials (names, roles, content)

**CTA Section**
- ✅ Title and description
- ✅ Button text

**Footer**
- ✅ Description
- ✅ All footer links and sections

**Test 3.2: Authentication Pages**
For each language, verify:

**Sign In Page**
- ✅ Page title and description
- ✅ Form labels (Email, Password)
- ✅ "Forgot password?" link
- ✅ Sign in button
- ✅ "Don't have an account?" text
- ✅ Sign up link

**Sign Up Page**
- ✅ Page title and description
- ✅ Form labels (Name, Email, Password, Confirm Password)
- ✅ Sign up button
- ✅ "Already have an account?" text
- ✅ Sign in link

### 4. Dynamic Content Tests

**Test 4.1: Interpolated Content**
1. Check hero title with dynamic `{aiAutomation}` variable
2. ✅ Should properly interpolate in all languages
3. ✅ Grammar and word order should be correct

**Test 4.2: Pluralization (if implemented)**
1. Test any plural forms in different languages
2. ✅ Should use correct plural rules for each language

### 5. Typography and Layout Tests

**Test 5.1: Text Overflow and Layout**
For each language, check:
- ✅ No text overflow in buttons
- ✅ No layout breaking with longer translations
- ✅ Proper text wrapping in cards and sections
- ✅ Consistent spacing and alignment

**Test 5.2: RTL Language Support (Future)**
Note: Currently not implemented, but consider for Arabic/Hebrew support

**Test 5.3: Font Rendering**
- ✅ English: Work Sans + Open Sans render correctly
- ✅ Spanish: Accented characters display properly
- ✅ French: Accented characters display properly
- ✅ German: Umlauts and ß display properly
- ✅ Chinese: Characters render with appropriate font fallbacks
- ✅ Japanese: Characters render with appropriate font fallbacks

### 6. SEO and Metadata Tests

**Test 6.1: HTML Lang Attribute**
For each locale:
1. View page source
2. ✅ `<html lang="xx">` should match current locale
3. ✅ Should update when language is switched

**Test 6.2: Meta Tags (Future Enhancement)**
Consider implementing localized meta descriptions and titles

### 7. Error Handling Tests

**Test 7.1: Missing Translation Keys**
1. Temporarily remove a translation key from one language file
2. ✅ Should display fallback (key name) instead of crashing
3. ✅ Should log warning in development console

**Test 7.2: Malformed Translation Files**
1. Temporarily add invalid JSON to a translation file
2. ✅ Should handle gracefully without crashing
3. ✅ Should provide meaningful error message

## Browser Testing Matrix

Test across different browsers and devices:

### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari Mobile
- ✅ Firefox Mobile

### Device Testing
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

## Performance Testing

**Test P.1: Translation Loading**
1. Monitor network tab when switching languages
2. ✅ Translations should load efficiently
3. ✅ No unnecessary re-downloads of translation files

**Test P.2: Initial Page Load**
1. Test first page load for each locale
2. ✅ Should load within acceptable time limits
3. ✅ No blocking on translation loading

## Accessibility Testing

**Test A.1: Screen Reader Compatibility**
1. Test with screen readers in different languages
2. ✅ Content should be properly announced
3. ✅ Language changes should be detected

**Test A.2: Keyboard Navigation**
1. Test language switcher with keyboard only
2. ✅ Should be fully accessible via keyboard
3. ✅ Focus states should be visible

## Automated Testing Checklist

### Unit Tests (Future Implementation)
- [ ] Translation key existence tests
- [ ] Translation completeness tests
- [ ] Interpolation functionality tests

### Integration Tests (Future Implementation)
- [ ] Language switching flow tests
- [ ] URL routing tests
- [ ] Component rendering tests

### E2E Tests (Future Implementation)
- [ ] Full user journey in different languages
- [ ] Cross-browser language switching tests

## Common Issues and Troubleshooting

### Issue 1: Language Not Switching
**Symptoms:** Clicking language switcher doesn't change content
**Solutions:**
1. Check middleware configuration
2. Verify routing setup in `i18n/routing.ts`
3. Ensure useRouter is from `@/i18n/routing`

### Issue 2: Missing Translations
**Symptoms:** Seeing translation keys instead of translated text
**Solutions:**
1. Verify translation key exists in all language files
2. Check JSON syntax in translation files
3. Ensure proper nesting structure

### Issue 3: Layout Breaking
**Symptoms:** UI elements overflow or misalign in certain languages
**Solutions:**
1. Use flexible layouts (flexbox, grid)
2. Test with longest possible translations
3. Implement proper text wrapping

### Issue 4: Font Issues
**Symptoms:** Characters not displaying correctly
**Solutions:**
1. Ensure proper font fallbacks for CJK languages
2. Check font loading configuration
3. Test character rendering across browsers

## Testing Sign-off Checklist

Before marking i18n as production-ready:

### Functionality
- [ ] All 6 languages load correctly
- [ ] Language switcher works on all pages
- [ ] URL routing works for all locales
- [ ] All content is properly translated

### Quality
- [ ] No layout breaking in any language
- [ ] Proper font rendering for all character sets
- [ ] Consistent spacing and alignment
- [ ] No text overflow issues

### Performance
- [ ] Fast language switching
- [ ] Efficient translation loading
- [ ] No performance regressions

### Accessibility
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Proper language attributes

### Browser Compatibility
- [ ] Works in all major browsers
- [ ] Mobile responsive in all languages
- [ ] No browser-specific issues

## Maintenance Guidelines

### Adding New Languages
1. Create new translation file in `/messages/`
2. Add locale to `locales` array in configuration files
3. Add language option to `LanguageSwitcher` component
4. Test thoroughly following this guide

### Updating Translations
1. Update all language files simultaneously
2. Maintain consistent key structure
3. Test all affected languages
4. Verify no keys are missing

### Translation Quality Assurance
1. Use native speakers for translation review
2. Consider cultural context and localization
3. Test with actual users from target regions
4. Regular translation audits and updates

---

**Last Updated:** January 2025
**Version:** 1.0
**Tested Languages:** EN, ES, FR, DE, ZH, JA
