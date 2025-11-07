# Ski Resort Explorer 🎿

## The Problem This Solves ☠️

**Ever been stuck on a fixed-grip chairlift that you can't get off?** This project was born from a personal need - having difficulty getting off fixed-grip chairlifts and finding **no easy way to filter them out** on existing sites like skiresort.info.

**This is THE definitive resource for finding ski resorts that WON'T leave you stranded on a sketchy old lift!**

## Why This Exists 🚡

- **Personal Accessibility**: Some snowboarders and skiers have difficulty with fixed-grip lifts (balance, timing, physical limitations)
- **Safety First**: Avoid resorts with only old, hard-to-dismount lifts
- **No Other Solution**: Major ski sites don't offer this crucial filter (at least that I've found)

## Features

- ☠️ **DANGER ZONE Filter**: Instantly identify and avoid fixed-grip-only death traps with dramatic skull warnings
- 🏔️ **Mountain Stats**: Summit elevation, base elevation, vertical drop, and skiable acres
- 🚡 **Smart Lift Analysis**: Detachable chairs, gondolas, trams vs. sketchy fixed-grip lifts
- ⛷️ **Slope Data**: Actual slope distances in kilometers 
- 🔍 **Advanced Filtering**: Filter by state, elevation, lift type, slope distance
- 📊 **Real Data**: Scraped from skiresort.info 
- 📱 **Mobile Friendly**: Plan your safe ski trips anywhere
- 🇺🇸 **Complete USA Coverage**: 323 resorts and counting

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ski-resort-look-up.git
cd ski-resort-look-up
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Data Scraping & Processing 🔧

This project includes a comprehensive Python scraper that extracts data from skiresort.info:

- **State-by-State Processing**: Scrapes all USA ski resorts by processing each state individually
- **Intelligent Lift Detection**: Advanced parsing of lift types including surface lifts, rope tows, t-bars
- **Slope Distance Extraction**: Gets actual slope kilometers (not unreliable trail counts)
- **Pricing Information**: Adult and child lift ticket prices where available
- **Duplicate Removal**: Automatically deduplicates lift entries for clean data
- **Conservative Processing**: Handles missing data gracefully for maximum reliability

### GraphQL Architecture
- **Local Schema**: No external API dependencies - GraphQL runs entirely client-side
- **Type Safety**: Full TypeScript integration with compile-time validation
- **Flexible Queries**: Request exactly the data you need for optimal performance  
- **Advanced Filtering**: Complex resort filtering by elevation, lift count, slope distance, etc.
- **Caching**: Intelligent caching with Apollo Client for fast subsequent queries

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run serve` - Serve built application locally

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits & Acknowledgments

### Data Source
- **Ski resort data** sourced from [skiresort.info](https://www.skiresort.info/) with enhanced processing for accuracy
- All elevation, lift, trail, and resort information extracted from their comprehensive database

### Photo Attribution  
- Background image by [Chris Biron](https://unsplash.com/@biron?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/snowy-mountain-JVtcrWcbj1c?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

### Special Thanks
- Built for snowboarding and skiing enthusiasts across the United States
- Inspired by the need for comprehensive resort comparison tools with detailed filtering options
- Special thanks to the skiing community and resort operators who maintain detailed slope information

---

Happy riding and skiing! 🏂 ⛷️
