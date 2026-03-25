const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://www.dimasconstrucoes.com.br', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for content to load
  await page.waitForTimeout(3000);

  // Extract all text by section
  const textContent = await page.evaluate(() => document.body.innerText);

  // Extract images
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));
  });

  // Extract links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    }));
  });

  // Detect animation libraries
  const libs = await page.evaluate(() => ({
    AOS: typeof AOS !== 'undefined',
    GSAP: typeof gsap !== 'undefined',
    ScrollTrigger: typeof ScrollTrigger !== 'undefined',
    Lottie: typeof lottie !== 'undefined',
    ThreeJS: typeof THREE !== 'undefined',
    FramerMotion: !!document.querySelector('[data-framer-appear-id]'),
    Swiper: typeof Swiper !== 'undefined'
  }));

  // Extract CSS animations
  const animations = await page.evaluate(() => {
    const results = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSKeyframesRule)
            results.push({ name: rule.name, type: 'keyframes' });
          if (rule.style?.animation && rule.style.animation !== 'none')
            results.push({ selector: rule.selectorText, animation: rule.style.animation });
          if (rule.style?.transition && rule.style.transition !== 'all 0s ease 0s' && rule.style.transition !== '')
            results.push({ selector: rule.selectorText, transition: rule.style.transition });
        }
      } catch(e) {}
    }
    return results;
  });

  // Extract animated DOM elements
  const animatedEls = await page.evaluate(() => {
    const attrs = ['data-aos','data-scroll','data-animate','data-sal','data-aos-delay','data-aos-duration','data-speed'];
    return Array.from(document.querySelectorAll('*'))
      .filter(el => attrs.some(a => el.hasAttribute(a)))
      .map(el => ({
        tag: el.tagName, classes: el.className,
        animAttrs: Object.fromEntries(
          attrs.filter(a => el.hasAttribute(a)).map(a => [a, el.getAttribute(a)])
        )
      }));
  });

  // Get all CSS custom properties from :root
  const cssVars = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const vars = {};
    for (const prop of Array.from(document.styleSheets).flatMap(s => { try { return Array.from(s.cssRules) } catch(e) { return [] } })) {
      if (prop.selectorText === ':root' && prop.style) {
        for (let i = 0; i < prop.style.length; i++) {
          const name = prop.style[i];
          if (name.startsWith('--')) vars[name] = prop.style.getPropertyValue(name);
        }
      }
    }
    return vars;
  });

  console.log('=== TEXT CONTENT ===');
  console.log(textContent);
  console.log('\n=== IMAGES ===');
  console.log(JSON.stringify(images, null, 2));
  console.log('\n=== LINKS ===');
  console.log(JSON.stringify(links, null, 2));
  console.log('\n=== ANIMATION LIBRARIES ===');
  console.log(JSON.stringify(libs, null, 2));
  console.log('\n=== CSS ANIMATIONS ===');
  console.log(JSON.stringify(animations.slice(0, 30), null, 2));
  console.log('\n=== ANIMATED ELEMENTS ===');
  console.log(JSON.stringify(animatedEls, null, 2));
  console.log('\n=== CSS VARS ===');
  console.log(JSON.stringify(cssVars, null, 2));

  await browser.close();
})();
