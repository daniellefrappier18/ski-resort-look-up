# USA Ski Resort Scraper# USA Ski Resort Scraper



This directory contains the web scraper used to build the comprehensive USA ski resort dataset for the React application.This directory contains the web scraper used to build the comprehensive USA ski resort dataset for the React application.



## 🎿 Overview## 🎿 Overview



This scraper extracts detailed information from skiresort.info for all USA ski resorts, providing elevation, lifts, trails, pricing, and website data with accurate fixed-grip lift classifications.This scraper extracts detailed information from skiresort.info for all USA ski resorts, providing elevation, lifts, trails, pricing, and website data with accurate fixed-grip lift classifications.



## 📁 Files## 📁 Files



### Current Files### Current Files



- **`enhanced_usa_scraper.py`** - Main scraper with corrected discovery logic and comprehensive data extraction- **`enhanced_usa_scraper.py`** - Main scraper with corrected discovery logic and comprehensive data extraction

- **`json_to_typescript_enhanced.py`** - Converts JSON data to TypeScript format for React app- **`json_to_typescript_enhanced.py`** - Converts JSON data to TypeScript format for React app

- **`requirements.txt`** - Python dependencies- **`requirements.txt`** - Python dependencies

- **`enhanced_usa_ski_resorts_complete_corrected.json`** - Final dataset (535 USA resorts)- **`enhanced_usa_ski_resorts_complete_corrected.json`** - Final dataset (535 USA resorts)



## ✅ Completed Dataset## ✅ Completed Dataset



The scraper has successfully processed **535 USA ski resorts** with:## 🚀 Usage

- **100% elevation data** (base, summit, vertical drop)

- **94.6% lifts data** (total lifts with accurate fixed-grip classifications)### Re-run Scraper (Optional)

- **100% official websites**

- **365 fixed-grip only resorts** correctly identifiedIf you need to update the dataset:



## 🚀 Usage```bash

pip3 install -r requirements.txt

### Re-run Scraper (Optional)python3 enhanced_usa_scraper.py

```

If you need to update the dataset:

### Convert to TypeScript

```bash

pip3 install -r requirements.txt```bash

python3 enhanced_usa_scraper.pypython3 json_to_typescript_enhanced.py

``````



### Convert to TypeScript## 🎯 Data Quality



```bash- **535 total resorts** discovered using corrected main-page-only logic

python3 json_to_typescript_enhanced.py- **Accurate classifications** with improved fixed-grip detection  

```- **Complete data extraction** from 4 pages per resort (main, lifts, slopes, contact)

python3 integrate_data.py

## 🎯 Data Quality```



- **535 total resorts** discovered using corrected main-page-only logicThis converts the scraped data to the React application format.

- **Accurate classifications** with improved fixed-grip detection  

- **Complete data extraction** from 4 pages per resort (main, lifts, slopes, contact)### 4. Build Comprehensive Dataset (Optional)



---```bash

python3 dataset_builder.py

*Dataset is complete and integrated into the React application.*```

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