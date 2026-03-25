# Model 1 — Dimas Construções (www.dimasconstrucoes.com.br)

## Layout System
- Full-width page, max container ~1440px
- Background: `#f5ebe1` (warm beige/cream)
- Sections alternate between beige (`#f5ebe1`) and dark (`#1a1a1a` / near-black)
- Left-aligned content with generous whitespace
- No grid system visible — content uses simple block/flex layouts

## Sections (top to bottom)

### 1. Navbar
- Fixed/sticky top bar, transparent over hero, dark text
- Left: "DIMAS" logo (spaced uppercase letters, thin weight)
- Center: Empreendimentos (dropdown), Jeito Dimas, Blog, Contato (dropdown), Login (dropdown)
- Right: Language selector globe icon (PT/EN/ES)
- Background transitions to solid on scroll (`background-color 0.3s, padding 0.3s`)
- Height: ~50px

### 2. Hero — Full-width Image Slider (Swiper)
- Full viewport width, ~60vh height
- Dark cinematic photos (lake silhouette scene visible)
- Left/right navigation arrows (white chevrons)
- Bottom-right: "Lançamento D/SEASON" label text (white, small)
- Cookie banner overlay at bottom of hero

### 3. Welcome Text Section
- Background: `#f5ebe1`
- Centered text block, large serif/sans heading
- Text: "Bem-vindo ao jeito Dimas de viver Florianópolis..."
- 4 lines, centered alignment
- Font: ~24-30px, light weight, muted brown/tan color
- Very generous vertical padding (~200px+ top and bottom)

### 4. Lançamentos Dimas (Launches)
- Background: white
- Left-aligned heading: "Lançamentos Dimas" (~30px, dark)
- Paragraph text below (~12px, dark)
- First project: D/Verse — full-width large image (~800px wide)
- Caption: "D/Verse" (bold) + "Praia Brava / Florianópolis" (light)
- Next row: 2 columns (D/Season + D/Sense) side by side
- Third row: D/Vert alone (left column only)
- Each project card: image + name (bold) + location (light)
- Bottom: "Veja mais empreendimentos →" link with underline

### 5. Stats Section (Dark)
- Background: `#1a1a1a` (near-black)
- 2x2 grid of stats
- Each stat: decorative diagonal line (/) + large number + label text
- Numbers animate (counter) — showing 0 in screenshot because JS counters
- Labels: "anos de atuação", "clientes", "obras entregues", "uni. entregues"
- White text on dark background
- Below stats: heading "Somos líderes naquilo que fazemos" (~30px white)
- Paragraph text + "Conheça nosso portfólio →" CTA link

### 6. Dimas na mídia (Media)
- Background: white/light
- Left-aligned heading: "Dimas na mídia." (~30px)
- 3-column carousel of news items
- Each: source name (small, muted) + headline text (darker, ~14px)
- Pagination dots below (swiper)
- Sources: De Olho Na Ilha, globoplay.globo.com, Casa de La Gracia

### 7. Blog Dimas
- Background: `#f5ebe1` (beige)
- Left-aligned heading: "Blog Dimas"
- 3-column grid of blog cards
- Each card: image (landscape ~300x200) + title text below
- "Veja mais artigos →" link at bottom

### 8. Footer (Dark)
- Background: `#1a1a1a`
- Top row: Large "D/" logo mark (left), navigation columns (center-right)
  - Columns: Home, Empreendimentos (Lançamentos/Entregues/Revenda), Jeito Dimas, Blog, Contato sub-items
- Middle: "Sede Dimas" + address | "Inscreva-se" newsletter with email input + arrow submit
- Phone number: (48) 3381 3031
- Checkbox: consent text with Privacy Policy and Terms links
- Bottom bar: Social links (Facebook, Instagram, Linkedin, Youtube) + "© Dimas 2024"
- White/light gray text on dark

## Typography
- CSS tokens provided:
  - `--adopt-fontSizes-bigTitle: 30px`
  - `--adopt-fontSizes-title: 13px`
  - `--adopt-fontSizes-text: 12px`
  - `--adopt-fontSizes-smallText: 11px`
  - `--adopt-lineHeights-title: 1.25em`
- Headings: Clean sans-serif, light/regular weight, ~30px
- Body: Sans-serif, ~12-13px
- Hero welcome text: ~24-30px, light weight, muted color
- Project names: Bold, ~14px
- Project locations: Light/regular, ~12px, muted

## Colors
- Page background: `#f5ebe1` (warm cream/beige)
- Dark sections: `#1a1a1a` (near-black)
- Text dark: `#1a1a1a`
- Text light (on dark): `#ffffff`
- Text muted: brownish/tan on beige background
- Accent: minimal — mostly monochrome
- Links on dark footer: grayish (`#999` range)

## Spacing
- Very generous whitespace throughout
- Section padding: ~80-120px vertical
- Welcome text section: ~200px+ vertical padding
- Content padding horizontal: ~60px from edges

## Animations
- Hero: Swiper carousel with navigation arrows
- Navbar: background-color transition on scroll
- Stats counters: animated number counting
- Logo: custom mask animations (mask-animation, mask-animation-D, mask-animation-line1, mask-animation-line2)
- Media section: Swiper carousel with pagination
- General: opacity/color transitions on hover

## CSS Tokens (user-provided)
```css
--swiper-theme-color: #007aff;
--swiper-navigation-size: 44px;
--adopt-fontSizes-bigTitle: 30px;
--adopt-fontSizes-title: 13px;
--adopt-fontSizes-text: 12px;
--adopt-fontSizes-smallText: 11px;
--adopt-lineHeights-title: 1.25em;
--vw: 1920px;
background: #f5ebe1;
```
