#!/usr/bin/env python3
"""
Convert enhanced USA ski resort JSON data to TypeScript format
Maps the new enhanced scraper data to the app's SkiResort interface
"""

import json
import re

def safe_int(value, default=0):
    """Safely convert value to int, return default if conversion fails"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_float(value, default=0.0):
    """Safely convert value to float, return default if conversion fails"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def meters_to_feet(meters):
    """Convert meters to feet"""
    if meters is None:
        return None
    return int(meters * 3.28084)

def km_to_acres(km):
    """Rough conversion from ski slope km to skiable acres"""
    if km is None or km == 0:
        return None
    # Very rough estimate: 1 km of slopes ≈ 15-25 acres depending on width
    return int(km * 20)

def format_season_dates(opening, closing):
    """Format season dates into a readable string"""
    if opening and closing:
        return f"{opening} - {closing}"
    elif opening:
        return f"Opens {opening}"
    elif closing:
        return f"Closes {closing}"
    else:
        return None

def generate_id(name, existing_ids=set()):
    """Generate a unique slug-style ID from resort name"""
    # Remove special characters and convert to lowercase
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace spaces and multiple hyphens with single hyphens
    slug = re.sub(r'[\s_-]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Ensure uniqueness
    original_slug = slug
    counter = 1
    while slug in existing_ids:
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    existing_ids.add(slug)
    return slug

def convert_resort(resort_data, existing_ids=set()):
    """Convert a single resort from scraper format to TypeScript SkiResort format"""
    
    # Generate unique ID from name
    resort_id = generate_id(resort_data.get('name', 'unknown'), existing_ids)
    
    # Handle elevation data
    base_elevation = meters_to_feet(resort_data.get('elevation_base'))
    top_elevation = meters_to_feet(resort_data.get('elevation_top'))
    vertical_drop = meters_to_feet(resort_data.get('elevation_difference'))
    
    # If we don't have direct vertical drop, calculate it
    if vertical_drop is None and base_elevation is not None and top_elevation is not None:
        vertical_drop = top_elevation - base_elevation
    
    # Calculate skiable acres from slope data
    total_slope_km = resort_data.get('slopes_total_km')
    skiable_acres = km_to_acres(total_slope_km)
    
    # Extract website URL (clean up if needed)
    website = resort_data.get('website')
    if website and 'skiresort.nl' in website:
        # The scraper sometimes picks up the Dutch version of the site
        website = None
    
    # Convert to TypeScript format
    return {
        'id': resort_id,
        'name': resort_data.get('name', 'Unknown Resort'),
        'location': {
            'state': resort_data.get('state', 'Unknown'),
            'city': None,  # Not available in current scraper data
            'coordinates': None  # Not available in current scraper data
        },
        'elevation': {
            'base': base_elevation,
            'summit': top_elevation,
            'vertical': vertical_drop
        },
        'lifts': {
            'total': safe_int(resort_data.get('lifts_total')),
            'chairlifts': safe_int(resort_data.get('lifts_total')),  # Assume all are chairlifts for now
            'surfaceLifts': 0,  # Not distinguished in current data
            'gondolas': 1 if resort_data.get('has_gondola') else 0,
            'funiculars': 1 if resort_data.get('has_funicular') else 0,
            'fixedGripOnly': resort_data.get('fixed_grip_only', False)
        },
        'trails': {
            'total': safe_int(resort_data.get('trails_total')),
            'beginner': safe_int(resort_data.get('trails_beginner')),
            'intermediate': safe_int(resort_data.get('trails_intermediate')),
            'advanced': safe_int(resort_data.get('trails_advanced')),
            'expert': safe_int(resort_data.get('trails_expert'))
        },
        'skiableAcres': skiable_acres,
        'seasonDates': format_season_dates(resort_data.get('season_opening'), resort_data.get('season_closing')),
        'website': website,
        'phoneNumber': resort_data.get('phone'),
        'liftTicketPrice': safe_int(resort_data.get('day_pass_adult')) if resort_data.get('day_pass_adult') else None
    }

def main():
    # Load the enhanced resort data (use page1 test data if available)
    try:
        with open('enhanced_usa_ski_resorts_page1.json', 'r') as f:
            resorts = json.load(f)
        print(f"Using test data from first page: {len(resorts)} resorts")
    except FileNotFoundError:
        with open('enhanced_usa_ski_resorts.json', 'r') as f:
            resorts = json.load(f)
        print(f"Using full dataset: {len(resorts)} resorts")
    
    print(f"Converting {len(resorts)} resorts to TypeScript format...")
    
    # Convert all resorts with unique IDs
    converted_resorts = []
    existing_ids = set()
    for resort_data in resorts:
        try:
            converted_resort = convert_resort(resort_data, existing_ids)
            converted_resorts.append(converted_resort)
        except Exception as e:
            print(f"Warning: Failed to convert resort {resort_data.get('name', 'Unknown')}: {e}")
    
    # Generate TypeScript file content
    ts_content = '''// Generated USA ski resort data
// This file is auto-generated by json_to_typescript_enhanced.py

import type { SkiResort } from '../types/ski-resort';

export const usaSkiResorts: SkiResort[] = '''
    
    ts_content += json.dumps(converted_resorts, indent=2, ensure_ascii=False)
    ts_content += ';\n'
    
    # Write to TypeScript file
    output_file = '../src/data/usa-ski-resorts.ts'
    print(f"Writing TypeScript data to {output_file}...")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        print(f"Successfully wrote {len(converted_resorts)} resorts to {output_file}")
    except Exception as e:
        print(f"Error writing TypeScript file: {e}")
        return
    
    # Print summary statistics
    print("\nConversion Summary:")
    print(f"Total resorts: {len(converted_resorts)}")
    
    # Count resorts with various data
    with_elevation = sum(1 for r in converted_resorts if r['elevation']['base'] is not None)
    with_lifts = sum(1 for r in converted_resorts if r['lifts']['total'] > 0)
    with_trails = sum(1 for r in converted_resorts if r['trails']['total'] > 0)
    with_acres = sum(1 for r in converted_resorts if r['skiableAcres'] is not None)
    with_website = sum(1 for r in converted_resorts if r['website'] is not None)
    with_price = sum(1 for r in converted_resorts if r['liftTicketPrice'] is not None)
    fixed_grip_only = sum(1 for r in converted_resorts if r['lifts']['fixedGripOnly'])
    
    print(f"Resorts with elevation data: {with_elevation}")
    print(f"Resorts with lift data: {with_lifts}")
    print(f"Resorts with trail data: {with_trails}")
    print(f"Resorts with skiable acres: {with_acres}")
    print(f"Resorts with website: {with_website}")
    print(f"Resorts with pricing: {with_price}")
    print(f"Fixed-grip only resorts: {fixed_grip_only}")
    
    # Show example of trail difficulty distribution
    print(f"\nTrail Difficulty Distribution (sample of first 5 resorts):")
    for i, resort in enumerate(converted_resorts[:5]):
        trails = resort['trails']
        print(f"{resort['name']}: Total={trails['total']}, B={trails['beginner']}, I={trails['intermediate']}, A={trails['advanced']}, E={trails['expert']}")

if __name__ == "__main__":
    main()