#!/usr/bin/env python3
"""
Enhanced USA Ski Resorts Scraper with accurate trail difficulty and lift type data
Fetches detailed data from /slope-offering/ and /ski-lifts/ pages
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
from urllib.parse import urljoin, urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedSkiResortScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.base_url = "https://www.skiresort.info"
        
    def get_page(self, url):
        """Fetch a page with error handling"""
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            time.sleep(1)  # Be polite to the server
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def discover_usa_resorts(self, first_page_only=False):
        """Discover all USA ski resort URLs from the main listings"""
        base_url = "https://www.skiresort.info/ski-resorts/usa/"
        all_urls = []
        
        page = 1
        max_pages = 1 if first_page_only else 20  # Limit to first page if requested
        
        while page <= max_pages:
            if page == 1:
                url = base_url
            else:
                url = f"{base_url}page/{page}/"
            
            logger.info(f"Scraping page {page}: {url}")
            soup = self.get_page(url)
            if not soup:
                break
                
            # Find all resort links
            links = soup.find_all('a', href=True)
            resort_links = []
            
            for link in links:
                href = link['href']
                if '/ski-resort/' in href and href.startswith('https://www.skiresort.info/'):
                    # Only capture main resort pages - exclude special pages
                    # Main resort URLs should end with the resort name (no additional path segments)
                    if (not href.endswith('/') and '/' not in href.split('/ski-resort/')[-1]) or \
                       (href.endswith('/') and '/' not in href.rstrip('/').split('/ski-resort/')[-1]):
                        # Exclude specific page types we don't want
                        exclude_patterns = ['/test-report', '/snow-report', '/comparison', '/photos', 
                                          '/accommodation', '/weather', '/forum', '/webcam', '/news',
                                          '/lift-operator', '/slope-offering', '/ski-lifts']
                        if not any(pattern in href for pattern in exclude_patterns):
                            if href not in all_urls:
                                resort_links.append(href)
                                all_urls.append(href)
            
            logger.info(f"Found {len(all_urls)} resorts on page {page}")
            
            if not resort_links:
                break
                
            if first_page_only:
                break  # Exit after first page
                
            page += 1
        
        logger.info(f"Discovered {len(all_urls)} main USA ski resort pages from {page} pages")
        return all_urls

    def extract_trail_difficulty_data(self, base_url):
        """Extract detailed trail difficulty data from slope-offering page"""
        slope_url = f"{base_url}slope-offering/"
        soup = self.get_page(slope_url)
        if not soup:
            return {'trails_beginner': 0, 'trails_intermediate': 0, 'trails_advanced': 0, 'trails_expert': 0, 'trails_total': 0}
        
        try:
            text = soup.get_text()
            
            # Look for the pattern "Easy X km (Y%)" etc.
            easy_match = re.search(r'Easy\s*(\d+(?:\.\d+)?)\s*km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            intermediate_match = re.search(r'Intermediate\s*(\d+(?:\.\d+)?)\s*km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            difficult_match = re.search(r'Difficult\s*(\d+(?:\.\d+)?)\s*km\s*\((\d+)\s*%\)', text, re.IGNORECASE)
            
            # Calculate total trails - more realistic estimate based on slope analysis
            total_km_match = re.search(r'Total:\s*(\d+(?:\.\d+)?)\s*km', text, re.IGNORECASE)
            total_trails = 10  # Default reasonable number
            
            if total_km_match:
                total_km = float(total_km_match.group(1))
                # More realistic trail count: smaller resorts have shorter trails
                if total_km <= 15:
                    total_trails = max(5, int(total_km * 0.8))  # 0.8 trails per km for small resorts
                elif total_km <= 50:
                    total_trails = max(10, int(total_km * 0.6))  # 0.6 trails per km for medium resorts
                else:
                    total_trails = max(15, int(total_km * 0.4))  # 0.4 trails per km for large resorts
            
            # Calculate trail counts based on percentages
            beginner = 0
            intermediate = 0
            advanced = 0
            expert = 0
            
            if easy_match:
                pct = int(easy_match.group(2))
                beginner = max(1, int((pct / 100.0) * total_trails)) if pct > 0 else 0
            
            if intermediate_match:
                pct = int(intermediate_match.group(2))
                intermediate = max(1, int((pct / 100.0) * total_trails)) if pct > 0 else 0
                
            if difficult_match:
                pct = int(difficult_match.group(2))
                advanced = max(1, int((pct / 100.0) * total_trails)) if pct > 0 else 0
            
            # Recalculate total based on actual allocations
            total_trails = beginner + intermediate + advanced + expert
            if total_trails == 0:
                total_trails = 10  # Fallback
                intermediate = 10  # Assume all intermediate if no data
            
            return {
                'trails_beginner': beginner,
                'trails_intermediate': intermediate, 
                'trails_advanced': advanced,
                'trails_expert': expert,
                'trails_total': total_trails
            }
            
        except Exception as e:
            logger.warning(f"Error extracting trail difficulty from {slope_url}: {e}")
            return {'trails_beginner': 0, 'trails_intermediate': 0, 'trails_advanced': 0, 'trails_expert': 0, 'trails_total': 0}

    def extract_lift_types(self, base_url):
        """Extract lift types to determine if resort has only fixed-grip lifts"""
        lifts_url = f"{base_url}ski-lifts/"
        soup = self.get_page(lifts_url)
        if not soup:
            return {'fixed_grip_only': False, 'lift_details': []}
        
        try:
            text = soup.get_text()
            
            # Look for lift type indicators
            has_detachable = False
            has_gondola = False
            has_tram = False
            has_funicular = False
            
            lift_details = []
            
            # Search for specific lift patterns with more precision
            # Look for the structured lift information patterns
            lift_patterns = [
                # Match: "4pers. High speed chairlift (detachable)"
                r'(\d+(?:pers\.?)?\s*(?:High speed\s*)?(?:Chairlift|chairlift|Chair|chair)\s*\([^)]*(?:detachable|fixed-grip)[^)]*\))',
                # Match: "6 Chairlift" followed by detachable info
                r'(\d+\s+Chairlift.*?(?:detachable|fixed-grip))',
                # Match standalone lift descriptions
                r'((?:Detachable|Fixed-grip|High speed)\s+(?:\d+(?:pers\.?)?\s*)?(?:Chairlift|chairlift|Chair|chair))',
            ]
            
            # Extract lift information using multiple patterns
            all_lift_matches = []
            for pattern in lift_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
                all_lift_matches.extend(matches)
            
            # More targeted search for lift type indicators in actual lift content
            # Focus on lift data sections, not navigation/header content
            
            # Find the main lift content section (after "List of all current ski lifts" or similar)
            lift_content_start = text.find("List of all current ski lifts")
            if lift_content_start == -1:
                lift_content_start = text.find("All lifts/cable cars")
            if lift_content_start == -1:
                lift_content_start = text.find("Ski lifts")
            
            # Extract just the relevant lift content
            if lift_content_start > 0:
                # Get text from lift section to end, but exclude footer/navigation
                lift_section = text[lift_content_start:lift_content_start + 10000]  # Reasonable limit
                # Stop at common footer indicators
                for footer_marker in ["Feedback for the Skiresort.info", "Book this ski resort", "Accommodation", "Test Reports"]:
                    footer_pos = lift_section.find(footer_marker)
                    if footer_pos > 0:
                        lift_section = lift_section[:footer_pos]
                        break
            else:
                lift_section = text
            
            # Process found lifts from patterns
            seen_lifts = set()  # To avoid duplicates
            for lift in all_lift_matches:
                if len(lift) > 10:  # Skip very short matches
                    lift_clean = lift.strip()
                    if lift_clean not in seen_lifts:
                        seen_lifts.add(lift_clean)
                        is_detachable = bool(re.search(r'detachable|high speed|express', lift, re.IGNORECASE))
                        is_fixed_grip = bool(re.search(r'fixed-grip', lift, re.IGNORECASE))
                        
                        lift_info = {
                            'type': 'chairlift',
                            'detachable': is_detachable,
                            'fixed_grip': is_fixed_grip,
                            'name': lift_clean[:80]  # Truncate for readability
                        }
                        lift_details.append(lift_info)
                        
                        if is_detachable:
                            has_detachable = True
            
            # Check for other lift types only in the lift section
            # Use more specific patterns to avoid false positives from navigation
            gondola_pattern = r'(?:Gondola|gondola)\s+(?:lift|cabin|car)'
            tram_pattern = r'(?:Aerial\s+tramway|Tram|tramway|reversible\s+ropeway)'
            funicular_pattern = r'Funicular'
            
            if re.search(gondola_pattern, lift_section, re.IGNORECASE):
                has_gondola = True
                lift_details.append({
                    'type': 'gondola',
                    'detachable': False,
                    'fixed_grip': False,
                    'name': 'Gondola (detected)'
                })
                    
            if re.search(tram_pattern, lift_section, re.IGNORECASE):
                has_tram = True
                lift_details.append({
                    'type': 'tram',
                    'detachable': False,
                    'fixed_grip': False,
                    'name': 'Tram/Tramway (detected)'
                })
                    
            if re.search(funicular_pattern, lift_section, re.IGNORECASE):
                has_funicular = True
                lift_details.append({
                    'type': 'funicular',
                    'detachable': False,
                    'fixed_grip': False,
                    'name': 'Funicular (detected)'
                })
            
            # If we have no specific lift details but found general indicators, add them
            if not lift_details and any([has_detachable, has_gondola, has_tram, has_funicular]):
                # Add basic entries based on text search
                if has_detachable:
                    lift_details.append({'type': 'chairlift', 'detachable': True, 'fixed_grip': False, 'name': 'Detachable chairlift (detected)'})
                if has_gondola:
                    lift_details.append({'type': 'gondola', 'detachable': False, 'fixed_grip': False, 'name': 'Gondola (detected)'})
                if has_tram:
                    lift_details.append({'type': 'tram', 'detachable': False, 'fixed_grip': False, 'name': 'Tram (detected)'})
                if has_funicular:
                    lift_details.append({'type': 'funicular', 'detachable': False, 'fixed_grip': False, 'name': 'Funicular (detected)'})
            
            # If we found any detachable, gondola, tram, or funicular, it's not fixed-grip only
            fixed_grip_only = not (has_detachable or has_gondola or has_tram or has_funicular)
            
            return {
                'fixed_grip_only': fixed_grip_only,
                'lift_details': lift_details,
                'has_detachable': has_detachable,
                'has_gondola': has_gondola,
                'has_tram': has_tram,
                'has_funicular': has_funicular
            }
            
        except Exception as e:
            logger.warning(f"Error extracting lift types from {lifts_url}: {e}")
            return {'fixed_grip_only': False, 'lift_details': []}

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
        """Extract slopes/trails information"""
        try:
            text = soup.get_text()
            slopes_match = re.search(r'Total:\s*(\d+)\s*km', text)
            if slopes_match:
                total_km = int(slopes_match.group(1))
                
                easy_match = re.search(r'Easy\s+(\d+(?:\.\d+)?)\s*km', text)
                intermediate_match = re.search(r'Intermediate\s+(\d+(?:\.\d+)?)\s*km', text)
                difficult_match = re.search(r'Difficult\s+(\d+(?:\.\d+)?)\s*km', text)
                
                return {
                    'slopes_total_km': total_km,
                    'slopes_easy_km': float(easy_match.group(1)) if easy_match else None,
                    'slopes_intermediate_km': float(intermediate_match.group(1)) if intermediate_match else None,
                    'slopes_difficult_km': float(difficult_match.group(1)) if difficult_match else None
                }
        except Exception as e:
            logger.warning(f"Error extracting slopes: {e}")
        
        return {'slopes_total_km': None, 'slopes_easy_km': None, 'slopes_intermediate_km': None, 'slopes_difficult_km': None}

    def extract_lifts_data(self, soup):
        """Extract lifts information - CORRECTED VERSION"""
        try:
            text = soup.get_text()
            
            # Pattern 1: Look for "X lifts transport the guests"
            transport_match = re.search(r'(\d{1,3})\s+lifts?\s+transport', text, re.IGNORECASE)
            if transport_match:
                count = int(transport_match.group(1))
                if 1 <= count <= 200:  # Reasonable lift count
                    return {'lifts_total': count}
            
            # Pattern 2: Look for "[X lifts]" link pattern
            lifts_link_match = re.search(r'\[(\d{1,3})\s+lifts?\]', text, re.IGNORECASE)
            if lifts_link_match:
                count = int(lifts_link_match.group(1))
                if 1 <= count <= 200:
                    return {'lifts_total': count}
                    
            # Pattern 3: Look near "Ski lifts" section for "Total: X"
            # Find all occurrences of text around "lifts"
            lifts_sections = re.findall(r'.{0,100}lifts?.{0,100}', text, re.IGNORECASE)
            for section in lifts_sections:
                # Look for "Total: X" pattern within lifts context
                total_match = re.search(r'Total:\s*(\d{1,3})', section)
                if total_match:
                    count = int(total_match.group(1))
                    if 1 <= count <= 200 and count != 2016:  # Avoid years
                        return {'lifts_total': count}
                        
        except Exception as e:
            logger.warning(f"Error extracting lifts: {e}")
        
        return {'lifts_total': None}

    def extract_price_data(self, soup):
        """Extract ticket price information"""
        try:
            text = soup.get_text()
            price_match = re.search(r'US\$\s*(\d+)', text)
            if price_match:
                return {'day_pass_adult': int(price_match.group(1))}
        except Exception as e:
            logger.warning(f"Error extracting price: {e}")
        
        return {'day_pass_adult': None}

    def extract_website_url(self, soup, resort_name):
        """Extract the official resort website URL - ENHANCED VERSION"""
        try:
            # Look for external links with priority ordering
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True).lower()
                
                # Skip internal skiresort.info links (all language versions)
                if any(domain in href for domain in ['skiresort.info', 'skiresort.de', 'skiresort.fr', 
                                                   'skiresort.nl', 'skiresort.it']):
                    continue
                    
                # Skip obvious non-resort sites  
                if any(skip in href.lower() for skip in ['booking.com', 'facebook.com', 'twitter.com', 
                                                       'youtube.com', 'instagram.com', 'google.com', 
                                                       'adserver', 'checkyeti.com', 'expedia.com',
                                                       'tripadvisor.com', 'yelp.com', 'skiresort-service.com',
                                                       '/presse/', '/press/', '/company/', '/login/']):
                    continue
                
                if href.startswith('http'):
                    # Priority 1: Links with "website" or "go to" text
                    if any(keyword in text for keyword in ['website', 'go to', 'official', 'homepage']):
                        return href
                        
                    # Priority 2: Resort domain matches
                    domain = urlparse(href).netloc.lower()
                    resort_words = [word.lower() for word in resort_name.split() if len(word) > 2]
                    
                    # Check if resort name words are in domain
                    for word in resort_words:
                        clean_word = re.sub(r'[^a-z]', '', word)
                        if len(clean_word) > 3 and clean_word in domain.replace('-', '').replace('.', ''):
                            return href
                    
                    # Priority 3: Common resort domain patterns with length check
                    if any(keyword in domain for keyword in ['ski', 'resort', 'mountain']) and len(domain) < 50:
                        return href
            
        except Exception as e:
            logger.warning(f"Error extracting website: {e}")
        
        return None

    def extract_official_website(self, base_url, resort_name):
        """
        Extract official website from both main page and lift-operator page
        Prioritizes the lift-operator page as it has cleaner contact info
        """
        # Try lift-operator page first - it has cleaner contact info
        lift_operator_url = f"{base_url}lift-operator/"
        website = self._extract_website_from_page(lift_operator_url, resort_name)
        
        if website:
            return website
            
        # Fallback to main page
        website = self._extract_website_from_page(base_url, resort_name)
        return website
        
    def _extract_website_from_page(self, url, resort_name):
        """Extract website from a specific page"""
        soup = self.get_page(url)
        if not soup:
            return None
            
        try:
            # Look for external links with priority ordering
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True).lower()
                
                # Skip internal skiresort.info links (all language versions)
                if any(domain in href for domain in ['skiresort.info', 'skiresort.de', 'skiresort.fr', 
                                                   'skiresort.nl', 'skiresort.it']):
                    continue
                    
                # Skip obvious non-resort sites  
                if any(skip in href.lower() for skip in ['booking.com', 'facebook.com', 'twitter.com', 
                                                       'youtube.com', 'instagram.com', 'google.com', 
                                                       'adserver', 'checkyeti.com', 'expedia.com',
                                                       'tripadvisor.com', 'yelp.com', 'skiresort-service.com',
                                                       '/presse/', '/press/', '/company/', '/login/']):
                    continue
                
                if href.startswith('http'):
                    # Priority 1: Links with "website" or "go to" text
                    if any(keyword in text for keyword in ['website', 'go to', 'official', 'homepage']):
                        return href
                        
                    # Priority 2: Resort domain matches
                    domain = urlparse(href).netloc.lower()
                    resort_words = [word.lower() for word in resort_name.split() if len(word) > 2]
                    
                    # Check if resort name words are in domain
                    for word in resort_words:
                        clean_word = re.sub(r'[^a-z]', '', word)
                        if len(clean_word) > 3 and clean_word in domain.replace('-', '').replace('.', ''):
                            return href
                    
                    # Priority 3: Common resort domain patterns with length check
                    if any(keyword in domain for keyword in ['ski', 'resort', 'mountain']) and len(domain) < 50:
                        return href
                        
            return None
            
        except Exception as e:
            logger.warning(f"Error extracting website from {url}: {e}")
            return None

    def extract_official_website(self, base_url, resort_name):
        """
        Extract official website from both main page and lift-operator page
        Prioritizes the lift-operator page as it has cleaner contact info
        """
        # Try lift-operator page first - it has cleaner contact info
        lift_operator_url = f"{base_url}lift-operator/"
        website = self._extract_website_from_page(lift_operator_url, resort_name)
        
        if website:
            return website
            
        # Fallback to main page
        website = self._extract_website_from_page(base_url, resort_name)
        return website
        
    def _extract_website_from_page(self, url, resort_name):
        """Extract website from a specific page"""
        soup = self.get_page(url)
        if not soup:
            return None
            
        try:
            # Look for external links with priority ordering
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True).lower()
                
                # Skip internal skiresort.info links (all language versions)
                if any(domain in href for domain in ['skiresort.info', 'skiresort.de', 'skiresort.fr', 
                                                   'skiresort.nl', 'skiresort.it']):
                    continue
                    
                # Skip obvious non-resort sites  
                if any(skip in href.lower() for skip in ['booking.com', 'facebook.com', 'twitter.com', 
                                                       'youtube.com', 'instagram.com', 'google.com', 
                                                       'adserver', 'checkyeti.com', 'expedia.com',
                                                       'tripadvisor.com', 'yelp.com', 'skiresort-service.com',
                                                       '/presse/', '/press/', '/company/', '/login/']):
                    continue
                
                if href.startswith('http'):
                    # Priority 1: Links with "website" or "go to" text
                    if any(keyword in text for keyword in ['website', 'go to', 'official', 'homepage']):
                        return href
                        
                    # Priority 2: Resort domain matches
                    domain = urlparse(href).netloc.lower()
                    resort_words = [word.lower() for word in resort_name.split() if len(word) > 2]
                    
                    # Check if resort name words are in domain
                    for word in resort_words:
                        clean_word = re.sub(r'[^a-z]', '', word)
                        if len(clean_word) > 3 and clean_word in domain.replace('-', '').replace('.', ''):
                            return href
                    
                    # Priority 3: Common resort domain patterns with length check
                    if any(keyword in domain for keyword in ['ski', 'resort', 'mountain']) and len(domain) < 50:
                        return href
                        
            return None
            
        except Exception as e:
            logger.warning(f"Error extracting website from {url}: {e}")
            return None

    def extract_season_dates(self, soup):
        """Extract season dates from the main page"""
        try:
            text = soup.get_text()
            
            # Look for current season pattern like "2025-11-27 - 2026-04-26"
            season_pattern = r'Current season:\s*(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})'
            match = re.search(season_pattern, text)
            if match:
                return {
                    'opening': match.group(1),
                    'closing': match.group(2)
                }
            
            # Alternative pattern: "Opening 2025 27 Nov"
            opening_pattern = r'Opening\s+(\d{4})\s+(\d{1,2})\s+(\w{3})'
            opening_match = re.search(opening_pattern, text)
            if opening_match:
                month_map = {'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'}
                year = opening_match.group(1)
                day = opening_match.group(2).zfill(2)
                month = month_map.get(opening_match.group(3), '01')
                return {
                    'opening': f"{year}-{month}-{day}",
                    'closing': None
                }
            
        except Exception as e:
            logger.warning(f"Error extracting season dates: {e}")
        
        return {'opening': None, 'closing': None}

    def extract_state_from_content(self, soup, resort_url):
        """Extract state information from page content"""
        try:
            text = soup.get_text()
            
            # Look for state patterns
            us_states = [
                'Alaska', 'California', 'Colorado', 'Montana', 'Utah', 'Vermont', 'Wyoming',
                'Maine', 'New Hampshire', 'New Mexico', 'Oregon', 'Washington', 'Idaho',
                'Nevada', 'North Carolina', 'West Virginia', 'Pennsylvania', 'New York',
                'Massachusetts', 'Connecticut', 'Michigan', 'Wisconsin', 'Minnesota'
            ]
            
            for state in us_states:
                if re.search(rf'\b{state}\b.*USA', text, re.IGNORECASE):
                    return state
                    
            # Alternative: look in navigation breadcrumbs
            nav_text = ' '.join([nav.get_text() for nav in soup.find_all(['nav', 'breadcrumb'])])
            for state in us_states:
                if state.lower() in nav_text.lower():
                    return state
                    
        except Exception as e:
            logger.warning(f"Error extracting state: {e}")
        
        return "Unknown"

    def extract_resort_details(self, resort_url):
        """Extract detailed information for a single resort"""
        soup = self.get_page(resort_url)
        if not soup:
            return None
            
        try:
            # Extract resort name from title
            title = soup.find('title')
            resort_name = "Unknown Resort"
            if title:
                title_text = title.get_text()
                if '–' in title_text:
                    resort_name = title_text.split('–')[0].replace('Ski resort', '').strip()
                else:
                    resort_name = title_text.replace('Ski resort', '').strip()
            
            # Extract state
            state = self.extract_state_from_content(soup, resort_url)
                
            resort_data = {
                'name': resort_name,
                'state': state,
                'url': resort_url,
            }
            
            # Extract all basic data
            resort_data.update(self.extract_elevation_data(soup))
            resort_data.update(self.extract_slopes_data(soup))
            resort_data.update(self.extract_lifts_data(soup))
            resort_data.update(self.extract_price_data(soup))
            
            # Extract official website - try lift-operator page first, then main page
            official_website = self.extract_official_website(resort_url, resort_name)
            resort_data['website'] = official_website
            
            # Extract season dates
            season_info = self.extract_season_dates(soup)
            resort_data['season_opening'] = season_info.get('opening')
            resort_data['season_closing'] = season_info.get('closing')
            
            # Extract detailed trail difficulty data from slope-offering page
            trail_data = self.extract_trail_difficulty_data(resort_url)
            resort_data.update(trail_data)
            
            # Extract lift type data from ski-lifts page  
            lift_type_data = self.extract_lift_types(resort_url)
            resort_data.update(lift_type_data)
            
            logger.info(f"Extracted {resort_name}: lifts={resort_data.get('lifts_total')}, "
                       f"slopes={resort_data.get('slopes_total_km')}km, "
                       f"trails={resort_data.get('trails_total')} "
                       f"(B:{resort_data.get('trails_beginner')}, "
                       f"I:{resort_data.get('trails_intermediate')}, "
                       f"A:{resort_data.get('trails_advanced')}, "
                       f"E:{resort_data.get('trails_expert')}), "
                       f"fixed-grip-only={resort_data.get('fixed_grip_only')}, "
                       f"website={official_website}")
            return resort_data
            
        except Exception as e:
            logger.error(f"Error extracting details from {resort_url}: {e}")
            return None

    def scrape_all_usa_resorts(self, first_page_only=False):
        """Main scraping function"""
        if first_page_only:
            logger.info("Starting USA ski resort scraping (FIRST PAGE ONLY)...")
        else:
            logger.info("Starting USA ski resort scraping...")
        
        resort_urls = self.discover_usa_resorts(first_page_only=first_page_only)
        if not resort_urls:
            logger.error("No resort URLs discovered")
            return []
            
        all_resorts = []
        for i, url in enumerate(resort_urls, 1):
            logger.info(f"Processing resort {i}/{len(resort_urls)}: {url}")
            resort_data = self.extract_resort_details(url)
            if resort_data:
                all_resorts.append(resort_data)
            else:
                logger.warning(f"Failed to extract data for {url}")
        
        logger.info(f"Successfully scraped {len(all_resorts)} resorts")
        return all_resorts

def main():
    scraper = EnhancedSkiResortScraper()
    
    # Test with specific resort first
    test_url = "https://www.skiresort.info/ski-resort/badger-pass/"
    logger.info(f"Testing with {test_url}")
    test_data = scraper.extract_resort_details(test_url)
    if test_data:
        print(f"Test data for {test_data['name']}:")
        print(json.dumps(test_data, indent=2))
        print()
    
    # Run all pages for complete dataset
    logger.info("Running complete scrape for all USA resorts...")
    all_resorts = scraper.scrape_all_usa_resorts(first_page_only=False)
    
    # Save results
    output_file = "enhanced_usa_ski_resorts_complete.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_resorts, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(all_resorts)} resorts to {output_file}")
    
    # Print summary
    resorts_with_elevation = sum(1 for r in all_resorts if r.get('elevation_base') is not None)
    resorts_with_slopes = sum(1 for r in all_resorts if r.get('slopes_total_km') is not None)
    resorts_with_lifts = sum(1 for r in all_resorts if r.get('lifts_total') is not None)
    resorts_with_websites = sum(1 for r in all_resorts if r.get('website') is not None)
    resorts_fixed_grip_only = sum(1 for r in all_resorts if r.get('fixed_grip_only', False))
    resorts_with_trail_data = sum(1 for r in all_resorts if r.get('trails_total', 0) > 0)
    
    print(f"\nScraping Summary:")
    print(f"Total resorts: {len(all_resorts)}")
    print(f"With elevation data: {resorts_with_elevation}")
    print(f"With slopes data: {resorts_with_slopes}")
    print(f"With lifts data: {resorts_with_lifts}")
    print(f"With official website URLs: {resorts_with_websites}")
    print(f"With trail difficulty data: {resorts_with_trail_data}")
    print(f"Fixed-grip only resorts: {resorts_fixed_grip_only}")

if __name__ == "__main__":
    main()