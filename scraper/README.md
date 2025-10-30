# Ski Resort Web Scraper

This directory contains a comprehensive web scraping solution for building a ski resort dataset from skiresort.info.

## 🎿 Overview

Since free ski resort APIs with comprehensive data are not readily available, this scraper extracts detailed information from skiresort.info, which contains data for over 6,000 ski resorts worldwide.

## 📁 Files

### Core Scripts

- **`enhanced_scraper.py`** - Main scraper with detailed data extraction
- **`dataset_builder.py`** - Builds comprehensive datasets from multiple sources
- **`integrate_data.py`** - Converts scraped data to React application format
- **`test_scraper.py`** - Simple test script for validating single resorts

### Data Files

- **`enhanced_ski_resorts.json`** - Sample scraped data (3 resorts)
- **`requirements.txt`** - Python dependencies

### Generated Files

- **`../src/data/scraped-ski-resorts.ts`** - TypeScript data for React app
- **`comprehensive_ski_resorts.json`** - Full dataset (when built)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 2. Run Sample Scraper

```bash
python3 enhanced_scraper.py
```

This will scrape 5 famous ski resorts and create `enhanced_ski_resorts.json`.

### 3. Integrate with React App

```bash
python3 integrate_data.py
```

This converts the scraped data to the React application format.

### 4. Build Comprehensive Dataset (Optional)

```bash
python3 dataset_builder.py
```

This will build a larger dataset by discovering resorts from country pages.

## 📊 Data Structure

The scraper extracts the following information for each resort:

### Basic Information
- **Name** - Resort name (e.g., "KitzSki – Kitzbühel/Kirchberg")
- **Country** - Location country (e.g., "Austria")
- **Region** - Local region/area

### Technical Data
- **Elevation** - Base, top, and vertical drop (in meters)
- **Slopes** - Total km, broken down by difficulty
- **Lifts** - Total number of lifts
- **Season** - Start and end dates

### Quality Metrics
- **Rating** - Overall rating (out of 5.0)
- **Price** - Day pass price in local currency

### Additional Info
- **Website** - Official resort website
- **Description** - Resort description
- **Nearby Towns** - List of nearby locations

## 🔧 Configuration

### Scraper Settings

```python
# In enhanced_scraper.py
scraper = ImprovedSkiResortScraper(
    delay_between_requests=2.0  # Be respectful to the server
)
```

### Dataset Builder Settings

```python
# In dataset_builder.py
config = {
    'countries': ['austria', 'switzerland', 'france'],
    'top_rated_count': 15,
    'max_per_country': 8
}
```

## 📈 Sample Results

From our test scraping:

### KitzSki – Kitzbühel/Kirchberg
- **Country:** Austria
- **Rating:** 4.9/5 ⭐
- **Slopes:** 188km total
- **Elevation:** 800m - 2000m (1200m drop)
- **Lifts:** 58
- **Price:** €79.50

### Ischgl/Samnaun – Silvretta Arena
- **Country:** Austria  
- **Rating:** 4.8/5 ⭐
- **Slopes:** 239km total
- **Elevation:** 1360m - 2872m (1512m drop)
- **Lifts:** 46
- **Price:** €79

### St. Moritz – Corviglia
- **Country:** Switzerland
- **Rating:** 4.7/5 ⭐
- **Slopes:** Multiple areas
- **Elevation:** 1772m - 3057m (1285m drop)

## 🔍 How It Works

### 1. Data Discovery
- Scans country pages on skiresort.info
- Discovers resort URLs from rankings and listings
- Builds a comprehensive list of resorts to scrape

### 2. Data Extraction
- Uses BeautifulSoup to parse HTML content
- Extracts structured data using regex patterns
- Handles various data formats and edge cases

### 3. Data Processing
- Cleans and normalizes extracted data
- Converts units (meters to feet for US compatibility)
- Maps to React application data structure

### 4. Integration
- Generates TypeScript files for React
- Updates API service with comprehensive data
- Maintains compatibility with existing code

## ⚠️ Best Practices

### Rate Limiting
- Default 2-3 second delays between requests
- Respectful to the target server
- Configurable delay settings

### Error Handling
- Robust error handling for network issues
- Graceful fallbacks for missing data
- Detailed logging for debugging

### Data Quality
- Validates extracted data
- Provides fallback values for missing fields
- Maintains data consistency

## 🎯 Integration with React App

The scraped data is automatically converted to match the existing React application's `SkiResort` interface:

```typescript
interface SkiResort {
  id: string;
  name: string;
  location: { state: string; city: string; coordinates?: {...} };
  elevation: { base: number; summit: number; vertical: number };
  lifts: { total: number; chairlifts: number; surfaceLifts: number };
  trails: { total: number; beginner: number; intermediate: number; advanced: number };
  skiableAcres: number;
  snowmaking: { percentage: number; acres?: number };
  seasonDates?: { opening?: string; closing?: string };
  website?: string;
  description?: string;
  amenities?: string[];
  liftTicketPrice?: { adult: number; child?: number; senior?: number };
}
```

## 🚧 Future Enhancements

- [ ] Add more countries and regions
- [ ] Include weather data integration
- [ ] Add lift status and conditions
- [ ] Implement incremental updates
- [ ] Add data validation and cleaning
- [ ] Create automated scheduling
- [ ] Add geographic clustering

## 📝 Notes

- Data is scraped ethically with rate limiting
- Respects robots.txt and server resources
- For educational and personal use
- Always verify data accuracy for production use

## 🆘 Troubleshooting

### Common Issues

1. **No data extracted**
   - Check internet connection
   - Verify skiresort.info is accessible
   - Check for website structure changes

2. **Rate limiting errors**
   - Increase delay between requests
   - Check if IP is temporarily blocked

3. **Integration errors**
   - Ensure React app structure matches expectations
   - Check TypeScript interface compatibility
   - Verify file paths are correct

### Getting Help

If you encounter issues:
1. Check the error logs in terminal output
2. Verify the sample test script works: `python3 test_scraper.py`
3. Ensure all dependencies are installed correctly
4. Check that the target website structure hasn't changed

---

*Happy skiing! 🎿⛷️*