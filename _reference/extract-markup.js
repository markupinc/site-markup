const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('=== NAVIGATING TO SITE ===');
  await page.goto('https://markupincorporacoes.com.br/', { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Page loaded. Waiting 5 seconds for JS...');
  await page.waitForTimeout(5000);

  // 1. META TAGS
  console.log('\n\n========================================');
  console.log('=== META TAGS ===');
  console.log('========================================');
  const meta = await page.evaluate(() => {
    const getMeta = (name) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el ? el.getAttribute('content') : null;
    };
    return {
      title: document.title,
      description: getMeta('description'),
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image'),
      ogUrl: getMeta('og:url'),
      ogType: getMeta('og:type'),
      twitterCard: getMeta('twitter:card'),
      twitterTitle: getMeta('twitter:title'),
      twitterDescription: getMeta('twitter:description'),
      twitterImage: getMeta('twitter:image'),
      keywords: getMeta('keywords'),
      author: getMeta('author'),
      viewport: getMeta('viewport'),
      themeColor: getMeta('theme-color'),
      canonical: (() => { const el = document.querySelector('link[rel="canonical"]'); return el ? el.href : null; })(),
      favicon: (() => { const el = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]'); return el ? el.href : null; })(),
    };
  });
  for (const [key, value] of Object.entries(meta)) {
    if (value) console.log(`${key}: ${value}`);
  }

  // 2. ALL TEXT CONTENT
  console.log('\n\n========================================');
  console.log('=== FULL TEXT CONTENT (document.body.innerText) ===');
  console.log('========================================');
  const fullText = await page.evaluate(() => document.body.innerText);
  console.log(fullText);

  // 2b. Structured text extraction
  console.log('\n\n========================================');
  console.log('=== STRUCTURED TEXT BY ELEMENT ===');
  console.log('========================================');
  const structuredText = await page.evaluate(() => {
    const results = [];
    const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span', 'a', 'button', 'label', 'blockquote', 'figcaption'];
    selectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      els.forEach((el, i) => {
        const text = el.innerText?.trim();
        if (text && text.length > 0 && text.length < 2000) {
          results.push({ tag: sel.toUpperCase(), index: i, text: text.substring(0, 500) });
        }
      });
    });
    return results;
  });
  structuredText.forEach(item => {
    console.log(`[${item.tag}#${item.index}] ${item.text}`);
  });

  // 3. ALL IMAGES
  console.log('\n\n========================================');
  console.log('=== ALL IMAGES ===');
  console.log('========================================');
  const images = await page.evaluate(() => {
    const results = [];
    // img tags
    document.querySelectorAll('img').forEach((img, i) => {
      results.push({
        type: 'img',
        src: img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '',
        srcset: img.srcset || img.getAttribute('data-srcset') || '',
        alt: img.alt || '',
        width: img.naturalWidth || img.width || '',
        height: img.naturalHeight || img.height || '',
        loading: img.loading || '',
        classes: img.className || '',
      });
    });
    // background images
    const allEls = document.querySelectorAll('*');
    allEls.forEach(el => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const urls = bg.match(/url\(["']?(.*?)["']?\)/g);
        if (urls) {
          urls.forEach(u => {
            const url = u.replace(/url\(["']?/, '').replace(/["']?\)/, '');
            if (url && !url.startsWith('data:') && url.length < 500) {
              results.push({
                type: 'background-image',
                src: url,
                element: el.tagName,
                classes: el.className?.toString()?.substring(0, 200) || '',
              });
            }
          });
        }
      }
    });
    // source/picture
    document.querySelectorAll('source').forEach(s => {
      if (s.srcset) {
        results.push({
          type: 'source',
          srcset: s.srcset,
          media: s.media || '',
          type_attr: s.type || '',
        });
      }
    });
    // SVG
    document.querySelectorAll('svg').forEach((svg, i) => {
      results.push({
        type: 'svg',
        index: i,
        viewBox: svg.getAttribute('viewBox') || '',
        classes: svg.className?.baseVal || svg.className || '',
        width: svg.getAttribute('width') || '',
        height: svg.getAttribute('height') || '',
      });
    });
    return results;
  });
  images.forEach((img, i) => {
    console.log(`[IMAGE ${i}] type=${img.type} src=${img.src || ''} srcset=${img.srcset || ''} alt=${img.alt || ''} classes=${img.classes || ''} element=${img.element || ''}`);
    if (img.viewBox) console.log(`  viewBox=${img.viewBox} width=${img.width} height=${img.height}`);
  });

  // 4. ALL LINKS
  console.log('\n\n========================================');
  console.log('=== ALL LINKS ===');
  console.log('========================================');
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText?.trim()?.substring(0, 200) || '',
      href: a.href,
      target: a.target || '',
      rel: a.rel || '',
      classes: a.className?.substring(0, 200) || '',
      ariaLabel: a.getAttribute('aria-label') || '',
    }));
  });
  links.forEach((link, i) => {
    console.log(`[LINK ${i}] text="${link.text}" href=${link.href} target=${link.target} aria="${link.ariaLabel}"`);
  });

  // 5. FORMS
  console.log('\n\n========================================');
  console.log('=== FORMS ===');
  console.log('========================================');
  const forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      id: f.id || '',
      classes: f.className || '',
      fields: Array.from(f.querySelectorAll('input, select, textarea, button')).map(i => ({
        tag: i.tagName.toLowerCase(),
        type: i.type || '',
        name: i.name || '',
        placeholder: i.placeholder || '',
        value: i.value || '',
        required: i.required || false,
        id: i.id || '',
        classes: i.className?.substring(0, 200) || '',
      }))
    }));
  });
  if (forms.length === 0) {
    console.log('No forms found.');
  }
  forms.forEach((form, i) => {
    console.log(`[FORM ${i}] action=${form.action} method=${form.method} id=${form.id}`);
    form.fields.forEach((field, j) => {
      console.log(`  [FIELD ${j}] tag=${field.tag} type=${field.type} name=${field.name} placeholder="${field.placeholder}" required=${field.required}`);
    });
  });

  // 6. SOCIAL MEDIA, WHATSAPP, PHONE, EMAIL
  console.log('\n\n========================================');
  console.log('=== SOCIAL / WHATSAPP / PHONE / EMAIL ===');
  console.log('========================================');
  const contactInfo = await page.evaluate(() => {
    const results = { social: [], whatsapp: [], phone: [], email: [], maps: [] };
    const allLinks = Array.from(document.querySelectorAll('a[href]'));

    allLinks.forEach(a => {
      const href = a.href.toLowerCase();
      const text = a.innerText?.trim() || a.getAttribute('aria-label') || '';

      if (href.includes('facebook.com') || href.includes('fb.com'))
        results.social.push({ platform: 'Facebook', href: a.href, text });
      if (href.includes('instagram.com'))
        results.social.push({ platform: 'Instagram', href: a.href, text });
      if (href.includes('linkedin.com'))
        results.social.push({ platform: 'LinkedIn', href: a.href, text });
      if (href.includes('twitter.com') || href.includes('x.com'))
        results.social.push({ platform: 'Twitter/X', href: a.href, text });
      if (href.includes('youtube.com'))
        results.social.push({ platform: 'YouTube', href: a.href, text });
      if (href.includes('tiktok.com'))
        results.social.push({ platform: 'TikTok', href: a.href, text });
      if (href.includes('pinterest.com'))
        results.social.push({ platform: 'Pinterest', href: a.href, text });

      if (href.includes('wa.me') || href.includes('whatsapp.com') || href.includes('api.whatsapp'))
        results.whatsapp.push({ href: a.href, text });

      if (href.startsWith('tel:'))
        results.phone.push({ href: a.href, text });

      if (href.startsWith('mailto:'))
        results.email.push({ href: a.href, text });

      if (href.includes('google.com/maps') || href.includes('goo.gl/maps') || href.includes('maps.app'))
        results.maps.push({ href: a.href, text });
    });

    // Also search for phone/email patterns in body text
    const bodyText = document.body.innerText;
    const phoneMatches = bodyText.match(/(?:\+55\s?)?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g);
    if (phoneMatches) results.phoneInText = [...new Set(phoneMatches)];

    const emailMatches = bodyText.match(/[\w.-]+@[\w.-]+\.\w{2,}/g);
    if (emailMatches) results.emailInText = [...new Set(emailMatches)];

    return results;
  });

  console.log('Social media links:');
  contactInfo.social.forEach(s => console.log(`  ${s.platform}: ${s.href} (text: "${s.text}")`));
  if (contactInfo.social.length === 0) console.log('  None found');

  console.log('WhatsApp links:');
  contactInfo.whatsapp.forEach(w => console.log(`  ${w.href} (text: "${w.text}")`));
  if (contactInfo.whatsapp.length === 0) console.log('  None found');

  console.log('Phone links:');
  contactInfo.phone.forEach(p => console.log(`  ${p.href} (text: "${p.text}")`));
  if (contactInfo.phone.length === 0) console.log('  None found');

  console.log('Email links:');
  contactInfo.email.forEach(e => console.log(`  ${e.href} (text: "${e.text}")`));
  if (contactInfo.email.length === 0) console.log('  None found');

  console.log('Google Maps links:');
  contactInfo.maps.forEach(m => console.log(`  ${m.href} (text: "${m.text}")`));
  if (contactInfo.maps.length === 0) console.log('  None found');

  console.log('Phone numbers found in text:');
  if (contactInfo.phoneInText) contactInfo.phoneInText.forEach(p => console.log(`  ${p}`));
  else console.log('  None found');

  console.log('Emails found in text:');
  if (contactInfo.emailInText) contactInfo.emailInText.forEach(e => console.log(`  ${e}`));
  else console.log('  None found');

  // 7. SCRIPTS & LIBRARIES
  console.log('\n\n========================================');
  console.log('=== DETECTED SCRIPTS & LIBRARIES ===');
  console.log('========================================');
  const scripts = await page.evaluate(() => {
    const libs = {
      AOS: typeof AOS !== 'undefined',
      GSAP: typeof gsap !== 'undefined',
      ScrollTrigger: typeof ScrollTrigger !== 'undefined',
      Lottie: typeof lottie !== 'undefined',
      ThreeJS: typeof THREE !== 'undefined',
      jQuery: typeof jQuery !== 'undefined',
      FramerMotion: !!document.querySelector('[data-framer-appear-id]'),
      Swiper: typeof Swiper !== 'undefined',
    };
    const scriptSrcs = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    return { libs, scriptSrcs };
  });
  console.log('Libraries detected:');
  for (const [name, found] of Object.entries(scripts.libs)) {
    if (found) console.log(`  ${name}: YES`);
  }
  console.log('Script sources:');
  scripts.scriptSrcs.forEach(s => console.log(`  ${s}`));

  // 8. CSS VARIABLES / CUSTOM PROPERTIES
  console.log('\n\n========================================');
  console.log('=== CSS CUSTOM PROPERTIES (root) ===');
  console.log('========================================');
  const cssVars = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const vars = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                vars.push({ prop, value: style.getPropertyValue(prop).trim() });
              }
            }
          }
        }
      } catch(e) {}
    }
    return vars;
  });
  if (cssVars.length === 0) console.log('No CSS custom properties found on :root');
  cssVars.forEach(v => console.log(`  ${v.prop}: ${v.value}`));

  // 9. SECTIONS / STRUCTURE
  console.log('\n\n========================================');
  console.log('=== PAGE STRUCTURE (sections) ===');
  console.log('========================================');
  const sections = await page.evaluate(() => {
    const results = [];
    const sectionEls = document.querySelectorAll('section, header, nav, main, footer, [class*="section"], [id*="section"]');
    sectionEls.forEach((el, i) => {
      results.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        classes: el.className?.toString()?.substring(0, 300) || '',
        childCount: el.children.length,
        textPreview: el.innerText?.substring(0, 150)?.replace(/\n/g, ' ') || '',
      });
    });
    return results;
  });
  sections.forEach((s, i) => {
    console.log(`[SECTION ${i}] <${s.tag}> id="${s.id}" classes="${s.classes}" children=${s.childCount}`);
    console.log(`  preview: ${s.textPreview}`);
  });

  console.log('\n\n=== EXTRACTION COMPLETE ===');
  await browser.close();
})();
