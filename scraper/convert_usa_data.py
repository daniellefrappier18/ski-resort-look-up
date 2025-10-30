#!/usr/bin/env python3
"""
Convert detailed USA ski resort data to TypeScript format for React app
"""

import json
from datetime import datetime

def convert_usa_data_to_typescript():
    """Convert detailed USA ski resort data to TypeScript format"""
    
    # Load the detailed USA data
    with open('detailed_usa_ski_resorts.json', 'r', encoding='utf-8') as f:
        usa_resorts = json.load(f)
    
    print(f"📊 Converting {len(usa_resorts)} USA ski resorts to TypeScript format...")
    
    converted_resorts = []
    
    for i, resort in enumerate(usa_resorts, 1):
        # Convert to match SkiResort interface
        converted_resort = {
            "id": f"usa-resort-{i}",
            "name": resort.get("name", "Unknown Resort"),
            "location": {
                "state": resort.get("state") or "Unknown",  # Ensure no null values
                **({} if not resort.get("city") else {"city": resort.get("city")}),
                "coordinates": {
                    "latitude": 0.0,  # Not available in current dataset
                    "longitude": 0.0
                }
            },
            "elevation": {
                "base": resort.get("elevation_base", 0) or 0,
                "summit": resort.get("elevation_summit", 0) or 0,
                "vertical": resort.get("vertical_drop", 0) or 0
            },
            "lifts": {
                "total": resort.get("lifts_total", 0) or 0,
                "chairlifts": 0,  # Not specified in current dataset
                "surfaceLifts": 0,
                "gondolas": 0
            },
            "trails": {
                "total": resort.get("trails_total", 0) or 0,
                "beginner": resort.get("trails_beginner", 0) or 0,
                "intermediate": resort.get("trails_intermediate", 0) or 0,
                "advanced": resort.get("trails_advanced", 0) or 0,
                "expert": resort.get("trails_expert", 0) or 0
            },
            "skiableAcres": resort.get("skiable_acres", 0) or 0,
            "snowmaking": {
                "percentage": resort.get("snowmaking_percentage", 50) or 50,  # Default reasonable value
                "acres": resort.get("snowmaking_acres", 0) or 0
            },
            "seasonDates": {
                "opening": resort.get("season_start") or "December",
                "closing": resort.get("season_end") or "April"
            },
            "website": resort.get("website", ""),
            "description": resort.get("description", f"Ski resort in {resort.get('state', 'USA')}"),
            "amenities": resort.get("amenities", []),
            "liftTicketPrice": {
                "adult": resort.get("ticket_price", 75) or 75  # Default reasonable price
            }
        }
        
        converted_resorts.append(converted_resort)
    
    # Generate TypeScript file
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    ts_content = f'''// Auto-generated USA ski resort data from comprehensive web scraping
// Generated on {timestamp}
// Source: skiresort.info comprehensive USA dataset

export const usaSkiResorts = {json.dumps(converted_resorts, indent=2, ensure_ascii=False)};
'''
    
    # Write TypeScript file
    output_path = "../src/data/usa-ski-resorts.ts"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"✅ Successfully converted {len(converted_resorts)} USA ski resorts")
    print(f"📁 TypeScript file saved to: {output_path}")
    print(f"🎿 Data includes resorts from multiple US states")
    
    # Show some stats
    states = {}
    for resort in converted_resorts:
        state = resort["location"]["state"]
        if state and state != "None" and state != "Unknown":
            states[state] = states.get(state, 0) + 1
    
    print(f"📊 States covered: {len(states)}")
    for state, count in sorted(states.items()):
        if state:  # Only show valid states
            print(f"   • {state}: {count} resorts")

if __name__ == "__main__":
    convert_usa_data_to_typescript()