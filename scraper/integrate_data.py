"""
Data Integration Utility

This script converts scraped ski resort data into the format
expected by the React application and updates the service file.
"""

import json
import re
from typing import Dict, List, Any

def convert_scraped_data_to_react_format(scraped_data: List[Dict]) -> List[Dict]:
    """Convert scraped data to match existing React app SkiResort interface"""
    
    converted_resorts = []
    
    for i, resort_data in enumerate(scraped_data):
        # Convert to match existing SkiResort interface
        base_elevation = parse_elevation(resort_data.get("elevation_base"))
        top_elevation = parse_elevation(resort_data.get("elevation_top"))
        vertical_drop = parse_elevation(resort_data.get("vertical_drop"))
        
        # Convert meters to feet for US standard
        base_feet = int(base_elevation * 3.28084) if base_elevation else 0
        top_feet = int(top_elevation * 3.28084) if top_elevation else 0
        vertical_feet = int(vertical_drop * 3.28084) if vertical_drop else 0
        
        # Extract slopes data
        total_slopes_km = parse_distance(resort_data.get("slopes_total_km"))
        easy_km = parse_distance(resort_data.get("slopes_easy_km"))
        intermediate_km = parse_distance(resort_data.get("slopes_intermediate_km"))
        difficult_km = parse_distance(resort_data.get("slopes_difficult_km"))
        
        # Convert km to approximate trail counts (rough estimation)
        total_trails = max(int(total_slopes_km / 2), 1) if total_slopes_km else 10
        easy_trails = max(int(easy_km / 2), 1) if easy_km else 3
        intermediate_trails = max(int(intermediate_km / 2), 1) if intermediate_km else 4
        difficult_trails = max(int(difficult_km / 2), 1) if difficult_km else 3
        
        # Convert to existing React app format
        converted_resort = {
            "id": f"resort-{i+1}",
            "name": resort_data.get("name", "Unknown Resort"),
            "location": {
                "state": resort_data.get("country", "Unknown"),
                "city": extract_clean_region(resort_data.get("region", "")),
                "coordinates": {
                    "latitude": 47.0 + (i * 0.1),  # Placeholder coordinates
                    "longitude": 12.0 + (i * 0.1)
                }
            },
            "elevation": {
                "base": base_feet,
                "summit": top_feet,
                "vertical": vertical_feet
            },
            "lifts": {
                "total": parse_number(resort_data.get("lifts_total")) or 10,
                "chairlifts": max(int((parse_number(resort_data.get("lifts_total")) or 10) * 0.7), 1),
                "surfaceLifts": max(int((parse_number(resort_data.get("lifts_total")) or 10) * 0.3), 1),
                "gondolas": 1 if parse_number(resort_data.get("lifts_total", 0)) > 20 else 0
            },
            "trails": {
                "total": total_trails,
                "beginner": easy_trails,
                "intermediate": intermediate_trails,
                "advanced": difficult_trails,
                "expert": max(1, total_trails - easy_trails - intermediate_trails - difficult_trails)
            },
            "skiableAcres": int(total_slopes_km * 100) if total_slopes_km else 500,  # Rough conversion
            "snowmaking": {
                "percentage": 85,  # Default assumption
                "acres": int(total_slopes_km * 80) if total_slopes_km else 400
            },
            "seasonDates": {
                "opening": resort_data.get("season_start", "Early December"),
                "closing": resort_data.get("season_end", "Mid April")
            },
            "website": resort_data.get("official_website"),
            "description": resort_data.get("description", f"Alpine ski resort in {resort_data.get('country', 'Europe')}"),
            "amenities": ["Ski School", "Equipment Rental", "Restaurants", "Parking"],
            "liftTicketPrice": {
                "adult": parse_price(resort_data.get("day_pass_price")) or 65
            },
            # Additional metadata for enhanced features
            "_scraped_data": {
                "rating": resort_data.get("rating"),
                "slopes_km": {
                    "total": total_slopes_km,
                    "easy": easy_km,
                    "intermediate": intermediate_km,
                    "difficult": difficult_km
                },
                "nearby_towns": resort_data.get("nearby_towns") or []
            }
        }
        
        converted_resorts.append(converted_resort)
    
    return converted_resorts

def extract_clean_region(region_text: str) -> str:
    """Extract clean region name from breadcrumb text"""
    if not region_text:
        return "Unknown"
    
    # Split by common separators and take the most relevant part
    parts = re.split(r'\s+Worldwide\s+|\s+Europe\s+|\s+Austria\s+|\s+Switzerland\s+|\s+France\s+', region_text)
    
    if len(parts) > 1:
        # Take the first part (usually the region name)
        return parts[0].strip()
    
    # Fallback: clean up the text
    cleaned = re.sub(r'\s+', ' ', region_text).strip()
    return cleaned if cleaned else "Unknown"

def parse_elevation(elevation_str: str) -> int:
    """Parse elevation string to number"""
    if not elevation_str:
        return 0
    
    # Extract number from strings like "800m", "1200m"
    match = re.search(r'(\d+)', str(elevation_str))
    if match:
        return int(match.group(1))
    return 0

def parse_distance(distance_str: str) -> float:
    """Parse distance string to number"""
    if not distance_str:
        return 0.0
    
    # Extract number from strings like "188km", "45.5km"
    match = re.search(r'(\d+(?:\.\d+)?)', str(distance_str))
    if match:
        return float(match.group(1))
    return 0.0

def parse_number(number_str: str) -> int:
    """Parse number string to integer"""
    if not number_str:
        return 0
    
    # Extract number from strings
    match = re.search(r'(\d+)', str(number_str))
    if match:
        return int(match.group(1))
    return 0

def parse_price(price_str: str) -> int:
    """Parse price string to number"""
    if not price_str:
        return 0
    
    # Extract number from strings like "€79.50", "$65", etc.
    match = re.search(r'(\d+(?:\.\d+)?)', str(price_str))
    if match:
        return int(float(match.group(1)))
    return 0

def update_ski_resort_api_service(converted_resorts: List[Dict], output_file: str = None):
    """Update the ski resort API service with new data"""
    
    # If no output file specified, create a new TypeScript data file
    if not output_file:
        output_file = "../src/data/scraped-ski-resorts.ts"
    
    # Create TypeScript content that matches existing SkiResort interface
    ts_content = f"""// Auto-generated ski resort data from web scraping
// Generated on {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

import {{ SkiResort }} from '../types/ski-resort';

export const scrapedSkiResorts: SkiResort[] = {json.dumps(converted_resorts, indent=2)};

export default scrapedSkiResorts;
"""
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        print(f"✅ Created TypeScript data file: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating TypeScript file: {e}")
        return False

def create_updated_api_service():
    """Create an updated API service that uses scraped data"""
    
    api_service_content = '''import { SkiResort } from '../types/ski-resort';
import { scrapedSkiResorts } from '../data/scraped-ski-resorts';

// Enhanced fallback data with scraped resorts
const ENHANCED_SKI_RESORTS: SkiResort[] = scrapedSkiResorts;

export const getAllResorts = async (): Promise<SkiResort[]> => {
  try {
    // For now, return the enhanced scraped data
    // In the future, this could call a real API
    return ENHANCED_SKI_RESORTS;
  } catch (error) {
    console.error('Error fetching ski resorts:', error);
    throw error;
  }
};

export const searchResorts = async (query: string): Promise<SkiResort[]> => {
  const allResorts = await getAllResorts();
  
  if (!query.trim()) {
    return allResorts;
  }
  
  const searchTerm = query.toLowerCase();
  
  return allResorts.filter(resort =>
    resort.name.toLowerCase().includes(searchTerm) ||
    resort.country.toLowerCase().includes(searchTerm) ||
    resort.region.toLowerCase().includes(searchTerm) ||
    (resort.description && resort.description.toLowerCase().includes(searchTerm))
  );
};

export const getResortsByCountry = async (country: string): Promise<SkiResort[]> => {
  const allResorts = await getAllResorts();
  return allResorts.filter(resort => 
    resort.country.toLowerCase() === country.toLowerCase()
  );
};

export const getResortsByRating = async (minRating: number): Promise<SkiResort[]> => {
  const allResorts = await getAllResorts();
  return allResorts.filter(resort => 
    resort.rating && resort.rating >= minRating
  );
};
'''
    
    try:
        with open('../src/services/enhanced-skiResortAPI.ts', 'w', encoding='utf-8') as f:
            f.write(api_service_content)
        
        print("✅ Created enhanced API service file")
        return True
        
    except Exception as e:
        print(f"❌ Error creating API service: {e}")
        return False

def main():
    """Main function to integrate scraped data"""
    
    # Check for existing scraped data files
    data_files = [
        'enhanced_ski_resorts.json',
        'comprehensive_ski_resorts.json'
    ]
    
    scraped_data = None
    used_file = None
    
    for filename in data_files:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                scraped_data = json.load(f)
                used_file = filename
                break
        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"❌ Error reading {filename}: {e}")
            continue
    
    if not scraped_data:
        print("❌ No scraped data files found!")
        print("   Run 'python3 enhanced_scraper.py' or 'python3 dataset_builder.py' first")
        return False
    
    print(f"📁 Using data from: {used_file}")
    print(f"📊 Processing {len(scraped_data)} ski resorts...")
    
    # Convert to React format
    converted_resorts = convert_scraped_data_to_react_format(scraped_data)
    
    print(f"✅ Converted {len(converted_resorts)} resorts to React format")
    
    # Create TypeScript data file
    success = update_ski_resort_api_service(converted_resorts)
    
    if success:
        print("✅ Integration complete!")
        print("📝 Next steps:")
        print("   1. Import the enhanced data in your React components")
        print("   2. Update your API calls to use the new service")
        print("   3. Test the application with the comprehensive dataset")
        
        # Show sample data
        if converted_resorts:
            sample = converted_resorts[0]
            print(f"\\n📄 Sample resort data:")
            print(f"   • Name: {sample['name']}")
            print(f"   • Location: {sample['location']['state']}, {sample['location']['city']}")
            print(f"   • Elevation: {sample['elevation']['base']}-{sample['elevation']['summit']} ft")
            print(f"   • Trails: {sample['trails']['total']} total")
            print(f"   • Lifts: {sample['lifts']['total']}")
            if sample.get('_scraped_data', {}).get('rating'):
                print(f"   • Rating: {sample['_scraped_data']['rating']}/5 ⭐")
        
        return True
    else:
        print("❌ Integration failed")
        return False

if __name__ == "__main__":
    main()