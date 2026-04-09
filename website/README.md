# Priority Tokens Website

A modern, clean landing page for the Priority Tokens project — a markup syntax for giving LLMs explicit signals about content importance.

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Deployment Ready**: Static site generation

## Project Structure

```
src/
├── components/
│   ├── Header.jsx         # Navigation header
│   ├── Hero.jsx           # Main hero section with CTA
│   ├── Problem.jsx        # Problem statement
│   ├── Solution.jsx       # Priority Tokens solution
│   ├── HowItWorks.jsx     # 4-step process visualization
│   ├── Implementation.jsx  # Technical scope & details
│   └── Footer.jsx         # Footer with links
├── App.jsx                # Main app component
├── index.css              # Global styles
└── main.jsx               # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173/` (or next available port).

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## Design Principles

- **Clean & Minimal**: Generous whitespace and clear typography
- **High Readability**: Geist font family for superior legibility
- **Accessible**: Semantic HTML and proper color contrast
- **Responsive**: Mobile-first design that scales beautifully
- **Fast**: Optimized for performance with Vite

## Features

- Smooth scrolling navigation
- Code samples with syntax highlighting
- Responsive grid layouts
- Micro-interactions and subtle animations
- Mobile-optimized navigation
- Clean footer with resource links

## Content Sections

1. **Hero** - Bold headline with visual code sample
2. **Problem** - The "lost in the middle" challenge
3. **Solution** - Priority Tokens concept with examples
4. **How It Works** - 4-step implementation process
5. **Implementation** - Technical details (model, method, evaluation, constraints)
6. **Footer** - Navigation and legal links

## Customization

### Colors
Edit the accent color palette in `tailwind.config.js`:

```js
colors: {
  accent: {
    // Sky blue (default)
    600: '#0284c7',
    // ... other shades
  },
}
```

### Typography
Fonts are loaded from Google Fonts. Change in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

### Content
All content is in component files under `src/components/`. Edit directly to update text, links, or structure.

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Static Hosting (GitHub Pages, etc.)
```bash
npm run build
# Deploy the dist/ folder
```

## License

© 2026 Priority Tokens. All rights reserved.

## Support

For questions or issues, reach out via:
- GitHub Issues
- Discord Community
- Documentation Site
