# Ski Resort Explorer 🎿

A React and GraphQL application for exploring New England ski areas, featuring mountain elevations, lift statistics, and comprehensive resort information.

## Features

- 🏔️ **Mountain Stats**: View summit elevation, base elevation, and vertical drop for each resort
- 🚡 **Lift Information**: See total lifts, chairlifts, gondolas, and surface lifts
- ⛷️ **Trail Breakdown**: Visual representation of trail difficulty distribution
- 🔍 **Advanced Search**: Filter by state, elevation, number of lifts, trails, and skiable acres
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 🎯 **New England Focus**: Covers Vermont, New Hampshire, Maine, Massachusetts, Connecticut, and Rhode Island

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **GraphQL Client**: Apollo Client for data fetching
- **Routing**: React Router DOM
- **Styling**: CSS with responsive design
- **Data**: Sample New England ski resort data (ready for GraphQL API integration)

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

## Project Structure

```
src/
├── components/          # React components
│   ├── SkiResortSearch.tsx    # Main search interface
│   ├── SearchForm.tsx         # Search and filter form
│   └── SkiResortCard.tsx      # Individual resort display
├── data/               # Sample data
│   └── ski-resorts.ts         # New England ski resort data
├── graphql/            # GraphQL queries and mutations
│   └── queries.ts             # Example GraphQL operations
├── hooks/              # Custom React hooks
│   └── useSkiResorts.ts       # GraphQL data fetching hooks
├── types/              # TypeScript type definitions
│   └── ski-resort.ts          # Resort and search interfaces
├── apollo-client.ts    # Apollo Client configuration
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## Sample Ski Resorts Included

The app currently includes data for these popular New England ski areas:

- **Vermont**: Killington Resort, Stowe Mountain Resort
- **New Hampshire**: Cannon Mountain, Loon Mountain Resort
- **Maine**: Sunday River
- **Massachusetts**: Wachusett Mountain

Each resort includes:
- Elevation data (base, summit, vertical drop)
- Lift counts (chairlifts, gondolas, surface lifts)
- Trail counts by difficulty level
- Skiable acres and snowmaking coverage
- Pricing and contact information

## GraphQL Integration

The project is set up with Apollo Client and includes example GraphQL queries. To integrate with a real GraphQL API:

1. Update the GraphQL endpoint in `src/apollo-client.ts`
2. Use the provided queries in `src/graphql/queries.ts`
3. Replace the sample data with the GraphQL hooks in `src/hooks/useSkiResorts.ts`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Development

- [ ] Integration with real ski resort API
- [ ] Weather and snow conditions
- [ ] Interactive maps with resort locations
- [ ] Lift ticket price comparisons
- [ ] User favorites and trip planning
- [ ] Real-time lift and trail status

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## Data Sources

Current data is compiled from public resort websites and marketing materials. For a production app, consider integrating with:

- Resort APIs for real-time conditions
- Weather services for forecasts
- Mapping services for location data
- Third-party ski data providers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for snowboarding and skiing enthusiasts in New England
- Inspired by the need for comprehensive resort comparison tools
- Special thanks to the New England ski community

---

Happy skiing! 🎿⛷️
```
