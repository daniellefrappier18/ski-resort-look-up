#!/usr/bin/env python3
"""
Quick test script to test the ski resort scraper on a single page
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ski_resort_scraper import SkiResortScraper
import json

def test_single_resort():
    """Test scraping a single resort"""
    scraper = SkiResortScraper(delay_between_requests=1.0)
    
    # Test with a well-known resort
    test_url = "https://www.skiresort.info/ski-resort/kitzski-kitzbuehelkirchberg/"
    
    print(f"Testing scraper on: {test_url}")
    print("-" * 60)
    
    resort = scraper.scrape_resort_details(test_url)
    
    if resort:
        print("✅ Successfully scraped resort data:")
        print(json.dumps(resort.__dict__, indent=2, ensure_ascii=False))
        
        # Save test result
        with open('test_result.json', 'w', encoding='utf-8') as f:
            json.dump(resort.__dict__, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Test result saved to 'test_result.json'")
        return True
    else:
        print("❌ Failed to scrape resort data")
        return False

if __name__ == "__main__":
    success = test_single_resort()
    exit(0 if success else 1)