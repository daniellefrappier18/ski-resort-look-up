"""
Improved Ski Resort Data Scraper for skiresort.info

This script creates a comprehensive ski resort dataset by scraping data
from the skiresort.info website with improved data extraction.
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class SkiResort:
    """Enhanced data structure for a ski resort"""
    name: str
    country: str = None
    region: str = None
    elevation_base: str = None
    elevation_top: str = None
    vertical_drop: str = None
    slopes_total_km: str = None
    slopes_easy_km: str = None
    slopes_intermediate_km: str = None
    slopes_difficult_km: str = None
    ski_routes_km: str = None
    lifts_total: str = None
    rating: float = None
    season_start: str = None
    season_end: str = None
    day_pass_price: str = None
    official_website: str = None
    description: str = None
    nearby_towns: List[str] = None

class ImprovedSkiResortScraper:
    """Enhanced web scraper for skiresort.info"""
    
    BASE_URL = "https://www.skiresort.info"
    
    def __init__(self, delay_between_requests: float = 2.0):
        self.delay = delay_between_requests
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
    def scrape_resort_details(self, resort_url: str) -> Optional[SkiResort]:
        """Scrape detailed information for a single resort"""
        try:
            print(f"Scraping: {resort_url}")
            response = self.session.get(resort_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract resort name from h1 tag
            name = self.extract_resort_name(soup)
            if not name:
                print("❌ Could not extract resort name")
                return None
            
            print(f"✅ Found resort: {name}")
            
            # Extract all data fields
            resort_data = {
                'name': name,
                'country': self.extract_country(soup),
                'region': self.extract_region(soup),
                'elevation_base': self.extract_elevation_base(soup),
                'elevation_top': self.extract_elevation_top(soup),
                'vertical_drop': self.calculate_vertical_drop(soup),
                'slopes_total_km': self.extract_slopes_total(soup),
                'slopes_easy_km': self.extract_slopes_easy(soup),
                'slopes_intermediate_km': self.extract_slopes_intermediate(soup),
                'slopes_difficult_km': self.extract_slopes_difficult(soup),
                'ski_routes_km': self.extract_ski_routes(soup),
                'lifts_total': self.extract_lifts_total(soup),
                'rating': self.extract_rating(soup),
                'season_start': self.extract_season_start(soup),
                'season_end': self.extract_season_end(soup),
                'day_pass_price': self.extract_day_pass_price(soup),
                'official_website': self.extract_official_website(soup),
                'description': self.extract_description(soup),
                'nearby_towns': self.extract_nearby_towns(soup)
            }
            
            return SkiResort(**resort_data)
            
        except Exception as e:
            print(f"❌ Error scraping {resort_url}: {e}")
            return None
    
    def extract_resort_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort name from h1 tag"""
        h1_tag = soup.find('h1')
        if h1_tag:
            name = h1_tag.get_text(strip=True)
            # Remove "Ski resort" prefix if present
            name = re.sub(r'^Ski resort\s+', '', name)
            return name
        return None
    
    def extract_country(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract country from breadcrumb navigation"""
        # Look for country in the breadcrumb or location info
        text = soup.get_text()
        countries = ['Austria', 'Switzerland', 'France', 'Italy', 'Germany', 'USA', 'Canada']
        for country in countries:
            if country in text and f'/{country.lower()}/' in str(soup):
                return country
        return None
    
    def extract_region(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract region information"""
        # Look for region information in breadcrumb or description
        breadcrumb_pattern = r'([A-Za-z\s]+)\s*\([A-Za-z\s]+\)'
        text = soup.get_text()
        match = re.search(breadcrumb_pattern, text)
        if match:
            return match.group(1).strip()
        return None
    
    def extract_elevation_base(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract base elevation from elevation info section"""
        text = soup.get_text()
        # Look for pattern like "800 m - 2000 m"
        elevation_pattern = r'(\d+)\s*m\s*[-–]\s*(\d+)\s*m'
        match = re.search(elevation_pattern, text)
        if match:
            return f"{match.group(1)}m"
        return None
    
    def extract_elevation_top(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract top elevation from elevation info section"""
        text = soup.get_text()
        elevation_pattern = r'(\d+)\s*m\s*[-–]\s*(\d+)\s*m'
        match = re.search(elevation_pattern, text)
        if match:
            return f"{match.group(2)}m"
        return None
    
    def calculate_vertical_drop(self, soup: BeautifulSoup) -> Optional[str]:
        """Calculate vertical drop from elevation data"""
        text = soup.get_text()
        # Look for difference pattern like "(Difference 1200 m)"
        diff_pattern = r'Difference\s+(\d+)\s*m'
        match = re.search(diff_pattern, text)
        if match:
            return f"{match.group(1)}m"
        return None
    
    def extract_slopes_total(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract total slopes in kilometers"""
        text = soup.get_text()
        # Look for pattern like "Total: 188 km"
        total_pattern = r'Total:\s*(\d+(?:\.\d+)?)\s*km'
        match = re.search(total_pattern, text)
        if match:
            return f"{match.group(1)}km"
        return None
    
    def extract_slopes_easy(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract easy slopes"""
        text = soup.get_text()
        easy_pattern = r'Easy\s+(\d+(?:\.\d+)?)\s*km'
        match = re.search(easy_pattern, text)
        if match:
            return f"{match.group(1)}km"
        return None
    
    def extract_slopes_intermediate(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract intermediate slopes"""
        text = soup.get_text()
        intermediate_pattern = r'Intermediate\s+(\d+(?:\.\d+)?)\s*km'
        match = re.search(intermediate_pattern, text)
        if match:
            return f"{match.group(1)}km"
        return None
    
    def extract_slopes_difficult(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract difficult slopes"""
        text = soup.get_text()
        difficult_pattern = r'Difficult\s+(\d+(?:\.\d+)?)\s*km'
        match = re.search(difficult_pattern, text)
        if match:
            return f"{match.group(1)}km"
        return None
    
    def extract_ski_routes(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract ski routes"""
        text = soup.get_text()
        routes_pattern = r'Ski routes\s+(\d+(?:\.\d+)?)\s*km'
        match = re.search(routes_pattern, text)
        if match:
            return f"{match.group(1)}km"
        return None
    
    def extract_lifts_total(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract total number of lifts"""
        text = soup.get_text()
        # Look for patterns like "58 lifts" or "Total: 58"
        lifts_patterns = [
            r'(\d+)\s+lifts',
            r'Total:\s*(\d+)(?:\s+\d+)*(?:\s+lifts)?'
        ]
        
        for pattern in lifts_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        return None
    
    def extract_rating(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract overall rating"""
        # Look for star rating pattern
        rating_patterns = [
            r'(\d+(?:\.\d+)?)\s+out of\s+\d+\s+stars',
            r'Test report\s+(\d+(?:\.\d+)?)\s+out of\s+\d+'
        ]
        
        text = soup.get_text()
        for pattern in rating_patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1))
        return None
    
    def extract_season_start(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract season start date"""
        text = soup.get_text()
        season_pattern = r'(\d{4}-\d{2}-\d{2})\s*-\s*\d{4}-\d{2}-\d{2}'
        match = re.search(season_pattern, text)
        if match:
            return match.group(1)
        
        # Alternative pattern
        alt_pattern = r'early\s+(\w+)'
        match = re.search(alt_pattern, text, re.IGNORECASE)
        if match:
            return f"Early {match.group(1)}"
        return None
    
    def extract_season_end(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract season end date"""
        text = soup.get_text()
        season_pattern = r'\d{4}-\d{2}-\d{2}\s*-\s*(\d{4}-\d{2}-\d{2})'
        match = re.search(season_pattern, text)
        if match:
            return match.group(1)
        
        # Alternative pattern
        alt_pattern = r'mid\s+(\w+)'
        match = re.search(alt_pattern, text, re.IGNORECASE)
        if match:
            return f"Mid {match.group(1)}"
        return None
    
    def extract_day_pass_price(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract day pass price"""
        text = soup.get_text()
        # Look for Euro prices
        price_pattern = r'€\s*(\d+(?:\.\d{2})?)'
        match = re.search(price_pattern, text)
        if match:
            return f"€{match.group(1)}"
        return None
    
    def extract_official_website(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract official website URL"""
        # Look for main link
        main_link = soup.find(string="Main link")
        if main_link:
            parent = main_link.parent
            if parent:
                link = parent.find_next('a')
                if link and link.get('href'):
                    return link['href']
        
        # Alternative: look for official website links
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if (not href.startswith('http://www.skiresort') and 
                not href.startswith('https://www.skiresort') and
                ('ski' in href.lower() or 'resort' in href.lower()) and
                href.startswith('http')):
                return href
        return None
    
    def extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort description"""
        # Look for meta description
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Alternative: look for introductory text
        text_blocks = soup.find_all('p')
        for block in text_blocks:
            text = block.get_text(strip=True)
            if len(text) > 100 and any(word in text.lower() for word in ['ski', 'resort', 'slope']):
                return text[:300] + "..." if len(text) > 300 else text
        return None
    
    def extract_nearby_towns(self, soup: BeautifulSoup) -> List[str]:
        """Extract nearby towns/villages"""
        towns = []
        text = soup.get_text()
        
        # Look for town/village listings
        town_pattern = r'•\s*([A-Za-z\s\-äöüß]+)\s*\([\d\.,]+\s*km\)'
        matches = re.findall(town_pattern, text)
        
        for match in matches[:5]:  # Limit to first 5 towns
            town = match.strip()
            if town and len(town) > 2:
                towns.append(town)
        
        return towns if towns else None

def create_sample_dataset():
    """Create a sample dataset of ski resorts"""
    scraper = ImprovedSkiResortScraper(delay_between_requests=3.0)
    
    # Sample of well-known ski resort URLs for testing
    sample_urls = [
        "https://www.skiresort.info/ski-resort/kitzski-kitzbuehelkirchberg/",
        "https://www.skiresort.info/ski-resort/ischglsamnaun-silvretta-arena/",
        "https://www.skiresort.info/ski-resort/st-moritz-corviglia/",
        "https://www.skiresort.info/ski-resort/zermatt-matterhorn/",
        "https://www.skiresort.info/ski-resort/chamonix-mont-blanc/",
    ]
    
    resorts = []
    
    for i, url in enumerate(sample_urls):
        print(f"\n🎿 Processing resort {i+1}/{len(sample_urls)}")
        print("=" * 60)
        
        resort = scraper.scrape_resort_details(url)
        if resort:
            resorts.append(resort)
            print(f"✅ Successfully scraped: {resort.name}")
        else:
            print(f"❌ Failed to scrape: {url}")
        
        # Be respectful to the server
        if i < len(sample_urls) - 1:
            print(f"⏳ Waiting {scraper.delay} seconds...")
            time.sleep(scraper.delay)
    
    # Save results
    if resorts:
        # Convert to dictionaries for JSON serialization
        resort_dicts = [asdict(resort) for resort in resorts]
        
        with open('enhanced_ski_resorts.json', 'w', encoding='utf-8') as f:
            json.dump(resort_dicts, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 Successfully scraped {len(resorts)} ski resorts!")
        print("📁 Data saved to 'enhanced_ski_resorts.json'")
        
        # Show summary
        print("\n📊 Summary:")
        for resort in resorts:
            print(f"  • {resort.name} ({resort.country}) - {resort.rating}/5 ⭐")
    
    return resorts

if __name__ == "__main__":
    create_sample_dataset()