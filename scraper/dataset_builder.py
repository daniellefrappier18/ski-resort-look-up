"""
Full Dataset Builder for Ski Resorts

This script builds a comprehensive ski resort dataset by discovering
resort URLs from category pages and then scraping detailed data.
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from typing import List, Set, Dict
from enhanced_scraper import ImprovedSkiResortScraper, SkiResort
from dataclasses import asdict

class SkiResortDatasetBuilder:
    """Build comprehensive ski resort dataset"""
    
    def __init__(self):
        self.scraper = ImprovedSkiResortScraper(delay_between_requests=2.0)
        self.discovered_urls: Set[str] = set()
        self.scraped_resorts: List[SkiResort] = []
        
    def discover_resort_urls_from_country(self, country: str) -> List[str]:
        """Discover resort URLs from a country page"""
        country_urls = {
            'austria': 'https://www.skiresort.info/ski-resorts/austria/',
            'switzerland': 'https://www.skiresort.info/ski-resorts/switzerland/',
            'france': 'https://www.skiresort.info/ski-resorts/france/',
            'italy': 'https://www.skiresort.info/ski-resorts/italy/',
            'usa': 'https://www.skiresort.info/ski-resorts/usa/',
            'canada': 'https://www.skiresort.info/ski-resorts/canada/',
            'germany': 'https://www.skiresort.info/ski-resorts/germany/'
        }
        
        if country not in country_urls:
            print(f"❌ Country '{country}' not supported")
            return []
        
        url = country_urls[country]
        
        try:
            print(f"🔍 Discovering resorts in {country.title()}...")
            response = self.scraper.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            resort_urls = []
            # Look for resort links in the page
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link.get('href', '')
                if '/ski-resort/' in href and href.startswith('/ski-resort/'):
                    full_url = f"https://www.skiresort.info{href}"
                    resort_urls.append(full_url)
                    self.discovered_urls.add(full_url)
            
            print(f"✅ Discovered {len(resort_urls)} resorts in {country.title()}")
            return list(set(resort_urls))  # Remove duplicates
            
        except Exception as e:
            print(f"❌ Error discovering resorts in {country}: {e}")
            return []
    
    def discover_top_rated_resorts(self, limit: int = 50) -> List[str]:
        """Discover top-rated resorts from the main rankings"""
        try:
            print(f"🔍 Discovering top {limit} rated resorts...")
            
            # Try the rankings page
            rankings_urls = [
                'https://www.skiresort.info/best-ski-resorts/',
                'https://www.skiresort.info/best-ski-resorts/europe/',
                'https://www.skiresort.info/ski-resorts/'
            ]
            
            resort_urls = []
            
            for ranking_url in rankings_urls:
                try:
                    response = self.scraper.session.get(ranking_url)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    links = soup.find_all('a', href=True)
                    
                    for link in links:
                        href = link.get('href', '')
                        if '/ski-resort/' in href:
                            if href.startswith('/'):
                                full_url = f"https://www.skiresort.info{href}"
                            else:
                                full_url = href
                            
                            if full_url not in self.discovered_urls:
                                resort_urls.append(full_url)
                                self.discovered_urls.add(full_url)
                        
                        if len(resort_urls) >= limit:
                            break
                    
                    if len(resort_urls) >= limit:
                        break
                        
                except Exception as e:
                    print(f"Warning: Could not access {ranking_url}: {e}")
                    continue
            
            print(f"✅ Discovered {len(resort_urls)} top-rated resorts")
            return resort_urls[:limit]
            
        except Exception as e:
            print(f"❌ Error discovering top resorts: {e}")
            return []
    
    def build_dataset(self, 
                     countries: List[str] = None, 
                     top_rated_count: int = 20,
                     max_per_country: int = 10) -> List[SkiResort]:
        """Build comprehensive dataset"""
        
        print("🎿 Starting Ski Resort Dataset Builder")
        print("=" * 60)
        
        all_urls = []
        
        # Get top-rated resorts
        if top_rated_count > 0:
            top_urls = self.discover_top_rated_resorts(top_rated_count)
            all_urls.extend(top_urls)
        
        # Get resorts by country
        if countries:
            for country in countries:
                country_urls = self.discover_resort_urls_from_country(country)
                # Limit per country to avoid overwhelming
                all_urls.extend(country_urls[:max_per_country])
                time.sleep(1)  # Be respectful between countries
        
        # Remove duplicates while preserving order
        unique_urls = []
        seen = set()
        for url in all_urls:
            if url not in seen:
                unique_urls.append(url)
                seen.add(url)
        
        print(f"\n📊 Total unique resorts to scrape: {len(unique_urls)}")
        
        if not unique_urls:
            print("❌ No resort URLs discovered")
            return []
        
        # Scrape resort data
        print("\n🎿 Starting resort data scraping...")
        print("=" * 60)
        
        successful_count = 0
        failed_count = 0
        
        for i, url in enumerate(unique_urls):
            print(f"\n🎿 Resort {i+1}/{len(unique_urls)}")
            print(f"🔗 {url}")
            
            resort = self.scraper.scrape_resort_details(url)
            if resort:
                self.scraped_resorts.append(resort)
                successful_count += 1
                print(f"✅ Success: {resort.name} ({resort.country}) - {resort.rating}/5 ⭐")
            else:
                failed_count += 1
                print(f"❌ Failed to scrape resort")
            
            # Progress update every 5 resorts
            if (i + 1) % 5 == 0:
                print(f"\n📊 Progress: {successful_count} successful, {failed_count} failed")
            
            # Be respectful to the server
            if i < len(unique_urls) - 1:
                print(f"⏳ Waiting {self.scraper.delay} seconds...")
                time.sleep(self.scraper.delay)
        
        print(f"\n🎉 Dataset building complete!")
        print(f"📊 Final stats: {successful_count} successful, {failed_count} failed")
        
        return self.scraped_resorts
    
    def save_dataset(self, filename: str = "comprehensive_ski_resorts.json"):
        """Save the dataset to JSON file"""
        if not self.scraped_resorts:
            print("❌ No resorts to save")
            return
        
        # Convert to dictionaries for JSON serialization
        resort_dicts = [asdict(resort) for resort in self.scraped_resorts]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(resort_dicts, f, indent=2, ensure_ascii=False)
        
        print(f"📁 Dataset saved to '{filename}'")
        
        # Show summary statistics
        countries = {}
        ratings = []
        
        for resort in self.scraped_resorts:
            if resort.country:
                countries[resort.country] = countries.get(resort.country, 0) + 1
            if resort.rating:
                ratings.append(resort.rating)
        
        print(f"\n📈 Dataset Summary:")
        print(f"  📊 Total resorts: {len(self.scraped_resorts)}")
        print(f"  🌍 Countries: {len(countries)}")
        print(f"  ⭐ Average rating: {sum(ratings)/len(ratings):.1f}" if ratings else "  ⭐ No ratings available")
        print(f"  🏆 Top countries:")
        for country, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"    • {country}: {count} resorts")

def main():
    """Main function to build ski resort dataset"""
    builder = SkiResortDatasetBuilder()
    
    # Configuration - adjust as needed
    config = {
        'countries': ['austria', 'switzerland', 'france'],  # Focus on Alpine countries
        'top_rated_count': 15,  # Get top 15 rated resorts globally
        'max_per_country': 8    # Max 8 resorts per country
    }
    
    print("🎿 Ski Resort Dataset Builder")
    print("=" * 60)
    print(f"Configuration:")
    print(f"  🌍 Countries: {', '.join(config['countries'])}")
    print(f"  🏆 Top rated: {config['top_rated_count']}")
    print(f"  📊 Max per country: {config['max_per_country']}")
    print(f"  ⏱️ Estimated time: ~{(config['top_rated_count'] + len(config['countries']) * config['max_per_country']) * 2 / 60:.0f} minutes")
    
    input("\nPress Enter to start building the dataset...")
    
    # Build the dataset
    resorts = builder.build_dataset(**config)
    
    if resorts:
        # Save the results
        builder.save_dataset()
        
        print("\n🎉 Dataset successfully created!")
        print("📁 Check 'comprehensive_ski_resorts.json' for the complete data")
        
        return True
    else:
        print("❌ Failed to create dataset")
        return False

if __name__ == "__main__":
    main()