# Ski Resort Explorer 🎿

A comprehensive React application for exploring USA ski resorts, featuring detailed mountain statistics, accurate trail difficulty data, and advanced filtering capabilities.

## Features

- 🏔️ **Mountain Stats**: View summit elevation, base elevation, vertical drop, and skiable acres for each resort
- 🚡 **Detailed Lift Information**: See total lifts, chairlifts, gondolas, surface lifts, and fixed-grip-only indicators
- ⛷️ **Accurate Trail Breakdown**: Visual representation of trail difficulty distribution with data sourced from resort slope-offering pages
- 🔍 **Advanced Search & Filtering**: Filter by state, elevation, number of lifts, trails, skiable acres, and lift type (fixed-grip only)
- 📊 **Enhanced Data Accuracy**: Trail difficulties extracted from official resort pages instead of estimated
- 🎿 **Fixed-Grip Filter**: Identify smaller, family-friendly resorts with only fixed-grip chairlifts (no detachable lifts)
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 🇺� **Comprehensive USA Coverage**: Includes 563 ski resorts across all US states with skiing

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **GraphQL Client**: Apollo Client for data fetching
- **Routing**: React Router DOM
- **Styling**: CSS with responsive design
- **Data**: Comprehensive USA ski resort dataset with 563 resorts including enhanced trail difficulty and lift type information
- **Web Scraping**: Python-based scraper using BeautifulSoup to extract data from skiresort.info

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

## Data Sources & Accuracy

### Enhanced Trail Difficulty Data
- **Source**: Data extracted from individual resort `/slope-offering/` pages on skiresort.info
- **Accuracy**: Trail counts calculated from actual slope percentages rather than estimates
- **Coverage**: 563 USA ski resorts with detailed breakdown of beginner, intermediate, advanced, and expert trails

### Fixed-Grip Lift Detection  
- **Purpose**: Helps identify family-friendly, smaller resorts that may be more accessible and affordable
- **Method**: Analysis of resort lift infrastructure combined with manual categorization
- **Result**: 186 resorts identified as "fixed-grip only" (no detachable chairlifts, gondolas, or trams)

### Data Pipeline
1. **Web Scraping**: Python scraper (`enhanced_usa_scraper.py`) extracts data from skiresort.info
2. **Data Processing**: Trail difficulty percentages converted to trail counts with realistic estimates  
3. **Lift Categorization**: Resorts classified by lift type using heuristics and manual verification
4. **TypeScript Generation**: JSON data converted to strongly-typed TypeScript for the frontend

## Project Structure

```
ski-resort-look-up/
├── src/
│   ├── components/          # React components
│   ├── data/               # Ski resort dataset (usa-ski-resorts.ts)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and data filtering
│   └── types/              # TypeScript interfaces
├── scraper/                # Python web scraping tools
│   ├── enhanced_usa_scraper.py    # Main scraper with trail/lift detection
│   ├── json_to_typescript_enhanced.py  # Data converter
│   └── enhanced_usa_ski_resorts.json   # Raw scraped data
└── public/                 # Static assets
```


## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

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
