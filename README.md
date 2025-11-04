# Ski Resort Explorer 🎿

A comprehensive React application for exploring USA ski resorts, featuring detailed mountain statistics, accurate trail difficulty data, and advanced filtering capabilities.

## Features

- 🏔️ **Mountain Stats**: View summit elevation, base elevation, vertical drop, and skiable acres for each resort
- 🚡 **Rich Lift Analysis**: Detailed breakdown of chairlifts, gondolas, trams, funiculars, and surface lifts with accurate counts
- ⛷️ **Accurate Trail Breakdown**: Visual representation of trail difficulty distribution with data sourced from resort slope-offering pages
- 🔍 **Advanced Search & Filtering**: Filter by state, elevation, number of lifts, trails, skiable acres, and lift type (fixed-grip only)
- 📊 **Enhanced Data Accuracy**: Trail difficulties extracted from official resort pages instead of estimated
- 🎿 **Fixed-Grip Filter**: Identify smaller, family-friendly resorts with only fixed-grip chairlifts (no detachable lifts)
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 🇺🇸 **Comprehensive USA Coverage**: Extensive database of USA ski resorts with detailed lift and trail information

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

### GraphQL Features
- **Local Schema**: No external API dependencies - GraphQL runs entirely client-side
- **Type Safety**: Full TypeScript integration with compile-time validation
- **Flexible Queries**: Request exactly the data you need for optimal performance  
- **Advanced Filtering**: Complex resort filtering by elevation, lift count, trail difficulty, etc.
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

Happy riding and skiing! 🎿⛷️
```
