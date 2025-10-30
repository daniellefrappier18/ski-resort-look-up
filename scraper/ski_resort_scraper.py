"""
Ski Resort Data Scraper for skiresort.info

This module scrapes comprehensive ski resort data from skiresort.info to build
a local dataset for the ski resort lookup application.
"""

import requests
import json
import time
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import re

@dataclass
class SkiResort:
    """Data structure for a ski resort"""
    name: str
    country: str
    region: str
    elevation_base: Optional[str] = None
    elevation_top: Optional[str] = None
    vertical_drop: Optional[str] = None
    skiable_area: Optional[str] = None
    slopes_km: Optional[str] = None
    lifts_total: Optional[str] = None
    snow_reliability: Optional[str] = None
    season_start: Optional[str] = None
    season_end: Optional[str] = None
    difficulty_beginner: Optional[str] = None
    difficulty_intermediate: Optional[str] = None
    difficulty_advanced: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    test_report_url: Optional[str] = None
    image_url: Optional[str] = None

class SkiResortScraper:
    """Web scraper for skiresort.info"""
    
    BASE_URL = "https://www.skiresort.info"
    
    def __init__(self, delay_between_requests: float = 1.0):
        """
        Initialize the scraper
        
        Args:
            delay_between_requests: Delay in seconds between requests (be respectful!)
        """
        self.delay = delay_between_requests
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def get_resort_lists_by_country(self) -> Dict[str, List[str]]:
        """
        Get lists of resort URLs organized by country
        
        Returns:
            Dictionary with country names as keys and lists of resort URLs as values
        """
        print("Fetching resort lists by country...")
        
        # Start with main ski resorts page
        url = f"{self.BASE_URL}/ski-resorts/"
        response = self.session.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        countries = {}
        
        # Find country links (this will need to be adjusted based on actual HTML structure)
        country_links = soup.find_all('a', href=re.compile(r'/ski-resorts/[^/]+/$'))
        
        for link in country_links[:5]:  # Limit to first 5 countries for testing
            country_name = link.text.strip()
            country_url = urljoin(self.BASE_URL, link['href'])
            
            print(f"Processing {country_name}...")
            countries[country_name] = self.get_resorts_for_country(country_url)
            time.sleep(self.delay)
            
        return countries
    
    def get_resorts_for_country(self, country_url: str) -> List[str]:
        """
        Get all resort URLs for a specific country
        
        Args:
            country_url: URL of the country's ski resorts page
            
        Returns:
            List of resort URLs
        """
        response = self.session.get(country_url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        resort_urls = []
        
        # Find resort links (adjust selector based on actual HTML structure)
        resort_links = soup.find_all('a', href=re.compile(r'/ski-resort/[^/]+/$'))
        
        for link in resort_links[:10]:  # Limit to 10 resorts per country for testing
            resort_url = urljoin(self.BASE_URL, link['href'])
            resort_urls.append(resort_url)
            
        return resort_urls
    
    def scrape_resort_details(self, resort_url: str) -> Optional[SkiResort]:
        """
        Scrape detailed information for a single resort
        
        Args:
            resort_url: URL of the resort's detail page
            
        Returns:
            SkiResort object with scraped data, or None if scraping failed
        """
        try:
            print(f"Scraping resort: {resort_url}")
            response = self.session.get(resort_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract resort name from title or h1
            name = self.extract_resort_name(soup)
            if not name:
                return None
                
            # Extract basic information
            resort_data = {
                'name': name,
                'country': self.extract_country(soup),
                'region': self.extract_region(soup),
                'elevation_base': self.extract_elevation_base(soup),
                'elevation_top': self.extract_elevation_top(soup),
                'vertical_drop': self.extract_vertical_drop(soup),
                'slopes_km': self.extract_slopes_km(soup),
                'lifts_total': self.extract_lifts_total(soup),
                'rating': self.extract_rating(soup),
                'description': self.extract_description(soup),
                'website': self.extract_website(soup),
                'test_report_url': resort_url,
            }
            
            return SkiResort(**resort_data)
            
        except Exception as e:
            print(f"Error scraping {resort_url}: {e}")
            return None
    
    def extract_resort_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort name from the page"""
        # Try multiple selectors
        selectors = ['h1', 'title', '.resort-name', '#resort-name']
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                name = element.get_text(strip=True)
                # Clean up title tags
                name = re.sub(r'\s*\|\s*.*$', '', name)
                name = re.sub(r'\s*-\s*.*$', '', name)
                if name and len(name) > 3:
                    return name
        return None
    
    def extract_country(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract country from the page"""
        # Look for breadcrumb or location information
        breadcrumbs = soup.find('nav', {'class': 'breadcrumb'}) or soup.find('ol', {'class': 'breadcrumb'})
        if breadcrumbs:
            links = breadcrumbs.find_all('a')
            for link in links:
                text = link.get_text(strip=True)
                if any(country in text.lower() for country in ['austria', 'switzerland', 'france', 'italy', 'germany', 'usa', 'canada']):
                    return text
        return None
    
    def extract_region(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract region/state information"""
        # Implementation depends on HTML structure
        return None
    
    def extract_elevation_base(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract base elevation"""
        # Look for elevation information in data tables or info boxes
        text = soup.get_text()
        elevation_match = re.search(r'(\d+)\s*m.*base', text, re.IGNORECASE)
        if elevation_match:
            return f"{elevation_match.group(1)}m"
        return None
    
    def extract_elevation_top(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract top elevation"""
        text = soup.get_text()
        elevation_match = re.search(r'(\d+)\s*m.*top', text, re.IGNORECASE)
        if elevation_match:
            return f"{elevation_match.group(1)}m"
        return None
    
    def extract_vertical_drop(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract vertical drop"""
        return None
    
    def extract_slopes_km(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract total slopes in kilometers"""
        text = soup.get_text()
        slopes_match = re.search(r'(\d+(?:\.\d+)?)\s*km.*slope', text, re.IGNORECASE)
        if slopes_match:
            return f"{slopes_match.group(1)}km"
        return None
    
    def extract_lifts_total(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract total number of lifts"""
        text = soup.get_text()
        lifts_match = re.search(r'(\d+)\s*lift', text, re.IGNORECASE)
        if lifts_match:
            return lifts_match.group(1)
        return None
    
    def extract_rating(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract overall rating"""
        # Look for star ratings or numerical ratings
        rating_elements = soup.find_all(string=re.compile(r'\d+(?:\.\d+)?\s*out of\s*\d+\s*stars'))
        if rating_elements:
            match = re.search(r'(\d+(?:\.\d+))', rating_elements[0])
            if match:
                return float(match.group(1))
        return None
    
    def extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract resort description"""
        # Look for meta description or main content
        meta_desc = soup.find('meta', {'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '').strip()
        return None
    
    def extract_website(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract official website URL"""
        # Look for official website links
        website_links = soup.find_all('a', href=re.compile(r'https?://(?!www\.skiresort\.info)'))
        for link in website_links:
            if any(word in link.get_text().lower() for word in ['website', 'official', 'homepage']):
                return link['href']
        return None

def main():
    """Main scraping function"""
    scraper = SkiResortScraper(delay_between_requests=2.0)  # Be respectful with delays
    
    # For testing, let's scrape a few specific resort URLs
    test_urls = [
        "https://www.skiresort.info/ski-resort/kitzski-kitzbuehelkirchberg/",
        "https://www.skiresort.info/ski-resort/ischglsamnaun-silvretta-arena/",
        "https://www.skiresort.info/ski-resort/st-moritz-corviglia/",
    ]
    
    resorts = []
    
    for url in test_urls:
        resort = scraper.scrape_resort_details(url)
        if resort:
            resorts.append(resort)
        time.sleep(scraper.delay)
    
    # Save to JSON file
    with open('scraped_ski_resorts.json', 'w', encoding='utf-8') as f:
        json.dump([asdict(resort) for resort in resorts], f, indent=2, ensure_ascii=False)
    
    print(f"Scraped {len(resorts)} ski resorts successfully!")
    return resorts

if __name__ == "__main__":
    main()