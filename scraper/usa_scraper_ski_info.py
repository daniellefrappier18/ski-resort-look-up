#!/usr/bin/env python3
"""
Enhanced USA Ski Resort Scraper V2 - CONSERVATIVE SURFACE LIFT DETECTION
Fixed version with conservative surface lift detection and proper website/trail extraction
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import time
import logging
from datetime import datetime
from urllib.parse import urljoin, urlparse

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class USASkiInfoScraper:
    def __init__(self, delay=1.0):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.delay = delay

    def get_page(self, url, max_retries=3):
        """Fetch and parse a webpage"""
        for attempt in range(max_retries):
            try:
                logger.info(f"Fetching: {url}")
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                
                if response.content:
                    return BeautifulSoup(response.content, 'html.parser')
                else:
                    logger.warning(f"Empty response for {url}")
                    return None
                    
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(self.delay * (attempt + 1))
                else:
                    logger.error(f"Failed to fetch {url} after {max_retries} attempts")
                    return None
        
        return None

    def discover_usa_resorts(self, limit_resorts=None):
        """Discover all USA ski resorts by scraping each state individually"""
        # US states with ski resorts based on skiresort.info data
        usa_states = {
            'alabama': 1, 'alaska': 18, 'arizona': 4, 'california': 33, 'colorado': 41,
            'connecticut': 5, 'florida': 1, 'idaho': 22, 'illinois': 5, 'indiana': 2,
            'iowa': 6, 'maine': 19, 'maryland': 1, 'massachusetts': 13, 'michigan': 43,
            'minnesota': 18, 'missouri': 2, 'montana': 16, 'nevada': 8, 'new-hampshire': 28,
            'new-jersey': 3, 'new-mexico': 9, 'new-york': 50, 'north-carolina': 6,
            'north-dakota': 4, 'ohio': 6, 'oregon': 15, 'pennsylvania': 25,
            'rhode-island': 1, 'south-dakota': 3, 'tennessee': 1, 'texas': 1,
            'utah': 20, 'vermont': 25, 'virginia': 6, 'washington-state': 20,
            'west-virginia': 5, 'wisconsin': 36, 'wyoming': 12
        }
        
        all_resort_urls = []
        
        for state, expected_count in usa_states.items():
            try:
                # Format state name for URL (replace spaces with hyphens, lowercase)
                state_url = f'https://www.skiresort.info/ski-resorts/{state}/'
                
                logger.info(f"�️  Fetching {state.title().replace('-', ' ')} resorts (expecting ~{expected_count}): {state_url}")
                
                soup = self.get_page(state_url)
                if not soup:
                    logger.warning(f"Failed to fetch page for {state}")
                    continue
                
                # Find all resort links on this page
                state_resort_urls = []
                resort_links = soup.find_all('a', href=True)
                
                for link in resort_links:
                    href = link['href']
                    if '/ski-resort/' in href and href.count('/') >= 4:
                        full_url = urljoin('https://www.skiresort.info', href)
                        # Check if we've already seen this URL from another state
                        existing_url = next((item for item in all_resort_urls if item[0] == full_url), None)
                        if not existing_url:
                            state_resort_urls.append((full_url, state.title().replace('-', ' ')))
                            all_resort_urls.append((full_url, state.title().replace('-', ' ')))
                
                logger.info(f"   ✅ Found {len(state_resort_urls)} resorts in {state.title().replace('-', ' ')} (total: {len(all_resort_urls)})")
                
                time.sleep(self.delay)  # Be respectful between requests
                
            except Exception as e:
                logger.error(f"❌ Error fetching {state}: {e}")
                continue

        
        # Filter to main resort pages (not sub-pages)
        main_resort_urls = []
        for url, state in all_resort_urls:
            # Extract the path after /ski-resort/
            path_parts = url.split('/ski-resort/')
            if len(path_parts) > 1:
                resort_path = path_parts[1].rstrip('/')
                # Only include if it's a main resort page (no additional path segments)
                if '/' not in resort_path and resort_path:
                    main_resort_urls.append((url, state))
        
        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url, state in main_resort_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append((url, state))
        
        # Limit for testing if specified
        if limit_resorts:
            unique_urls = unique_urls[:limit_resorts]
        
        logger.info(f"🎿 Total discovered resorts across all states: {len(unique_urls)}")
        return unique_urls

    def extract_trail_difficulty_data_with_main_fallback(self, base_url, main_soup):
        """FIXED: Extract trail data from main page using patterns like Bolton Valley example"""
        trail_data = {'trails_beginner': 0, 'trails_intermediate': 0, 'trails_advanced': 0, 'trails_expert': 0, 'trails_total': 0}
        
        try:
            text = main_soup.get_text()
            
            # Method 1: Look for the main pattern "there are [X km of slopes]"
            slopes_km_match = re.search(r'there are\s+\[?(\d+)\s+km of slopes\]?', text, re.IGNORECASE)
            total_km_from_main = int(slopes_km_match.group(1)) if slopes_km_match else 0
            
            # Method 2: Look for detailed breakdown like "Easy 20 km (8%) Intermediate 105 km (42%) Difficult 125 km (50%)"
            easy_match = re.search(r'Easy\s+(\d+)\s+km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            intermediate_match = re.search(r'Intermediate\s+(\d+)\s+km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            difficult_match = re.search(r'Difficult\s+(\d+)\s+km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            
            if easy_match or intermediate_match or difficult_match:
                # Extract km values from breakdown
                easy_km = int(easy_match.group(1)) if easy_match else 0
                intermediate_km = int(intermediate_match.group(1)) if intermediate_match else 0
                difficult_km = int(difficult_match.group(1)) if difficult_match else 0
                
                # Use total km from main text or calculate from breakdown
                total_km = total_km_from_main if total_km_from_main > 0 else (easy_km + intermediate_km + difficult_km)
                
                if total_km > 0:
                    # Convert km to trail counts using realistic ski resort ratios
                    # Large resorts like Park City: ~200+ trails for 250km = ~1.25km per trail
                    # Smaller resorts: ~40 trails for 30km = ~0.75km per trail
                    # Use sliding scale based on total km
                    
                    if total_km >= 200:  # Very large resort
                        km_per_trail = 1.2
                    elif total_km >= 100:  # Large resort
                        km_per_trail = 1.0
                    elif total_km >= 50:   # Medium resort
                        km_per_trail = 0.8
                    else:  # Small resort
                        km_per_trail = 0.7
                        
                    total_trails = max(int(total_km / km_per_trail), 1)
                    
                    # Calculate trail counts based on km proportions
                    if easy_km > 0:
                        beginner_trails = max(int((easy_km / total_km) * total_trails), 1)
                    else:
                        beginner_trails = 0
                        
                    if intermediate_km > 0:
                        intermediate_trails = max(int((intermediate_km / total_km) * total_trails), 1)
                    else:
                        intermediate_trails = 0
                        
                    if difficult_km > 0:
                        advanced_trails = max(int((difficult_km / total_km) * total_trails), 1)
                    else:
                        advanced_trails = 0
                    
                    # Expert trails (assume small percentage, usually not listed separately)
                    # If we have space after accounting for others, add a few expert trails
                    accounted_trails = beginner_trails + intermediate_trails + advanced_trails
                    if accounted_trails < total_trails:
                        remaining = total_trails - accounted_trails
                        # Split remaining between expert (20%) and intermediate (80%)
                        expert_trails = max(int(remaining * 0.2), 0)
                        intermediate_trails += (remaining - expert_trails)
                    else:
                        expert_trails = 0
                    
                    trail_data = {
                        'trails_beginner': beginner_trails,
                        'trails_intermediate': intermediate_trails,
                        'trails_advanced': advanced_trails,
                        'trails_expert': expert_trails,
                        'trails_total': total_trails
                    }
                    
                    if total_trails > 0:
                        return trail_data
            
            # Method 3: Look for simple trail count patterns as fallback
            # "X trails" or "X slopes" or "X pistes"
            trail_count_patterns = [
                r'(\d+)\s+trails?\s+(?:available|total|in total)',
                r'(\d+)\s+(?:ski\s+)?slopes?\s+(?:available|total)',
                r'(\d+)\s+pistes?\s+(?:available|total)',
                r'(\d+)\s+runs?\s+(?:available|total)'
            ]
            
            for pattern in trail_count_patterns:
                trail_match = re.search(pattern, text, re.IGNORECASE)
                if trail_match:
                    total_trails = int(trail_match.group(1))
                    if total_trails > 0:
                        # Use standard distribution
                        beginner_trails = max(int(total_trails * 0.25), 1)
                        intermediate_trails = max(int(total_trails * 0.50), 1) 
                        advanced_trails = max(int(total_trails * 0.20), 1)
                        expert_trails = max(total_trails - beginner_trails - intermediate_trails - advanced_trails, 0)
                        
                        trail_data = {
                            'trails_beginner': beginner_trails,
                            'trails_intermediate': intermediate_trails,
                            'trails_advanced': advanced_trails,
                            'trails_expert': expert_trails,
                            'trails_total': total_trails
                        }
                        break
            
            # Method 4: Try slope-offering page if main page extraction fails
            if trail_data['trails_total'] == 0:
                logger.info(f"Main page trail extraction failed, trying slope-offering page")
                slope_url = f"{base_url}slope-offering/"
                soup = self.get_page(slope_url)
                if soup:
                    slope_text = soup.get_text()
                    
                    # Look for percentage breakdown
                    beginner_match = re.search(r'beginner.*?(\d+(?:\.\d+)?)%', slope_text, re.IGNORECASE | re.DOTALL)
                    intermediate_match = re.search(r'intermediate.*?(\d+(?:\.\d+)?)%', slope_text, re.IGNORECASE | re.DOTALL)
                    advanced_match = re.search(r'advanced.*?(\d+(?:\.\d+)?)%', slope_text, re.IGNORECASE | re.DOTALL)
                    expert_match = re.search(r'expert.*?(\d+(?:\.\d+)?)%', slope_text, re.IGNORECASE | re.DOTALL)
                    
                    if beginner_match and intermediate_match and advanced_match:
                        beginner_pct = float(beginner_match.group(1))
                        intermediate_pct = float(intermediate_match.group(1))
                        advanced_pct = float(advanced_match.group(1))
                        expert_pct = float(expert_match.group(1)) if expert_match else 0
                        
                        # Estimate total trails
                        base_trails = 40  # Conservative estimate
                        
                        beginner_trails = max(int((beginner_pct / 100) * base_trails), 1)
                        intermediate_trails = max(int((intermediate_pct / 100) * base_trails), 1)
                        advanced_trails = max(int((advanced_pct / 100) * base_trails), 1)
                        expert_trails = max(int((expert_pct / 100) * base_trails), 0)
                        
                        actual_total = beginner_trails + intermediate_trails + advanced_trails + expert_trails
                        
                        trail_data = {
                            'trails_beginner': beginner_trails,
                            'trails_intermediate': intermediate_trails,
                            'trails_advanced': advanced_trails,
                            'trails_expert': expert_trails,
                            'trails_total': actual_total
                        }
            
        except Exception as e:
            logger.warning(f"Error extracting trail data: {e}")
        
        return trail_data

    def extract_lift_types_conservative(self, base_url):
        """
        COMPLETE lift extraction - all lift types from structured HTML data
        """
        lifts_url = f"{base_url}ski-lifts/"
        soup = self.get_page(lifts_url)
        if not soup:
            return {'fixed_grip_only': False, 'lift_details': []}
        
        try:
            # PARSE STRUCTURED LIFT DATA FROM HTML
            lift_details = []
            has_detachable = False
            has_gondola = False
            has_tram = False
            has_funicular = False
            
            # Find all lift items in the structured "List of all current ski lifts" section
            lift_sections = soup.find_all('div', class_='detail-links link-img no-pad-bottom detail-lift')
            
            for lift_div in lift_sections:
                try:
                    # Extract lift name from the h4/h5 title
                    title_elem = lift_div.find('h4', class_='h5') or lift_div.find('h5')
                    if not title_elem:
                        continue
                        
                    name_link = title_elem.find('a')
                    if not name_link:
                        continue
                        
                    lift_name = name_link.get_text(strip=True)
                    
                    # Extract lift type from the gray description
                    gray_span = lift_div.find('span', class_='gray')
                    if not gray_span:
                        continue
                        
                    type_desc = gray_span.get_text(strip=True).lower()
                    
                    # Parse lift type and characteristics
                    lift_info = {
                        'name': lift_name,
                        'detachable': False,
                        'fixed_grip': False
                    }
                    
                    # Gondola/Cable car detection
                    if 'gondola' in type_desc or 'monocable circulating ropeway' in type_desc:
                        lift_info['type'] = 'gondola'
                        has_gondola = True
                        
                    # Tram/Aerial tramway detection
                    elif 'aerial tramway' in type_desc or 'reversible ropeway' in type_desc or 'tram' in type_desc:
                        lift_info['type'] = 'tram'  
                        has_tram = True
                        
                    # Funicular detection
                    elif 'funicular' in type_desc:
                        lift_info['type'] = 'funicular'
                        has_funicular = True
                        
                    # Chairlift detection
                    elif 'chairlift' in type_desc:
                        lift_info['type'] = 'chairlift'
                        
                        # Determine if detachable or fixed-grip
                        if 'detachable' in type_desc or 'high speed' in type_desc:
                            lift_info['detachable'] = True
                            has_detachable = True
                        elif 'fixed-grip' in type_desc:
                            lift_info['fixed_grip'] = True
                            
                    # Surface lift detection
                    elif any(surface_type in type_desc for surface_type in ['t-bar', 'j-bar', 'platter', 'button']):
                        lift_info['type'] = 'surface_lift'
                        lift_info['subtype'] = 'tbar_jbar'
                        
                    elif 'people mover' in type_desc or 'moving carpet' in type_desc or 'magic carpet' in type_desc:
                        lift_info['type'] = 'surface_lift' 
                        lift_info['subtype'] = 'people_mover'
                        
                    elif 'rope tow' in type_desc or 'handle tow' in type_desc:
                        lift_info['type'] = 'surface_lift'
                        lift_info['subtype'] = 'rope_tow'
                        
                    else:
                        # Unknown lift type - still include it
                        lift_info['type'] = 'other'
                        
                    lift_details.append(lift_info)
                    
                except Exception as e:
                    logger.warning(f"Error parsing individual lift: {e}")
                    continue
            
            # If no structured lifts found, fall back to text pattern detection
            if not lift_details:
                logger.info("No structured lift data found, falling back to text pattern detection")
                
                text = soup.get_text()
                lift_content_start = text.find("List of all current ski lifts")
                if lift_content_start == -1:
                    lift_content_start = text.find("All lifts/cable cars")
                if lift_content_start == -1:
                    lift_content_start = text.find("Ski lifts")
                
                if lift_content_start > 0:
                    lift_section = text[lift_content_start:lift_content_start + 15000]
                else:
                    lift_section = text
                
                # Basic pattern detection for fallback
                if re.search(r'gondola|cable car', lift_section, re.IGNORECASE):
                    has_gondola = True
                    lift_details.append({
                        'type': 'gondola',
                        'name': 'Gondola (pattern detected)',
                        'detachable': False,
                        'fixed_grip': False
                    })
                
                if re.search(r'detachable|high speed', lift_section, re.IGNORECASE):
                    has_detachable = True
                    lift_details.append({
                        'type': 'chairlift',
                        'name': 'High speed chairlift (pattern detected)',
                        'detachable': True,
                        'fixed_grip': False
                    })
            
            # MAINTAIN EXISTING fixed-grip-only determination logic EXACTLY
            fixed_grip_only = not (has_detachable or has_gondola or has_tram or has_funicular)
            
            return {
                'fixed_grip_only': fixed_grip_only,
                'lift_details': lift_details,
                'has_detachable': has_detachable,
                'has_gondola': has_gondola,
                'has_tram': has_tram,
                'has_funicular': has_funicular,
                'surface_lifts_count': len([l for l in lift_details if l['type'] == 'surface_lift'])
            }
            
        except Exception as e:
            logger.warning(f"Error extracting lift types from {lifts_url}: {e}")
            return {'fixed_grip_only': False, 'lift_details': []}

    def extract_trail_map(self, base_url):
        """Extract trail map image URL from trail-map page"""
        trail_map_url = f"{base_url}trail-map/"
        soup = self.get_page(trail_map_url)
        if not soup:
            return None
        
        try:
            # Look for trail map images
            img_tags = soup.find_all('img')
            
            for img in img_tags:
                src = img.get('src', '')
                alt = img.get('alt', '').lower()
                
                # Look for images that are likely trail maps
                if any(keyword in alt for keyword in ['trail map', 'piste map', 'ski map', 'slope map']):
                    if src.startswith('http'):
                        return src
                    elif src.startswith('/'):
                        return f"https://www.skiresort.info{src}"
                
                # Also check if the image has trail map indicators in the src
                if any(keyword in src.lower() for keyword in ['trail', 'piste', 'map', 'slope']):
                    if 'skiresort' in src or 'trail' in src:
                        if src.startswith('http'):
                            return src
                        elif src.startswith('/'):
                            return f"https://www.skiresort.info{src}"
            
            # Look for links to trail map PDFs or images
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if any(ext in href.lower() for ext in ['.pdf', '.jpg', '.png', '.gif']):
                    if any(keyword in href.lower() for keyword in ['trail', 'piste', 'map']):
                        if href.startswith('http'):
                            return href
                        elif href.startswith('/'):
                            return f"https://www.skiresort.info{href}"
            
            return None
            
        except Exception as e:
            logger.warning(f"Error extracting trail map from {trail_map_url}: {e}")
            return None

    def extract_elevation_data(self, soup):
        """Extract elevation information"""
        try:
            text = soup.get_text()
            elevation_match = re.search(r'(\d+)\s*m\s*[-–]\s*(\d+)\s*m', text)
            if elevation_match:
                base = int(elevation_match.group(1))
                top = int(elevation_match.group(2))
                return {
                    'elevation_base': base,
                    'elevation_top': top,
                    'elevation_difference': top - base
                }
        except Exception as e:
            logger.warning(f"Error extracting elevation: {e}")
        
        return {'elevation_base': None, 'elevation_top': None, 'elevation_difference': None}

    def extract_slopes_data(self, soup):
        """Extract slopes/trails information using proper HTML parsing"""
        slopes_data = {
            'slopes_total_km': None,
            'slopes_easy_km': None,
            'slopes_intermediate_km': None,
            'slopes_difficult_km': None,
        }
        
        try:
            # First try to find slope data by specific IDs (most reliable)
            total_elem = soup.find(id='selSlopetot')
            if total_elem:
                total_text = total_elem.get_text()
                total_match = re.search(r'(\d+\.?\d*)\s*km', total_text)
                if total_match:
                    slopes_data['slopes_total_km'] = float(total_match.group(1))
            
            easy_elem = soup.find(id='selBeginner')
            if easy_elem:
                easy_text = easy_elem.get_text()
                easy_match = re.search(r'(\d+\.?\d*)\s*km', easy_text)
                if easy_match:
                    slopes_data['slopes_easy_km'] = float(easy_match.group(1))
            
            inter_elem = soup.find(id='selInter')
            if inter_elem:
                inter_text = inter_elem.get_text()
                inter_match = re.search(r'(\d+\.?\d*)\s*km', inter_text)
                if inter_match:
                    slopes_data['slopes_intermediate_km'] = float(inter_match.group(1))
            
            adv_elem = soup.find(id='selAdv')
            if adv_elem:
                adv_text = adv_elem.get_text()
                adv_match = re.search(r'(\d+\.?\d*)\s*km', adv_text)
                if adv_match:
                    slopes_data['slopes_difficult_km'] = float(adv_match.group(1))
            
            # Fallback: Look for slope data in table structure
            if not any(slopes_data.values()):
                run_table = soup.find('table', class_='run-table')
                if run_table:
                    rows = run_table.find_all('tr')
                    for row in rows:
                        cells = row.find_all('td')
                        if len(cells) >= 2:
                            desc_cell = cells[0].get_text().lower()
                            distance_cell = cells[1].get_text()
                            
                            km_match = re.search(r'(\d+\.?\d*)\s*km', distance_cell)
                            if km_match:
                                km_value = float(km_match.group(1))
                                
                                if 'easy' in desc_cell:
                                    slopes_data['slopes_easy_km'] = km_value
                                elif 'intermediate' in desc_cell:
                                    slopes_data['slopes_intermediate_km'] = km_value
                                elif 'difficult' in desc_cell or 'advanced' in desc_cell:
                                    slopes_data['slopes_difficult_km'] = km_value
            
            # Calculate total if individual slopes found but no total
            if (not slopes_data['slopes_total_km'] and 
                any([slopes_data['slopes_easy_km'], slopes_data['slopes_intermediate_km'], slopes_data['slopes_difficult_km']])):
                total = 0
                for value in [slopes_data['slopes_easy_km'], slopes_data['slopes_intermediate_km'], slopes_data['slopes_difficult_km']]:
                    if value:
                        total += value
                if total > 0:
                    slopes_data['slopes_total_km'] = total
            
        except Exception as e:
            logger.warning(f"Error extracting slopes: {e}")
        
        return slopes_data

    def extract_lifts_data(self, soup):
        """Extract lifts information"""
        try:
            text = soup.get_text()
            
            transport_match = re.search(r'(\d{1,3})\s+lifts?\s+transport', text, re.IGNORECASE)
            if transport_match:
                count = int(transport_match.group(1))
                if 1 <= count <= 200:
                    return {'lifts_total': count}
            
            lifts_link_match = re.search(r'\[(\d{1,3})\s+lifts?\]', text, re.IGNORECASE)
            if lifts_link_match:
                count = int(lifts_link_match.group(1))
                if 1 <= count <= 200:
                    return {'lifts_total': count}
            
            lifts_simple_match = re.search(r'(\d{1,3})\s+lifts?', text, re.IGNORECASE)
            if lifts_simple_match:
                count = int(lifts_simple_match.group(1))
                if 1 <= count <= 200:
                    return {'lifts_total': count}
                
        except Exception as e:
            logger.warning(f"Error extracting lifts data: {e}")
        
        return {'lifts_total': None}

    def extract_basic_data_with_real_website(self, soup):
        """Extract basic data with FIXED website extraction to get real resort websites"""
        try:
            text = soup.get_text()
            
            # Day pass price
            price_match = re.search(r'Day\s+pass\s+adult.*?(\d{1,3})\s*USD', text, re.IGNORECASE | re.DOTALL)
            day_pass_adult = int(price_match.group(1)) if price_match else None
            
            # FIXED: Website extraction - look for pattern like [Resort Name](https://resort.com/)
            website = None
            
            # Method 1: Find resort name links that point to external websites
            # Look for markdown-style links in the HTML like [Bolton Valley](https://www.boltonvalley.com/)
            resort_name_match = re.search(r'<title>([^-]+)', str(soup))
            if resort_name_match:
                resort_name = resort_name_match.group(1).strip().replace('Ski resort ', '')
                
                # Look for links containing the resort name that go to external sites
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    link_text = link.get_text().strip()
                    
                    # Check if this link contains the resort name and goes to an external site
                    if (href.startswith('http') and 
                        'skiresort.info' not in href and 
                        'skiresort.de' not in href and
                        'skiresort.fr' not in href and
                        'booking.com' not in href and
                        'expedia.com' not in href and
                        'hotels.com' not in href and
                        'facebook.com' not in href and
                        'instagram.com' not in href and
                        'twitter.com' not in href and
                        'youtube.com' not in href and
                        'adserver' not in href):
                        
                        # Check if link text matches resort name (for direct resort links)
                        if (link_text.lower() in resort_name.lower() or 
                            resort_name.lower() in link_text.lower()):
                            website = href
                            break
                        
                        # Also check domain for resort indicators
                        domain = urlparse(href).netloc.lower()
                        if any(word in domain for word in ['ski', 'mountain', 'resort', 'snow', 'valley', 'peak']):
                            # Check if domain relates to resort name 
                            name_words = resort_name.lower().split()
                            if any(word in domain for word in name_words if len(word) > 3):
                                website = href
                                break
            
            # Method 2: Look for first external link if no resort-specific link found
            if not website:
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    if (href.startswith('http') and 
                        'skiresort.info' not in href and 
                        'skiresort.de' not in href and
                        'skiresort.fr' not in href and
                        'booking.com' not in href and
                        'expedia.com' not in href and
                        'hotels.com' not in href and
                        'facebook.com' not in href and
                        'instagram.com' not in href and
                        'twitter.com' not in href and
                        'youtube.com' not in href and
                        'adserver' not in href):
                        
                        domain = urlparse(href).netloc.lower()
                        if any(word in domain for word in ['ski', 'mountain', 'resort', 'snow']):
                            website = href
                            break
            
            # Extract pricing data from the main page
            pricing_data = self.extract_pricing_data(soup)
            
            return {
                'day_pass_adult': day_pass_adult,
                'website': website,
                **pricing_data
            }
            
        except Exception as e:
            logger.warning(f"Error extracting basic data: {e}")
            return {}

    def extract_pricing_data(self, soup):
        """Extract adult and child pass pricing from the main resort page"""
        try:
            # Look for adult ticket price with id="selTicketA" 
            adult_price = None
            adult_element = soup.find(id='selTicketA')
            if adult_element:
                adult_text = adult_element.get_text().strip()
                # Extract price from "US$ 264,-" format
                price_match = re.search(r'US\$\s*(\d+)', adult_text)
                if price_match:
                    adult_price = int(price_match.group(1))
            
            # Look for child ticket price with id="selTicketC"
            child_price = None  
            child_element = soup.find(id='selTicketC')
            if child_element:
                child_text = child_element.get_text().strip()
                # Extract price from "US$ 189,-" format
                price_match = re.search(r'US\$\s*(\d+)', child_text)
                if price_match:
                    child_price = int(price_match.group(1))
            
            return {
                'adult_pass_price': adult_price,
                'child_pass_price': child_price
            }
            
        except Exception as e:
            logger.warning(f"Error extracting pricing data: {e}")
            return {'adult_pass_price': None, 'child_pass_price': None}

    def scrape_resort(self, url, state=None):
        """Scrape a single resort"""
        logger.info(f"Scraping resort: {url}")
        
        soup = self.get_page(url)
        if not soup:
            return None
        
        try:
            # Extract resort name
            title_tag = soup.find('title')
            if title_tag and title_tag.text:
                name = title_tag.text.split(' - ')[0].strip()
                # Clean up common title patterns
                name = re.sub(r'^Ski resort\s+', '', name, flags=re.IGNORECASE)
                name = re.sub(r'\s+-.*$', '', name)  # Remove everything after first dash
                name = name.strip()
            else:
                # Fallback: extract from URL
                name = url.split('/ski-resort/')[-1].rstrip('/').replace('-', ' ').title()
            
            # Use provided state or try to extract from URL
            if not state:
                state_match = re.search(r'/ski-resorts/([^/]+)/', url)
                if state_match:
                    state_code = state_match.group(1).replace('-', ' ').title()
                    # Convert common state codes
                    state_mapping = {
                        'Usa': 'USA', 'California': 'California', 'Colorado': 'Colorado',
                        'Utah': 'Utah', 'Vermont': 'Vermont', 'New Hampshire': 'New Hampshire',
                        'Maine': 'Maine', 'Montana': 'Montana', 'Wyoming': 'Wyoming',
                        'Idaho': 'Idaho', 'Washington': 'Washington', 'Oregon': 'Oregon',
                        'New Mexico': 'New Mexico', 'Nevada': 'Nevada', 'Alaska': 'Alaska',
                        'Massachusetts': 'Massachusetts', 'Connecticut': 'Connecticut',
                        'New York': 'New York', 'Pennsylvania': 'Pennsylvania',
                        'West Virginia': 'West Virginia', 'Virginia': 'Virginia',
                        'North Carolina': 'North Carolina', 'Tennessee': 'Tennessee',
                        'Michigan': 'Michigan', 'Wisconsin': 'Wisconsin', 'Minnesota': 'Minnesota',
                        'South Dakota': 'South Dakota', 'North Dakota': 'North Dakota',
                        'Iowa': 'Iowa', 'Illinois': 'Illinois', 'Indiana': 'Indiana',
                        'Ohio': 'Ohio', 'Missouri': 'Missouri', 'Arkansas': 'Arkansas',
                        'Alabama': 'Alabama', 'Arizona': 'Arizona'
                    }
                    state = state_mapping.get(state_code, state_code)
                else:
                    state = 'Unknown'
            
            # Extract all data
            elevation_data = self.extract_elevation_data(soup)
            slopes_data = self.extract_slopes_data(soup)
            lifts_data = self.extract_lifts_data(soup)
            basic_data = self.extract_basic_data_with_real_website(soup)  # FIXED VERSION
            
            # CONSERVATIVE lift extraction 
            lift_type_data = self.extract_lift_types_conservative(url)
            
            # FIXED trail difficulty extraction with main page fallback
            trail_data = self.extract_trail_difficulty_data_with_main_fallback(url, soup)
            
            # Trail map extraction
            trail_map_url = self.extract_trail_map(url)
            
            # Combine all data
            resort_data = {
                'name': name,
                'state': state,
                'url': url,
                **elevation_data,
                **slopes_data,
                **lifts_data,
                **basic_data,
                **lift_type_data,
                **trail_data,
                'trail_map_url': trail_map_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            logger.info(f"✅ Successfully scraped {name} - Fixed grip: {resort_data.get('fixed_grip_only')}, Surface lifts: {lift_type_data.get('surface_lifts_count', 0)}, Trails: {trail_data.get('trails_total', 0)}")
            return resort_data
            
        except Exception as e:
            logger.error(f"Error scraping resort {url}: {e}")
            return None

    def scrape_all_resorts(self, limit_resorts=None):
        """Scrape USA ski resorts with conservative surface lift detection"""
        if limit_resorts:
            logger.info(f"Starting CONSERVATIVE scraper - limited to {limit_resorts} resorts for testing")
        else:
            logger.info(f"Starting CONSERVATIVE scraper - scraping ALL USA ski resorts")
        
        # Discover resorts
        resort_urls = self.discover_usa_resorts(limit_resorts=limit_resorts)
        
        all_resorts = []
        
        for i, (url, state) in enumerate(resort_urls, 1):
            logger.info(f"\n--- Processing resort {i}/{len(resort_urls)} ---")
            
            resort_data = self.scrape_resort(url, state)
            if resort_data:
                all_resorts.append(resort_data)
                
                # Log progress with lift details
                surface_count = resort_data.get('surface_lifts_count', 0)
                fixed_grip = resort_data.get('fixed_grip_only', False)
                trails_total = resort_data.get('trails_total', 0)
                website = resort_data.get('website', 'None')[:50]
                logger.info(f"Resort {i}: {resort_data['name']} - Surface lifts: {surface_count}, Fixed-grip: {fixed_grip}, Trails: {trails_total}, Website: {website}")
            else:
                logger.warning(f"Failed to scrape resort {i}: {url}")
            
            # Be polite
            time.sleep(2)
        
        return all_resorts

def main():
    """Run the USA ski info scraper on ALL USA ski resorts"""
    scraper = USASkiInfoScraper()
    
    # Scrape ALL USA resorts
    logger.info("🚀 Starting USA ski info scraper for ALL USA ski resorts")
    resorts = scraper.scrape_all_resorts(limit_resorts=None)
    
    if resorts:
        # Save results
        filename = f"usa_ski_resorts_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(resorts, f, indent=2, ensure_ascii=False)
        
        # Print detailed results
        logger.info(f"\n🎿 SCRAPING COMPLETE!")
        logger.info(f"📁 Saved {len(resorts)} resorts to: {filename}")
        
        # Analyze results
        surface_lift_resorts = [r for r in resorts if r.get('surface_lifts_count', 0) > 0]
        fixed_grip_resorts = [r for r in resorts if r.get('fixed_grip_only', False)]
        trail_map_resorts = [r for r in resorts if r.get('trail_map_url')]
        resorts_with_trails = [r for r in resorts if r.get('trails_total', 0) > 0]
        resorts_with_websites = [r for r in resorts if r.get('website') and 'skiresort.info' not in r.get('website', '')]
        
        logger.info(f"\n📊 FINAL ANALYSIS:")
        logger.info(f"   Total resorts scraped: {len(resorts)}")
        logger.info(f"   Resorts with surface lifts: {len(surface_lift_resorts)}")
        logger.info(f"   Fixed-grip only resorts: {len(fixed_grip_resorts)}")
        logger.info(f"   Resorts with trail maps: {len(trail_map_resorts)}")
        logger.info(f"   Resorts with trail data: {len(resorts_with_trails)}")
        logger.info(f"   Resorts with proper websites: {len(resorts_with_websites)}")
        
        logger.info(f"\n🚡 Surface lift examples:")
        for resort in surface_lift_resorts[:5]:  # Show first 5
            logger.info(f"   {resort['name']}: {resort.get('surface_lifts_count')} surface lifts")
        
        logger.info(f"\n🎿 Trail count examples:")
        for resort in resorts_with_trails[:5]:  # Show first 5
            trails = resort.get('trails_total', 0)
            logger.info(f"   {resort['name']}: {trails} trails")
        
        logger.info(f"\n🌐 Website examples:")
        for resort in resorts_with_websites[:5]:  # Show first 5
            website = resort.get('website', 'None')[:50]
            logger.info(f"   {resort['name']}: {website}")
            
    else:
        logger.error("No resorts were successfully scraped!")

if __name__ == "__main__":
    main()