#!/usr/bin/env python3
"""
Update trail map URLs for ski resorts from CA onwards.
Replaces adserver URLs with direct image URLs from skiresort.info
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import logging
import re
from urllib.parse import urlparse, unquote

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TrailMapUpdater:
    def __init__(self, delay=1.0):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.delay = delay
        self.states_from_ca = [
            'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
            'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
            'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
            'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
            'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
            'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
            'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
            'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
            'West Virginia', 'Wisconsin', 'Wyoming'
        ]

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

    def extract_resort_name_from_url(self, adserver_url):
        """Extract the resort name from an adserver URL"""
        # Extract the loc parameter which contains the encoded URL
        match = re.search(r'loc=([^&]+)', adserver_url)
        if match:
            encoded_url = unquote(match.group(1))
            # Extract the resort name from the URL
            # Format: https://www.skiresort.info/ski-resort/{resort-name}/trail-map/
            # or: https://www.skiresort.info/ski-resort/{resort-name}/
            match = re.search(r'/ski-resort/([^/]+)(?:/trail-map/|/)', encoded_url)
            if match:
                return match.group(1)
        return None

    def get_trail_map_url(self, resort_name):
        """Get the trail map URL for a resort by scraping the trail map page"""
        # Construct the trail map page URL
        trail_map_page_url = f"https://www.skiresort.info/ski-resort/{resort_name}/trail-map/"
        
        soup = self.get_page(trail_map_page_url)
        if not soup:
            logger.warning(f"Could not fetch trail map page for {resort_name}")
            return None
        
        try:
            # Look for the element with class "image mobile-trailmap-image"
            image_element = soup.find(class_="image mobile-trailmap-image")
            if image_element:
                # Find the <a> tag within this element
                a_tag = image_element.find('a', href=True)
                if a_tag:
                    href = a_tag.get('href')
                    if href:
                        # Make sure it's a full URL
                        if href.startswith('http'):
                            return href
                        elif href.startswith('/'):
                            return f"https://www.skiresort.info{href}"
                        else:
                            return f"https://www.skiresort.info/{href}"
            
            logger.warning(f"Could not find mobile-trailmap-image element for {resort_name}")
            return None
            
        except Exception as e:
            logger.error(f"Error extracting trail map URL for {resort_name}: {e}")
            return None

    def should_process_state(self, state):
        """Check if state should be processed (CA onwards)"""
        return state in self.states_from_ca

    def is_adserver_url(self, url):
        """Check if URL is an adserver URL that needs to be replaced"""
        if not url or not isinstance(url, str):
            return False
        return 'adserver.skiresort-service.com' in url

    def update_trail_maps(self, json_file_path):
        """Update trail map URLs in the JSON file"""
        logger.info(f"Loading JSON file: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            resorts = json.load(f)
        
        logger.info(f"Loaded {len(resorts)} resorts")
        
        updated_count = 0
        skipped_count = 0
        error_count = 0
        
        for i, resort in enumerate(resorts):
            state = resort.get('state')
            trail_map_url = resort.get('trail_map_url')
            resort_name = resort.get('name')
            
            # Skip if not a state from CA onwards
            if not self.should_process_state(state):
                continue
            
            # Skip if trail_map_url is null
            if trail_map_url is None:
                continue
            
            # Skip if not an adserver URL
            if not self.is_adserver_url(trail_map_url):
                continue
            
            logger.info(f"\n[{i+1}/{len(resorts)}] Processing: {resort_name} ({state})")
            logger.info(f"Current URL: {trail_map_url}")
            
            # Extract resort name from the adserver URL
            resort_slug = self.extract_resort_name_from_url(trail_map_url)
            if not resort_slug:
                logger.warning(f"Could not extract resort name from URL for {resort_name}")
                error_count += 1
                continue
            
            logger.info(f"Extracted resort slug: {resort_slug}")
            
            # Get the new trail map URL
            new_url = self.get_trail_map_url(resort_slug)
            
            if new_url:
                resort['trail_map_url'] = new_url
                updated_count += 1
                logger.info(f"✓ Updated to: {new_url}")
            else:
                logger.warning(f"✗ Could not find new trail map URL")
                error_count += 1
                skipped_count += 1
            
            # Be polite to the server
            time.sleep(self.delay)
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Summary:")
        logger.info(f"  Updated: {updated_count}")
        logger.info(f"  Errors: {error_count}")
        logger.info(f"{'='*60}")
        
        # Save the updated JSON
        logger.info(f"\nSaving updated JSON to: {json_file_path}")
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(resorts, f, indent=2, ensure_ascii=False)
        
        logger.info("Done!")

if __name__ == "__main__":
    import sys
    
    json_file = "../src/data/usa-ski-resorts.json"
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    
    updater = TrailMapUpdater(delay=1.0)
    updater.update_trail_maps(json_file)

