import type { SkiResort } from '../types/ski-resort';

// Sample New England ski resort data
export const newEnglandSkiResorts: SkiResort[] = [
  {
    id: 'killington-vt',
    name: 'Killington Resort',
    location: {
      state: 'Vermont',
      city: 'Killington',
      coordinates: {
        latitude: 43.6041,
        longitude: -72.8092
      }
    },
    elevation: {
      base: 1165,
      summit: 4241,
      vertical: 3076
    },
    lifts: {
      total: 22,
      chairlifts: 18,
      surfaceLifts: 4,
      gondolas: 2
    },
    trails: {
      total: 155,
      beginner: 20,
      intermediate: 58,
      advanced: 45,
      expert: 32
    },
    skiableAcres: 1509,
    snowmaking: {
      percentage: 70,
      acres: 600
    },
    seasonDates: {
      opening: 'November',
      closing: 'May'
    },
    website: 'https://www.killington.com',
    description: 'The Beast of the East - Vermont\'s largest ski resort',
    amenities: ['Base Lodge', 'Summit Restaurant', 'Ski School', 'Rental Shop', 'Terrain Parks'],
    liftTicketPrice: {
      adult: 129,
      child: 99,
      senior: 99
    }
  },
  {
    id: 'stowe-vt',
    name: 'Stowe Mountain Resort',
    location: {
      state: 'Vermont',
      city: 'Stowe',
      coordinates: {
        latitude: 44.5305,
        longitude: -72.7825
      }
    },
    elevation: {
      base: 1339,
      summit: 4395,
      vertical: 3056
    },
    lifts: {
      total: 13,
      chairlifts: 11,
      surfaceLifts: 2,
      gondolas: 1
    },
    trails: {
      total: 116,
      beginner: 16,
      intermediate: 59,
      advanced: 25,
      expert: 16
    },
    skiableAcres: 485,
    snowmaking: {
      percentage: 73
    },
    website: 'https://www.stowe.com',
    description: 'Vermont\'s premier mountain resort on Mt. Mansfield',
    amenities: ['Village', 'Spa', 'Fine Dining', 'Ski School', 'Cross Country'],
    liftTicketPrice: {
      adult: 139,
      child: 109,
      senior: 109
    }
  },
  {
    id: 'sunday-river-me',
    name: 'Sunday River',
    location: {
      state: 'Maine',
      city: 'Newry',
      coordinates: {
        latitude: 44.4697,
        longitude: -70.8519
      }
    },
    elevation: {
      base: 800,
      summit: 3140,
      vertical: 2340
    },
    lifts: {
      total: 15,
      chairlifts: 13,
      surfaceLifts: 2
    },
    trails: {
      total: 135,
      beginner: 25,
      intermediate: 56,
      advanced: 35,
      expert: 19
    },
    skiableAcres: 870,
    snowmaking: {
      percentage: 95
    },
    website: 'https://www.sundayriver.com',
    description: 'Maine\'s premier ski destination with reliable snow',
    amenities: ['Multiple Base Lodges', 'Terrain Parks', 'Ski School', 'Day Care'],
    liftTicketPrice: {
      adult: 119,
      child: 89,
      senior: 89
    }
  },
  {
    id: 'cannon-mountain-nh',
    name: 'Cannon Mountain',
    location: {
      state: 'New Hampshire',
      city: 'Franconia',
      coordinates: {
        latitude: 44.1567,
        longitude: -71.6981
      }
    },
    elevation: {
      base: 1930,
      summit: 4080,
      vertical: 2150
    },
    lifts: {
      total: 11,
      chairlifts: 9,
      surfaceLifts: 1,
      gondolas: 1
    },
    trails: {
      total: 97,
      beginner: 14,
      intermediate: 44,
      advanced: 25,
      expert: 14
    },
    skiableAcres: 285,
    snowmaking: {
      percentage: 98
    },
    website: 'https://www.cannonmt.com',
    description: 'New Hampshire state-owned mountain with challenging terrain',
    amenities: ['Tramway', 'Base Lodge', 'Ski School', 'Racing Programs'],
    liftTicketPrice: {
      adult: 89,
      child: 69,
      senior: 69
    }
  },
  {
    id: 'loon-mountain-nh',
    name: 'Loon Mountain Resort',
    location: {
      state: 'New Hampshire',
      city: 'Lincoln',
      coordinates: {
        latitude: 44.0364,
        longitude: -71.6206
      }
    },
    elevation: {
      base: 950,
      summit: 3050,
      vertical: 2100
    },
    lifts: {
      total: 12,
      chairlifts: 10,
      surfaceLifts: 2
    },
    trails: {
      total: 61,
      beginner: 20,
      intermediate: 35,
      advanced: 4,
      expert: 2
    },
    skiableAcres: 370,
    snowmaking: {
      percentage: 98
    },
    website: 'https://www.loonmtn.com',
    description: 'Family-friendly resort in the White Mountains',
    amenities: ['Adventure Center', 'Terrain Parks', 'Tubing', 'Kids Programs'],
    liftTicketPrice: {
      adult: 109,
      child: 89,
      senior: 89
    }
  },
  {
    id: 'wachusett-ma',
    name: 'Wachusett Mountain',
    location: {
      state: 'Massachusetts',
      city: 'Princeton',
      coordinates: {
        latitude: 42.4826,
        longitude: -71.8856
      }
    },
    elevation: {
      base: 1000,
      summit: 2006,
      vertical: 1006
    },
    lifts: {
      total: 8,
      chairlifts: 6,
      surfaceLifts: 2
    },
    trails: {
      total: 27,
      beginner: 7,
      intermediate: 15,
      advanced: 3,
      expert: 2
    },
    skiableAcres: 110,
    snowmaking: {
      percentage: 100
    },
    website: 'https://www.wachusett.com',
    description: 'Central Massachusetts skiing close to Boston',
    amenities: ['Base Lodge', 'Terrain Park', 'Night Skiing', 'Racing'],
    liftTicketPrice: {
      adult: 79,
      child: 59,
      senior: 59
    }
  }
];

// Helper function to get resorts by state
export const getResortsByState = (state: string): SkiResort[] => {
  return newEnglandSkiResorts.filter(resort => 
    resort.location.state.toLowerCase() === state.toLowerCase()
  );
};

// Helper function to get resorts by minimum elevation
export const getResortsByMinElevation = (minElevation: number): SkiResort[] => {
  return newEnglandSkiResorts.filter(resort => 
    resort.elevation.summit >= minElevation
  );
};

// Helper function to search resorts by name
export const searchResortsByName = (searchTerm: string): SkiResort[] => {
  return newEnglandSkiResorts.filter(resort =>
    resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resort.location.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};