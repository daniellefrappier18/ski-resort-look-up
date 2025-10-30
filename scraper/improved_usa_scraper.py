"""
Improved USA Ski Resort Scraper with Individual Resort Page Fetching

This script scrapes USA ski resort URLs first, then fetches detailed
data from each individual resort page for better accuracy.
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Set
from dataclasses import dataclass, asdict
from urllib.parse import urljoin

@dataclass
class DetailedUSASkiResort:
    """Detailed data structure for USA ski resort"""
    name: str
    state: str = None
    city: str = None
    rating: float = None
    elevation_base: int = None
    elevation_top: int = None
    vertical_drop: int = None
    slopes_total_km: float = None
    slopes_easy_km: float = None
    slopes_intermediate_km: float = None
    slopes_difficult_km: float = None
    lifts_total: int = None
    day_pass_price: str = None
    season_start: str = None
    season_end: str = None
    website: str = None
    description: str = None
    skiable_acres: int = None
    resort_url: str = None

class ImprovedUSASkiResortScraper:
    """Improved scraper with individual resort page fetching"""
    
    BASE_URL = "https://www.skiresort.info"
    USA_RESORTS_URL = "https://www.skiresort.info/ski-resorts/usa/"
    
    def __init__(self, delay_between_requests: float = 2.0):
        self.delay = delay_between_requests
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
    def discover_all_resort_urls(self, max_pages: int = None) -> Set[str]:
        """Discover all unique resort URLs from the USA listing pages"""
        print("🔍 Discovering all USA ski resort URLs...")
        
        resort_urls = set()
        page = 1
        
        while True:
            if max_pages and page > max_pages:
                print(f"⚠️ Reached max pages limit ({max_pages})")
                break
                
            page_url = f"{self.USA_RESORTS_URL}page/{page}/" if page > 1 else self.USA_RESORTS_URL
            
            print(f"📄 Scanning page {page}: {page_url}")
            
            try:
                response = self.session.get(page_url)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find resort links on this page
                page_resort_urls = self.extract_resort_urls_from_page(soup)
                
                if not page_resort_urls:
                    print(f"📋 No more resorts found on page {page}. Stopping.")
                    break
                
                resort_urls.update(page_resort_urls)
                print(f"✅ Found {len(page_resort_urls)} new resort URLs on page {page}")
                print(f"📊 Total unique URLs so far: {len(resort_urls)}")
                
                # Check if there's a next page indicator
                if not self.has_next_page(soup, page):
                    print(f"📋 No next page indicator found. Stopping at page {page}")
                    break
                
                page += 1
                
                # Be respectful to the server
                print(f"⏳ Waiting {self.delay} seconds...")
                time.sleep(self.delay)
                
            except Exception as e:
                print(f"❌ Error scanning page {page}: {e}")
                break
        
        print(f"🎿 Total unique USA resort URLs discovered: {len(resort_urls)}")
        return resort_urls
    
    def extract_resort_urls_from_page(self, soup: BeautifulSoup) -> Set[str]:
        """Extract resort URLs from a single page"""
        resort_urls = set()
        
        # Look for links to ski resorts - they can be either relative or absolute
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            
            # Check both relative and absolute URL patterns
            is_ski_resort_link = (
                href.startswith('/ski-resort/') or 
                'skiresort.info/ski-resort/' in href
            )
            
            if not is_ski_resort_link:
                continue
            
            # Skip sub-pages (we only want main resort pages)
            if any(subpage in href for subpage in ['/test-report/', '/snow-report/', '/webcams/', '/trail-map/', '/photos/']):
                continue
            
            # Must end with / or be a clean resort name
            if not (href.endswith('/') or re.match(r'.*/ski-resort/[a-zA-Z0-9-]+$', href)):
                continue
            
            # Convert to full URL if it's relative
            if href.startswith('/'):
                full_url = 'https://www.skiresort.info' + href
            else:
                full_url = href
                
            resort_urls.add(full_url)
        
        return resort_urls
    
    def has_next_page(self, soup: BeautifulSoup, current_page: int) -> bool:
        """Check if there's a next page"""
        # Look for next page links
        next_indicators = [
            f'page/{current_page + 1}/',
            '›', '»', 'Next'
        ]
        
        links = soup.find_all('a', href=True)
        for link in links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            if any(indicator in href or indicator in text for indicator in next_indicators):
                return True
        
        return False
    
    def scrape_resort_details(self, resort_url: str) -> Optional[DetailedUSASkiResort]:
        """Scrape detailed information from a single resort page"""
        try:
            print(f"🎿 Scraping: {resort_url}")
            
            response = self.session.get(resort_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract resort name
            name = self.extract_resort_name(soup)
            if not name:
                print(f"❌ Could not extract resort name from {resort_url}")
                return None
            
            # Extract all details
            resort_data = {
                'name': name,
                'state': self.extract_state(soup, resort_url),
                'city': self.extract_city(soup),
                'rating': self.extract_rating(soup),
                'elevation_base': self.extract_elevation_base(soup),
                'elevation_top': self.extract_elevation_top(soup),
                'vertical_drop': self.extract_vertical_drop(soup),
                'slopes_total_km': self.extract_slopes_total(soup),
                'slopes_easy_km': self.extract_slopes_easy(soup),
                'slopes_intermediate_km': self.extract_slopes_intermediate(soup),
                'slopes_difficult_km': self.extract_slopes_difficult(soup),
                'lifts_total': self.extract_lifts_total(soup),
                'day_pass_price': self.extract_day_pass_price(soup),
                'season_start': self.extract_season_start(soup),
                'season_end': self.extract_season_end(soup),
                'website': self.extract_website(soup),
                'description': self.extract_description(soup),
                'skiable_acres': self.extract_skiable_acres(soup),
                'resort_url': resort_url
            }
            
            resort = DetailedUSASkiResort(**resort_data)
            
            print(f"✅ {name} ({resort.state}) - Rating: {resort.rating or 'N/A'}/5")
            return resort
            
        except Exception as e:
            print(f"❌ Error scraping {resort_url}: {e}")
            return None
    
    def extract_resort_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort name"""
        # Try h1 tag first
        h1 = soup.find('h1')
        if h1:
            name = h1.get_text(strip=True)
            # Remove "Ski resort" prefix if present
            name = re.sub(r'^Ski resort\\s+', '', name)
            return name
        return None
    
    def extract_state(self, soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extract state information"""
        text = soup.get_text()
        
        # Common US states that have ski resorts
        us_states = [
            'Alaska', 'California', 'Colorado', 'Connecticut', 'Idaho', 'Illinois',
            'Maine', 'Massachusetts', 'Michigan', 'Minnesota', 'Montana', 'Nevada',
            'New Hampshire', 'New Mexico', 'New York', 'North Carolina', 'Oregon', 
            'Pennsylvania', 'Rhode Island', 'South Dakota', 'Tennessee', 'Utah', 
            'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
        ]
        
        # Look for state in breadcrumb or location info
        for state in us_states:
            if f'/{state.lower()}/' in url or state in text:
                return state
        
        return None
    
    def extract_city(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract city information"""
        # Look for city in location breadcrumb or specific selectors
        breadcrumb_text = soup.get_text()
        
        # Try to extract from common patterns
        city_patterns = [
            r'›\\s*([A-Za-z\\s]+)\\s*›\\s*USA',
            r'City:\\s*([A-Za-z\\s]+)',
            r'Location:\\s*([A-Za-z\\s]+)'
        ]
        
        for pattern in city_patterns:
            match = re.search(pattern, breadcrumb_text)
            if match:
                city = match.group(1).strip()
                if len(city) > 1 and city != 'USA':
                    return city
        
        return None
    
    def extract_rating(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract rating"""
        text = soup.get_text()
        
        rating_patterns = [
            r'(\\d+\\.\\d+)\\s+out of\\s+\\d+\\s+stars?',
            r'Test report\\s+(\\d+\\.\\d+)\\s+out of\\s+\\d+',
            r'Rating:\\s*(\\d+\\.\\d+)',
            r'(\\d+\\.\\d+)\\s*/\\s*5'
        ]
        
        for pattern in rating_patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1))
        
        return None
    
    def extract_elevation_base(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract base elevation in meters"""
        text = soup.get_text()
        
        # Look for elevation patterns
        elevation_patterns = [
            r'(\\d+)\\s*m\\s*[-–]\\s*\\d+\\s*m',  # "800 m - 2000 m"
            r'Base:\\s*(\\d+)\\s*m',
            r'Valley station:\\s*(\\d+)\\s*m'
        ]
        
        for pattern in elevation_patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_elevation_top(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract top elevation in meters"""
        text = soup.get_text()
        
        elevation_patterns = [
            r'\\d+\\s*m\\s*[-–]\\s*(\\d+)\\s*m',  # "800 m - 2000 m"
            r'Top:\\s*(\\d+)\\s*m',
            r'Summit:\\s*(\\d+)\\s*m',
            r'Mountain station:\\s*(\\d+)\\s*m'
        ]
        
        for pattern in elevation_patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_vertical_drop(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract vertical drop"""
        text = soup.get_text()
        
        patterns = [
            r'Difference\\s+(\\d+)\\s*m',
            r'Vertical\\s*drop:\\s*(\\d+)\\s*m',
            r'\\((\\d+)\\s*m\\s*difference\\)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_slopes_total(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract total slopes in km"""
        text = soup.get_text()
        
        patterns = [
            r'Total:\\s*(\\d+(?:\\.\\d+)?)\\s*km',
            r'Slopes:\\s*(\\d+(?:\\.\\d+)?)\\s*km',
            r'Pistes:\\s*(\\d+(?:\\.\\d+)?)\\s*km'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1))
        
        return None
    
    def extract_slopes_easy(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract easy slopes"""
        return self._extract_slope_difficulty(soup, 'easy')
    
    def extract_slopes_intermediate(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract intermediate slopes"""
        return self._extract_slope_difficulty(soup, 'intermediate')
    
    def extract_slopes_difficult(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract difficult slopes"""
        return self._extract_slope_difficulty(soup, 'difficult')
    
    def _extract_slope_difficulty(self, soup: BeautifulSoup, difficulty: str) -> Optional[float]:
        """Helper to extract slope difficulty"""
        text = soup.get_text()
        
        patterns = [
            rf'{difficulty.capitalize()}\\s*(\\d+(?:\\.\\d+)?)\\s*km',
            rf'{difficulty}:\\s*(\\d+(?:\\.\\d+)?)\\s*km'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        return None
    
    def extract_lifts_total(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract total lifts"""
        text = soup.get_text()
        
        patterns = [
            r'(\\d+)\\s+ski lifts?',
            r'Total lifts?:\\s*(\\d+)',
            r'Lifts?:\\s*(\\d+)',
            r'(\\d+)\\s+lifts?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_day_pass_price(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract day pass price"""
        text = soup.get_text()
        
        patterns = [
            r'US\\$\\s*(\\d+(?:[\\.,]\\d{2})?)',
            r'\\$\\s*(\\d+(?:[\\.,]\\d{2})?)',
            r'Day pass:\\s*US\\$\\s*(\\d+(?:[\\.,]\\d{2})?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return f"US${match.group(1)}"
        
        return None
    
    def extract_season_start(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract season start"""
        text = soup.get_text()
        
        patterns = [
            r'Season:\\s*(\\w+\\s+\\d{4})',
            r'Opens?:\\s*(\\w+)',
            r'Opening:\\s*(\\w+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    def extract_season_end(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract season end"""
        text = soup.get_text()
        
        patterns = [
            r'Closes?:\\s*(\\w+)',
            r'Closing:\\s*(\\w+)',
            r'Until:\\s*(\\w+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    def extract_website(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract official website"""
        # Look for external links that might be the official website
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href')
            if (href and href.startswith('http') and 
                'skiresort.info' not in href and
                any(word in href.lower() for word in ['ski', 'resort', 'mountain'])):
                return href
        
        return None
    
    def extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort description"""
        # Look for meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            desc = meta_desc['content'].strip()
            if len(desc) > 20:
                return desc
        
        return None
    
    def extract_skiable_acres(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract skiable acres"""
        text = soup.get_text()
        
        patterns = [
            r'(\\d+(?:,\\d+)?)\\s*acres?',
            r'Skiable area:\\s*(\\d+(?:,\\d+)?)\\s*acres?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                acres_str = match.group(1).replace(',', '')
                return int(acres_str)
        
        return None
    
    def scrape_batch_of_resorts(self, resort_urls: List[str], start_idx: int = 0, batch_size: int = 50) -> List[DetailedUSASkiResort]:
        """Scrape a batch of resorts"""
        print(f"\\n🎿 Scraping batch: resorts {start_idx + 1} to {min(start_idx + batch_size, len(resort_urls))}")
        print("=" * 80)
        
        resorts = []
        
        for i, url in enumerate(resort_urls[start_idx:start_idx + batch_size], start=start_idx + 1):
            print(f"[{i}/{len(resort_urls)}] ", end="")
            
            resort = self.scrape_resort_details(url)
            if resort:
                resorts.append(resort)
            
            # Rate limiting
            if i < len(resort_urls):
                time.sleep(self.delay)
        
        return resorts
    
    def save_results(self, resorts: List[DetailedUSASkiResort], filename: str):
        """Save results to JSON file"""
        resort_dicts = [asdict(resort) for resort in resorts]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(resort_dicts, f, indent=2, ensure_ascii=False)
        
        print(f"\\n📁 Results saved to '{filename}'")
        self.show_summary_stats(resorts)
    
    def show_summary_stats(self, resorts: List[DetailedUSASkiResort]):
        """Show summary statistics"""
        print(f"\\n📊 Dataset Summary:")
        print(f"  📍 Total resorts: {len(resorts)}")
        
        # Count by state
        states = {}
        ratings = []
        prices = []
        
        for resort in resorts:
            if resort.state:
                states[resort.state] = states.get(resort.state, 0) + 1
            if resort.rating:
                ratings.append(resort.rating)
            if resort.day_pass_price and 'US$' in resort.day_pass_price:
                try:
                    price_match = re.search(r'US\\$(\\d+(?:\\.\\d+)?)', resort.day_pass_price)
                    if price_match:
                        prices.append(float(price_match.group(1)))
                except:
                    pass
        
        print(f"  🌍 States covered: {len(states)}")
        print(f"  ⭐ Resorts with ratings: {len(ratings)}")
        if ratings:
            print(f"  📈 Average rating: {sum(ratings)/len(ratings):.1f}/5")
        if prices:
            print(f"  💰 Average day pass: US${sum(prices)/len(prices):.0f}")
        
        # Top states
        if states:
            print(f"  🏔️ Top 5 states:")
            for state, count in sorted(states.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"    • {state}: {count} resorts")

def main():
    """Main function"""
    print("🇺🇸 Comprehensive USA Ski Resort Scraper v2.0")
    print("=" * 60)
    print("Phase 1: Discover all resort URLs")
    print("Phase 2: Scrape detailed data from each resort")
    print("=" * 60)
    
    scraper = ImprovedUSASkiResortScraper(delay_between_requests=2.0)
    
    # Phase 1: Discover all resort URLs (limit for testing)
    print("\\n🔍 Phase 1: Discovering resort URLs...")
    resort_urls = scraper.discover_all_resort_urls(max_pages=15)  # Get all USA pages (~11 pages total)
    
    if not resort_urls:
        print("❌ No resort URLs found")
        return
    
    resort_urls_list = list(resort_urls)
    print(f"\\n🎿 Found {len(resort_urls_list)} unique resort URLs")
    
    # Phase 2: Scrape detailed data (limit for testing)
    print("\\n📊 Phase 2: Scraping detailed resort data...")
    
    all_resorts = []
    batch_size = 100  # Process efficiently
    
    # Process in batches
    for start_idx in range(0, min(len(resort_urls_list), 40), batch_size):  # Limit to 40 resorts for testing
        batch_resorts = scraper.scrape_batch_of_resorts(resort_urls_list, start_idx, batch_size)
        all_resorts.extend(batch_resorts)
        
        print(f"\\n✅ Batch complete. Total resorts so far: {len(all_resorts)}")
    
    # Save results
    if all_resorts:
        scraper.save_results(all_resorts, "detailed_usa_ski_resorts.json")
        print("\\n🎉 Scraping completed successfully!")
    else:
        print("❌ No resort data was collected")
    
    return all_resorts

if __name__ == "__main__":
    results = main()