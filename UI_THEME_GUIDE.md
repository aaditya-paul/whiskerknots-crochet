# Whiskerknots Crochet - UI/UX Theme & Design System Guide

## 🎨 Brand Identity & Core Vibe

**Brand Name:** Whiskerknots  
**Tagline:** "Loops of Love"  
**Industry:** Handmade Crochet E-commerce  
**Emotional Tone:** Warm, Cozy, Wholesome, Artisanal, Nurturing, Playful

### The Essence

This website embodies the **handcrafted warmth** of homemade crochet goods. The design should feel like a **cozy hug** - inviting, soft, gentle, and filled with personality. Think of a sunny afternoon in a craft studio filled with soft yarns, pastel colors, and the smell of fresh tea. The aesthetic balances **professional e-commerce functionality** with **artisanal charm** and **playful whimsy**.

---

## 🎨 Color Palette

### Primary Colors

```css
--cozy-cream: #fffdf7        /* Main background - warm off-white */
--warm-peach: #ffdab9        /* Accent background - soft peachy warmth */
--soft-rose: #f4c2c2         /* Primary accent - gentle rose pink */
--earthy-brown: #8d6e63      /* Primary text & CTAs - grounded brown */
```

### Secondary Colors

```css
--leaf-green: #a5d6a7        /* Fresh accent - subtle mint/sage */
--sunny-yellow: #fff59d      /* Highlight accent - bright but soft */
--dusty-rose: #e7c6d8        /* Selection highlight - muted pink */
--warm-charcoal: #2f2e33     /* Deep text - almost black but warm */
```

### Usage Guidelines

- **Background:** Always use `cozy-cream` (#fffdf7) as the primary background. It's a warm, cream-colored off-white that feels softer than pure white
- **Hero sections:** Use `warm-peach/20` (peach with 20% opacity) for soft, inviting hero backgrounds
- **Text:** Primary text should be `earthy-brown` (#8d6e63) or `warm-charcoal` (#2f2e33) - never pure black
- **Accents:** Use `soft-rose` and rose-400 (Tailwind's rose-400) for interactive elements, CTAs, and highlights
- **Overlays:** Use white with opacity (e.g., `bg-white/90`) with backdrop-blur for modern glass-morphism effects

**Note:** The site DOES NOT use dark mode - the warm cream background is maintained even when the system prefers dark mode. This is intentional to preserve the cozy, handcrafted aesthetic.

---

## 📝 Typography

### Font Families

```css
--font-quicksand: 'Quicksand', sans-serif  /* Primary sans-serif - playful & geometric */
--font-comfortaa: 'Comfortaa', sans-serif  /* Primary serif (display) - rounded & cozy */
```

### Font Usage

- **Body text:** Quicksand (via `font-sans` utility)
- **Headings & display:** Comfortaa (via `font-serif` utility) - Despite being called "serif" in the code, Comfortaa is actually a rounded sans-serif that gives a soft, approachable feel
- **Navigation:** Bold, uppercase, with wide letter-spacing (`tracking-wide`, `tracking-widest`)
- **Logo:** Comfortaa bold for "Whiskerknots", small caps with wide tracking for "Loops of Love" tagline

### Typography Style

- **Headings:** Large (text-5xl to text-7xl), bold, with `earthy-brown` or gradients
- **Body:** Comfortable reading size, relaxed line-height (`leading-relaxed`)
- **Buttons:** Bold, uppercase when appropriate, clear hierarchy
- **Small text:** Uppercase with wide tracking for labels and categories

---

## 🎯 Layout & Spacing

### Container Strategy

- **Max-width:** `max-w-7xl` (1280px) for main content
- **Padding:** Responsive - `px-4 sm:px-6 lg:px-8`
- **Sections:** Generous spacing between sections (`space-y-20`)
- **Cards:** Internal padding of `p-6` for comfortable breathing room

### Border Radius

- **Cards:** Heavily rounded - `rounded-3xl` (24px) or `rounded-[3rem]` (48px)
- **Buttons:** Very rounded - `rounded-2xl` (16px) to `rounded-full` for pill shapes
- **Images:** Rounded containers with `rounded-3xl` for product cards
- **Logo elements:** `rounded-full` for icon backgrounds

**Philosophy:** The heavy use of rounded corners creates a **soft, approachable, non-threatening** aesthetic that aligns with handcrafted goods.

---

## ✨ Animation & Interaction

### Animation Library

**Framer Motion** is used throughout for all animations

### Core Animation Patterns

#### 1. **Fade In Up** (Most common)

```typescript
fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
```

Use for: Content appearing on scroll, text blocks, cards

#### 2. **Scale & Hover Effects**

- **Product cards:** `whileHover={{ y: -8 }}` - lift up on hover
- **Buttons:** `whileHover={{ scale: 1.05 }}` and `whileTap={{ scale: 0.95 }}`
- **Logo heart icon:** `whileHover={{ rotate: 12 }}` - playful tilt
- **Images:** `group-hover:scale-110` with `transition-transform duration-700` - slow, luxurious zoom

#### 3. **Floating Blob Animations**

Large, blurred circular gradients that slowly pulse in/out in hero sections:

```typescript
animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.6, 0.5] }}
transition={{ duration: 8-10, repeat: Infinity, ease: "easeInOut" }}
```

Creates an **ambient, dreamy atmosphere**

#### 4. **Stagger Children**

When multiple items appear together (like product grids), stagger their entrance by 0.1s delays

#### 5. **Navbar Entrance**

```typescript
initial={{ y: -100 }}
animate={{ y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

### Interaction Principles

- **Subtle and smooth:** All transitions are 0.3s to 0.7s - never instant, never too slow
- **Playful but professional:** Slight rotations (5-12 degrees), gentle lifts, soft scales
- **Responsive feedback:** Every interactive element has hover states
- **Performance-conscious:** Use `whileInView` with `viewport={{ once: true }}` for scroll animations

---

## 🧩 Component Patterns

### Navigation Bar

- **Position:** Sticky top with `backdrop-blur-md` and semi-transparent background
- **Height:** `h-20` (80px)
- **Logo:** Heart icon in rose-400 circle + two-line text (brand name + tagline)
- **Links:** Uppercase, bold, with active state showing `border-b-2 border-rose-500`
- **CTA Button:** Rounded-full with earthy-brown background, hovers to rose-400

### Footer

- **Background:** Light peach/orange (`bg-orange-50`)
- **Border:** Subtle top border (`border-t border-orange-100`)
- **Layout:** 4-column grid (collapsing to 1 on mobile)
- **Social icons:** White circles with rose accent, scale & rotate on hover
- **Newsletter:** Rounded input fields with inline submit button

### Product Cards

- **Container:** White background, `rounded-3xl`, subtle shadow that intensifies on hover
- **Image:** Square aspect ratio with `group-hover:scale-110` zoom effect
- **Category badge:** Bottom-left corner, white/90 with backdrop-blur
- **Heart icon:** Top-right, appears on hover with opacity transition
- **Lift effect:** Entire card lifts 8px on hover (`y: -8`)
- **Border:** `border border-gray-100` for subtle separation

### Buttons

**Primary (CTA):**

- `bg-earthy-brown` with `hover:bg-rose-400`
- `rounded-2xl` or `rounded-full`
- Bold text, generous padding (`px-8 py-4`)
- Shadow: `shadow-lg hover:shadow-xl`

**Secondary:**

- White background with border
- Hover changes to subtle gray (`hover:bg-stone-50`)

**Icon buttons:**

- Circular, white background
- Icon with hover color change
- Scale animations

### Hero Sections

- **Background:** `bg-warm-peach/20` with large rounded corners (`rounded-[3rem]`)
- **Blurred blobs:** Positioned absolute, yellow/rose gradients, slowly pulsing
- **Layout:** Flex row (desktop) / column (mobile)
- **Badge:** Small pill badge above heading with "New Collection" type messaging
- **Heading:** Extra large (text-5xl to text-7xl), two-line with colored span
- **CTA:** Two buttons - primary (shop) and secondary (story)

---

## 🎭 UI Personality Traits

### Visual Characteristics

1. **Soft and Rounded:** Everything curves - no sharp corners
2. **Warm Color Temperature:** Creams, peaches, roses, browns - never cold blues or grays
3. **Generous Whitespace:** Content breathes, nothing feels cramped
4. **Playful Icons:** Heart motifs, playful rotations, friendly lucide-react icons
5. **Glass-morphism:** White overlays with backdrop-blur for modern depth
6. **Subtle Shadows:** Always soft, always gray - no harsh blacks

### Interaction Feel

1. **Gentle and responsive:** Smooth, never jarring
2. **Organic motion:** Floating elements, gentle scales, natural easing
3. **Tactile feedback:** Everything responds to hover/tap
4. **Delightful details:** Small rotations, stagger animations, growing shadows

### Content Tone

1. **Warm and personal:** "Handmade with Loops of Love"
2. **Story-driven:** Focus on craft, patience, passion
3. **Community-focused:** Testimonials, social proof, connection
4. **Inviting:** "Bringing coziness to your world, one stitch at a time"

---

## 📐 Technical Implementation Notes

### CSS Architecture

- **Tailwind CSS 4.0** (next-gen with @theme inline syntax)
- Custom colors defined in CSS variables in `globals.css`
- Responsive-first approach (mobile → desktop)
- No dark mode toggle (intentionally light-only)

### Animation Stack

- **Framer Motion** for React component animations
- Centralized animation variants in `utils/animations.ts`
- Use `motion.div` wrapper for animated components

### Image Handling

- Next.js `<Image>` component with lazy loading
- Square aspect ratios for products
- `object-cover` for consistent framing
- Quality set to 80 for optimization

### Accessibility Considerations

- Smooth scroll behavior enabled globally
- Semantic HTML structure
- Proper color contrast (earthy-brown on cream backgrounds)
- Custom selection color (`dusty-rose` background)
- Icons paired with text labels

---

## 🎯 Key Design Principles Summary

When creating new components or pages for this site, remember:

1. **Warmth over efficiency:** Prioritize emotional connection over stark minimalism
2. **Round over sharp:** Curves make things feel safe and inviting
3. **Motion with purpose:** Animations should delight, not distract
4. **Handcrafted feel:** Imperfect is perfect - embrace organic, artisanal aesthetics
5. **Cozy maximalism:** Use space generously, but fill it with warmth
6. **Playful professionalism:** Fun and whimsical, but still trustworthy for e-commerce
7. **Rose-tinted interactions:** Primary interactive color is always rose/pink tones
8. **Brown grounds everything:** Earthy brown provides stability and natural feel

---

## 🔍 Common Use Cases

### Adding a new section

- Wrap in `motion.div` with fade-in animation
- Use `max-w-7xl mx-auto px-4` container
- Background: either transparent or `bg-warm-peach/20` with rounded corners
- Spacing: `py-20` vertical, `space-y-12` for internal elements

### Creating a card

- White background, `rounded-3xl`
- Shadow: `shadow-sm hover:shadow-xl`
- Border: `border border-gray-100`
- Hover lift: `whileHover={{ y: -8 }}`
- Internal padding: `p-6`

### Styling text

- Headings: Comfortaa (font-serif), bold, earthy-brown
- Body: Quicksand (font-sans), gray-600
- Links: Underline on hover, rose-400 hover color
- Labels: Uppercase, tracking-wide, text-xs

### Button styling

- Primary: `bg-earthy-brown hover:bg-rose-400 text-white rounded-2xl px-8 py-4 font-bold`
- Add Framer Motion: `whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}`

---

## 💡 Inspiration Keywords

When describing this style to AI or designers, use these keywords:

- Cottagecore e-commerce
- Soft, organic, handcrafted
- Warm minimalism with personality
- Artisanal modern
- Cozy brutalism (rounded variant)
- Pastel warmth
- Neo-craft aesthetic
- Wholesome digital storefront
- Yarn shop meets boutique
- Grandma's craft room but make it Gen-Z

---

## 🚀 Brand Voice & Messaging

### Tone Attributes

- **Warm** (not corporate)
- **Personal** (not generic)
- **Crafty** (not mass-produced)
- **Patient** (not rushed)
- **Loving** (not transactional)

### Sample Copy Patterns

- "Handmade with Loops of Love"
- "Bringing coziness to your world, one stitch at a time"
- "Each stitch creates a story"
- "Crafted with patience, passion, and loops of love"
- Focus on: patience, love, coziness, handmade, stories, warmth

---

This design system creates a cohesive, emotionally resonant shopping experience that celebrates handmade craft while maintaining modern web standards and e-commerce functionality. The goal is to make visitors feel **welcomed, comforted, and excited** about bringing handmade crochet goods into their lives.
