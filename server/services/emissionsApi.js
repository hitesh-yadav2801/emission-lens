/**
 * Climate TRACE API Service
 * Fetches and processes global emissions data from Climate TRACE
 * 
 * API Documentation: https://api.climatetrace.org/v6/swagger/index.html
 */

const CLIMATE_TRACE_BASE = 'https://api.climatetrace.org/v6';
const CACHE_DURATION = 1000 * 60 * 30;

const cache = {
  countries: null,
  sectors: null,
  continents: null,
  emissions: {},
  topEmitters: {},
  industryBreakdown: {},
  lastFetch: {}
};

let countryNameCache = {};
let countryNameCacheLoaded = false;

/**
 * Populates country name cache from Climate TRACE definitions.
 * Called once at server startup for efficient name lookups.
 */
export async function initializeCountryNames() {
  if (countryNameCacheLoaded) return;
  
  try {
    console.log('🌍 Loading country names from Climate TRACE...');
    const countries = await getCountryDefinitions();
    countries.forEach(c => {
      if (c.alpha3 && c.name) {
        countryNameCache[c.alpha3] = c.name;
      }
    });
    countryNameCacheLoaded = true;
    console.log(`✅ Loaded ${Object.keys(countryNameCache).length} country names`);
  } catch (error) {
    console.error('❌ Failed to load country names:', error.message);
  }
}

/**
 * Retrieves country definitions (ISO codes, names, continents).
 * Results are cached for 30 minutes.
 */
export async function getCountryDefinitions() {
  if (cache.countries && Date.now() - cache.lastFetch.countries < CACHE_DURATION) {
    return cache.countries;
  }

  try {
    console.log('📡 Fetching country definitions from Climate TRACE...');
    const response = await fetch(`${CLIMATE_TRACE_BASE}/definitions/countries`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    cache.countries = data;
    cache.lastFetch.countries = Date.now();
    console.log(`✅ Loaded ${data.length} countries`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch countries:', error.message);
    return [];
  }
}

/**
 * Retrieves sector/industry definitions from Climate TRACE.
 * Results are cached for 30 minutes.
 */
export async function getSectorDefinitions() {
  if (cache.sectors && Date.now() - cache.lastFetch.sectors < CACHE_DURATION) {
    return cache.sectors;
  }

  try {
    console.log('📡 Fetching sector definitions from Climate TRACE...');
    const response = await fetch(`${CLIMATE_TRACE_BASE}/definitions/sectors`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    cache.sectors = data;
    cache.lastFetch.sectors = Date.now();
    console.log(`✅ Loaded ${data.length} sectors`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch sectors:', error.message);
    return [];
  }
}

/**
 * Retrieves continent definitions from Climate TRACE.
 * Results are cached for 30 minutes.
 */
export async function getContinentDefinitions() {
  if (cache.continents && Date.now() - cache.lastFetch.continents < CACHE_DURATION) {
    return cache.continents;
  }

  try {
    console.log('📡 Fetching continent definitions from Climate TRACE...');
    const response = await fetch(`${CLIMATE_TRACE_BASE}/definitions/continents`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    cache.continents = data;
    cache.lastFetch.continents = Date.now();
    console.log(`✅ Loaded ${data.length} continents`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch continents:', error.message);
    return [];
  }
}

/**
 * Identifies top emitting countries by fetching all country emissions
 * and sorting by CO2 output. Results are cached for 30 minutes.
 * 
 * @param {number} since - Start year
 * @param {number} to - End year
 * @param {number} limit - Number of top emitters to return
 * @returns {string[]} Array of ISO alpha-3 country codes
 */
async function getTopEmittingCountryCodes(since, to, limit = 40) {
  const cacheKey = `topEmitters_${since}_${to}_${limit}`;
  
  if (cache.topEmitters[cacheKey] && Date.now() - cache.lastFetch[cacheKey] < CACHE_DURATION) {
    return cache.topEmitters[cacheKey];
  }

  try {
    console.log(`📡 Fetching top ${limit} emitting countries (${since}-${to})...`);
    
    const countries = await getCountryDefinitions();
    
    if (!countries || countries.length === 0) {
      throw new Error('No country definitions available');
    }
    
    const allCodes = countries
      .filter(c => c.alpha3 && c.alpha3.length === 3)
      .map(c => c.alpha3);
    
    console.log(`📋 Got ${allCodes.length} country codes, fetching emissions...`);
    
    const batchSize = 50;
    let allEmissions = [];
    
    for (let i = 0; i < allCodes.length; i += batchSize) {
      const batch = allCodes.slice(i, i + batchSize);
      const url = `${CLIMATE_TRACE_BASE}/country/emissions?since=${since}&to=${to}&countries=${batch.join(',')}`;
      
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            allEmissions.push(...data.filter(d => d.country && d.country !== 'all'));
          }
        }
      } catch (batchError) {
        console.warn(`⚠️ Batch ${i / batchSize + 1} failed:`, batchError.message);
      }
    }
    
    if (allEmissions.length === 0) {
      throw new Error('No emissions data received from API');
    }
    
    const topEmitters = allEmissions
      .filter(d => d.country && d.country.length === 3)
      .sort((a, b) => (b.emissions?.co2 || 0) - (a.emissions?.co2 || 0))
      .slice(0, limit)
      .map(d => d.country);
    
    cache.topEmitters[cacheKey] = topEmitters;
    cache.lastFetch[cacheKey] = Date.now();
    
    console.log(`✅ Found top ${topEmitters.length} emitters: ${topEmitters.slice(0, 5).join(', ')}...`);
    return topEmitters;
  } catch (error) {
    console.error('❌ Failed to fetch top emitters:', error.message);
    console.log('⚠️ Using fallback emitter list');
    const fallback = ['CHN', 'USA', 'IND', 'RUS', 'JPN', 'DEU', 'IRN', 'SAU', 'IDN', 'KOR',
      'CAN', 'BRA', 'ZAF', 'MEX', 'AUS', 'GBR', 'TUR', 'POL', 'ITA', 'FRA',
      'THA', 'VNM', 'EGY', 'MYS', 'ARG', 'PAK', 'NGA', 'ARE', 'NLD', 'PHL',
      'COL', 'KAZ', 'DZA', 'IRQ', 'CHL', 'CZE', 'ROU', 'BGD', 'UKR', 'BEL'];
    return fallback.slice(0, limit);
  }
}

/**
 * Fetches emissions data for countries within a date range.
 * 
 * @param {Object} options - Query options
 * @param {number} options.since - Start year (default: 2023)
 * @param {number} options.to - End year (default: 2023)
 * @param {string|null} options.countries - Comma-separated country codes or null for top emitters
 * @param {number} options.limit - Max countries to return (default: 50)
 */
export async function getCountryEmissions(options = {}) {
  const {
    since = 2023,
    to = 2023,
    countries = null,
    limit = 50
  } = options;

  await initializeCountryNames();

  const cacheKey = `emissions_${since}_${to}_${countries || 'top'}_${limit}`;
  
  if (cache.emissions[cacheKey] && Date.now() - cache.lastFetch[cacheKey] < CACHE_DURATION) {
    console.log('📦 Using cached emissions data');
    return cache.emissions[cacheKey];
  }

  try {
    console.log(`📡 Fetching emissions data (${since}-${to}) from Climate TRACE...`);
    
    let url = `${CLIMATE_TRACE_BASE}/country/emissions?since=${since}&to=${to}`;
    
    if (countries) {
      url += `&countries=${countries}`;
    } else {
      const topCountries = await getTopEmittingCountryCodes(since, to, limit);
      if (topCountries.length > 0) {
        url += `&countries=${topCountries.join(',')}`;
      }
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const processed = processCountryEmissions(data, since, to);
    
    cache.emissions[cacheKey] = processed;
    cache.lastFetch[cacheKey] = Date.now();
    
    console.log(`✅ Loaded emissions for ${processed.countries.length} countries`);
    return processed;
  } catch (error) {
    console.error('❌ Failed to fetch emissions:', error.message);
    return getEmptyResponse(since, to);
  }
}

/**
 * Transforms raw API response into structured country emissions data.
 */
function processCountryEmissions(data, since, to) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  
  const countries = data
    .filter(d => d.country && d.country !== 'all')
    .map(d => ({
      country: d.country,
      name: getCountryName(d.country),
      rank: d.rank,
      previousRank: d.previousRank,
      emissions: {
        co2: Math.round((d.emissions?.co2 || 0) / 1e6),
        ch4: Math.round((d.emissions?.ch4 || 0) / 1e3),
        n2o: Math.round((d.emissions?.n2o || 0) / 1e3),
        co2e_100yr: Math.round((d.emissions?.co2e_100yr || 0) / 1e6),
        co2e_20yr: Math.round((d.emissions?.co2e_20yr || 0) / 1e6)
      },
      share: d.worldEmissions?.co2 > 0 
        ? parseFloat(((d.emissions?.co2 || 0) / d.worldEmissions.co2 * 100).toFixed(2))
        : 0
    }))
    .sort((a, b) => b.emissions.co2 - a.emissions.co2);

  const worldData = data[0]?.worldEmissions || {};
  const worldTotals = {
    co2: Math.round((worldData.co2 || 0) / 1e6),
    ch4: Math.round((worldData.ch4 || 0) / 1e3),
    n2o: Math.round((worldData.n2o || 0) / 1e3),
    co2e_100yr: Math.round((worldData.co2e_100yr || 0) / 1e6),
    co2e_20yr: Math.round((worldData.co2e_20yr || 0) / 1e6)
  };

  return {
    year: to,
    yearRange: { since, to },
    source: 'Data Source: Climate TRACE',
    dataProvider: 'Climate TRACE Coalition',
    lastUpdated: new Date().toISOString(),
    apiStatus: 'live',
    worldTotals,
    countries,
    topCountries: countries.slice(0, 20)
  };
}

/**
 * Fetches emissions broken down by sector/industry.
 */
export async function getSectorEmissions(options = {}) {
  const {
    since = 2023,
    to = 2023,
    countries = null
  } = options;

  try {
    console.log(`📡 Fetching sector emissions (${since}-${to})...`);
    
    let url = `${CLIMATE_TRACE_BASE}/assets/emissions?since=${since}&to=${to}`;
    if (countries) {
      url += `&countries=${countries}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return processSectorEmissions(data);
  } catch (error) {
    console.error('❌ Failed to fetch sector emissions:', error.message);
    return { sectors: [], industries: [] };
  }
}

/**
 * Aggregates raw sector data and calculates percentages.
 */
function processSectorEmissions(data) {
  const sectorMap = {};
  
  for (const [country, emissions] of Object.entries(data)) {
    if (!Array.isArray(emissions)) continue;
    
    for (const e of emissions) {
      if (e.Gas !== 'co2e_100yr') continue;
      
      const sector = normalizeSectorName(e.Sector);
      if (!sectorMap[sector]) {
        sectorMap[sector] = { co2: 0, co2e: 0, count: 0 };
      }
      sectorMap[sector].co2e += e.Emissions || 0;
      sectorMap[sector].count++;
    }
  }

  const total = Object.values(sectorMap).reduce((sum, s) => sum + s.co2e, 0);
  
  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      emissions: Math.round(data.co2e / 1e6),
      percentage: total > 0 ? parseFloat((data.co2e / total * 100).toFixed(1)) : 0,
      color: getSectorColor(name)
    }))
    .filter(s => s.emissions > 0)
    .sort((a, b) => b.emissions - a.emissions);

  const industries = groupSectorsToIndustries(sectors);

  return { sectors, industries, total: Math.round(total / 1e6) };
}

/**
 * Calculates industry breakdown percentages from sector data.
 * Used for distributing total emissions across industry categories.
 */
async function getRealIndustryBreakdown(since, to) {
  const cacheKey = `industryBreakdown_${since}_${to}`;
  
  if (cache.industryBreakdown[cacheKey] && Date.now() - cache.lastFetch[cacheKey] < CACHE_DURATION) {
    return cache.industryBreakdown[cacheKey];
  }

  try {
    console.log(`📡 Fetching industry breakdown (${since}-${to})...`);
    
    const url = `${CLIMATE_TRACE_BASE}/assets/emissions?since=${since}&to=${to}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    const industryTotals = {
      'Energy': 0,
      'Manufacturing': 0,
      'Transportation': 0,
      'Buildings': 0,
      'Agriculture': 0,
      'Waste & Land Use': 0
    };
    
    const sectorToIndustry = {
      'power': 'Energy',
      'electricity-generation': 'Energy',
      'fossil-fuel-operations': 'Energy',
      'oil-and-gas-production-and-transport': 'Energy',
      'oil-and-gas-refining': 'Energy',
      'coal-mining': 'Energy',
      'other-energy-use': 'Energy',
      
      'manufacturing': 'Manufacturing',
      'steel': 'Manufacturing',
      'cement': 'Manufacturing',
      'chemicals': 'Manufacturing',
      'petrochemical-steam-cracking': 'Manufacturing',
      'aluminum': 'Manufacturing',
      'pulp-and-paper': 'Manufacturing',
      'other-manufacturing': 'Manufacturing',
      
      'transportation': 'Transportation',
      'road-transportation': 'Transportation',
      'domestic-aviation': 'Transportation',
      'international-aviation': 'Transportation',
      'international-shipping': 'Transportation',
      'domestic-shipping': 'Transportation',
      'railways': 'Transportation',
      'other-transport': 'Transportation',
      
      'buildings': 'Buildings',
      'residential-and-commercial-onsite-fuel-usage': 'Buildings',
      
      'agriculture': 'Agriculture',
      'enteric-fermentation-cattle-pasture': 'Agriculture',
      'enteric-fermentation-cattle-feedlot': 'Agriculture',
      'rice-cultivation': 'Agriculture',
      'cropland-fires': 'Agriculture',
      'synthetic-fertilizer-application': 'Agriculture',
      'manure-management-cattle-feedlot': 'Agriculture',
      'manure-left-on-pasture-cattle': 'Agriculture',
      'other-agricultural-soil-emissions': 'Agriculture',
      
      'waste': 'Waste & Land Use',
      'solid-waste-disposal': 'Waste & Land Use',
      'wastewater-treatment-and-discharge': 'Waste & Land Use',
      'forestry-and-land-use': 'Waste & Land Use',
      'forest-land-clearing': 'Waste & Land Use',
      'forest-land-degradation': 'Waste & Land Use',
      'shrubgrass-fires': 'Waste & Land Use',
      'wetland-fires': 'Waste & Land Use',
      'removals': 'Waste & Land Use'
    };
    
    let totalEmissions = 0;
    
    for (const [country, emissions] of Object.entries(data)) {
      if (!Array.isArray(emissions)) continue;
      
      for (const e of emissions) {
        if (e.Gas !== 'co2e_100yr') continue;
        
        const sectorKey = e.Sector?.toLowerCase();
        const industry = sectorToIndustry[sectorKey];
        
        if (industry) {
          industryTotals[industry] += e.Emissions || 0;
          totalEmissions += e.Emissions || 0;
        }
      }
    }
    
    const breakdown = {};
    for (const [industry, total] of Object.entries(industryTotals)) {
      breakdown[industry] = totalEmissions > 0 
        ? parseFloat((total / totalEmissions).toFixed(4))
        : 0;
    }
    
    const sum = Object.values(breakdown).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      for (const industry of Object.keys(breakdown)) {
        breakdown[industry] = parseFloat((breakdown[industry] / sum).toFixed(4));
      }
    }
    
    cache.industryBreakdown[cacheKey] = breakdown;
    cache.lastFetch[cacheKey] = Date.now();
    
    console.log('✅ Calculated industry breakdown:', breakdown);
    return breakdown;
  } catch (error) {
    console.error('❌ Failed to fetch industry breakdown:', error.message);
    return {
      'Energy': 0.35,
      'Manufacturing': 0.21,
      'Transportation': 0.16,
      'Buildings': 0.10,
      'Agriculture': 0.11,
      'Waste & Land Use': 0.07
    };
  }
}

/**
 * Fetches year-by-year emissions trends for charting.
 * 
 * @param {Object} options - Query options
 * @param {number} options.startYear - First year in range
 * @param {number} options.endYear - Last year in range
 * @param {string|null} options.countries - Country codes or null for top 5
 */
export async function getEmissionsTrends(options = {}) {
  const {
    startYear = 2019,
    endYear = 2023,
    countries = null
  } = options;

  await initializeCountryNames();

  try {
    console.log(`📡 Fetching emissions trends (${startYear}-${endYear})...`);
    
    const trends = [];
    const industryBreakdown = await getRealIndustryBreakdown(startYear, endYear);
    console.log('📊 Using industry breakdown:', industryBreakdown);
    
    let countryList = countries;
    if (!countryList) {
      const topEmitters = await getTopEmittingCountryCodes(startYear, endYear, 5);
      countryList = topEmitters.join(',');
    }
    
    for (let year = startYear; year <= endYear; year++) {
      const url = `${CLIMATE_TRACE_BASE}/country/emissions?since=${year}&to=${year}&countries=${countryList}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const worldTotal = data[0]?.worldEmissions?.co2 || 0;
        const totalMt = Math.round(worldTotal / 1e6);
        
        const trendEntry = {
          year,
          total: totalMt,
          'Energy': Math.round(totalMt * industryBreakdown['Energy']),
          'Manufacturing': Math.round(totalMt * industryBreakdown['Manufacturing']),
          'Transportation': Math.round(totalMt * industryBreakdown['Transportation']),
          'Buildings': Math.round(totalMt * industryBreakdown['Buildings']),
          'Agriculture': Math.round(totalMt * industryBreakdown['Agriculture']),
          'Waste & Land Use': Math.round(totalMt * industryBreakdown['Waste & Land Use']),
          countries: data.map(d => ({
            code: d.country,
            name: getCountryName(d.country),
            co2: Math.round((d.emissions?.co2 || 0) / 1e6)
          }))
        };
        
        trends.push(trendEntry);
      }
    }
    
    return trends;
  } catch (error) {
    console.error('❌ Failed to fetch trends:', error.message);
    return [];
  }
}

/**
 * Aggregates emissions by geographic region using continent data.
 */
export async function getRegionalEmissions(options = {}) {
  const { since = 2023, to = 2023 } = options;
  
  await initializeCountryNames();
  
  try {
    const countryDefs = await getCountryDefinitions();
    const emissionsData = await getCountryEmissions({ since, to, limit: 100 });
    const countries = emissionsData.countries;
    
    const regionColors = {
      'Asia': '#f59e0b',
      'North America': '#06b6d4',
      'Europe': '#8b5cf6',
      'Africa': '#22c55e',
      'South America': '#14b8a6',
      'Oceania': '#ec4899',
      'Antarctica': '#64748b'
    };

    const countryToContinent = {};
    if (countryDefs && countryDefs.length > 0) {
      for (const country of countryDefs) {
        if (country.alpha3 && country.continent) {
          countryToContinent[country.alpha3] = country.continent;
        }
      }
    }
    
    console.log(`📍 Mapped ${Object.keys(countryToContinent).length} countries to continents`);

    const regionData = {};
    let totalAssigned = 0;

    for (const country of countries) {
      const continent = countryToContinent[country.country];
      if (!continent) continue;
      
      if (!regionData[continent]) {
        regionData[continent] = {
          name: continent,
          emissions: 0,
          color: regionColors[continent] || '#6b7280',
          countryList: [],
          topCountries: []
        };
      }
      
      regionData[continent].emissions += country.emissions.co2;
      regionData[continent].countryList.push(country);
      totalAssigned += country.emissions.co2;
    }

    const regions = Object.values(regionData)
      .filter(r => r.name)
      .map(r => {
        const sortedCountries = r.countryList.sort((a, b) => b.emissions.co2 - a.emissions.co2);
        const regionTotal = r.emissions;
        
        return {
          name: r.name,
          emissions: Math.round(r.emissions),
          color: r.color,
          countryCount: r.countryList.length,
          percentage: totalAssigned > 0 ? parseFloat((r.emissions / totalAssigned * 100).toFixed(1)) : 0,
          countries: r.countryList.length,
          topCountries: sortedCountries.slice(0, 3).map(c => c.name || c.country),
          countryBreakdown: sortedCountries.slice(0, 10).map(c => ({
            name: c.name || c.country,
            code: c.country,
            emissions: c.emissions.co2,
            percentage: regionTotal > 0 ? parseFloat((c.emissions.co2 / regionTotal * 100).toFixed(1)) : 0
          }))
        };
      })
      .sort((a, b) => b.emissions - a.emissions);

    return {
      regions,
      topCountries: countries.slice(0, 20)
    };
  } catch (error) {
    console.error('❌ Failed to fetch regional emissions:', error.message);
    return { regions: [], topCountries: [] };
  }
}

/**
 * Fetches multi-gas emissions data (CO2, CH4, N2O, CO2e).
 */
export async function getAllGasesEmissions(options = {}) {
  const { since = 2023, to = 2023, limit = 30 } = options;
  
  await initializeCountryNames();
  
  try {
    console.log(`📡 Fetching all gases emissions (${since}-${to})...`);
    
    const topCountries = await getTopEmittingCountryCodes(since, to, limit);
    const url = `${CLIMATE_TRACE_BASE}/country/emissions?since=${since}&to=${to}&countries=${topCountries.join(',')}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    const countries = data
      .filter(d => d.country && d.country !== 'all')
      .map(d => ({
        country: d.country,
        name: getCountryName(d.country),
        rank: d.rank,
        gases: {
          co2: {
            value: Math.round((d.emissions?.co2 || 0) / 1e6),
            unit: 'Mt',
            name: 'Carbon Dioxide'
          },
          ch4: {
            value: Math.round((d.emissions?.ch4 || 0) / 1e3),
            unit: 'kt',
            name: 'Methane'
          },
          n2o: {
            value: Math.round((d.emissions?.n2o || 0) / 1e3),
            unit: 'kt',
            name: 'Nitrous Oxide'
          },
          co2e_100yr: {
            value: Math.round((d.emissions?.co2e_100yr || 0) / 1e6),
            unit: 'Mt',
            name: 'CO2 Equivalent (100yr)'
          },
          co2e_20yr: {
            value: Math.round((d.emissions?.co2e_20yr || 0) / 1e6),
            unit: 'Mt',
            name: 'CO2 Equivalent (20yr)'
          }
        }
      }))
      .sort((a, b) => b.gases.co2e_100yr.value - a.gases.co2e_100yr.value);

    const worldData = data[0]?.worldEmissions || {};
    
    return {
      year: to,
      yearRange: { since, to },
      source: 'Data Source: Climate TRACE',
      lastUpdated: new Date().toISOString(),
      worldTotals: {
        co2: { value: Math.round((worldData.co2 || 0) / 1e6), unit: 'Mt', name: 'Carbon Dioxide' },
        ch4: { value: Math.round((worldData.ch4 || 0) / 1e3), unit: 'kt', name: 'Methane' },
        n2o: { value: Math.round((worldData.n2o || 0) / 1e3), unit: 'kt', name: 'Nitrous Oxide' },
        co2e_100yr: { value: Math.round((worldData.co2e_100yr || 0) / 1e6), unit: 'Mt', name: 'CO2 Equivalent (100yr)' },
        co2e_20yr: { value: Math.round((worldData.co2e_20yr || 0) / 1e6), unit: 'Mt', name: 'CO2 Equivalent (20yr)' }
      },
      countries
    };
  } catch (error) {
    console.error('❌ Failed to fetch all gases:', error.message);
    return { countries: [], worldTotals: {} };
  }
}

/**
 * Looks up country name from ISO alpha-3 code.
 */
function getCountryName(code) {
  return countryNameCache[code] || code;
}

/**
 * Converts API sector slugs to human-readable names.
 */
function normalizeSectorName(sector) {
  const mapping = {
    'power': 'Power Generation',
    'electricity-generation': 'Power Generation',
    'transportation': 'Transportation',
    'road-transportation': 'Road Transport',
    'domestic-aviation': 'Aviation',
    'international-aviation': 'International Aviation',
    'international-shipping': 'Shipping',
    'manufacturing': 'Manufacturing',
    'steel': 'Steel Production',
    'cement': 'Cement Production',
    'chemicals': 'Chemicals',
    'petrochemical-steam-cracking': 'Petrochemicals',
    'buildings': 'Buildings',
    'residential-and-commercial-onsite-fuel-usage': 'Buildings',
    'agriculture': 'Agriculture',
    'enteric-fermentation-cattle-pasture': 'Livestock',
    'rice-cultivation': 'Rice Cultivation',
    'fossil-fuel-operations': 'Fossil Fuel Operations',
    'oil-and-gas-production-and-transport': 'Oil & Gas',
    'oil-and-gas-refining': 'Oil Refining',
    'coal-mining': 'Coal Mining',
    'waste': 'Waste',
    'solid-waste-disposal': 'Solid Waste',
    'forestry-and-land-use': 'Land Use',
    'forest-land-clearing': 'Deforestation',
    'mineral-extraction': 'Mining'
  };
  
  return mapping[sector?.toLowerCase()] || sector?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other';
}

/**
 * Returns consistent chart colors for each sector.
 */
function getSectorColor(sector) {
  const colors = {
    'Power Generation': '#f59e0b',
    'Transportation': '#06b6d4',
    'Road Transport': '#06b6d4',
    'Aviation': '#0891b2',
    'Shipping': '#0e7490',
    'Manufacturing': '#8b5cf6',
    'Steel Production': '#7c3aed',
    'Cement Production': '#6d28d9',
    'Chemicals': '#5b21b6',
    'Buildings': '#ec4899',
    'Agriculture': '#22c55e',
    'Livestock': '#16a34a',
    'Fossil Fuel Operations': '#64748b',
    'Oil & Gas': '#475569',
    'Coal Mining': '#334155',
    'Waste': '#a855f7',
    'Land Use': '#84cc16',
    'Deforestation': '#65a30d',
    'Mining': '#78716c'
  };
  return colors[sector] || '#6b7280';
}

/**
 * Groups individual sectors into broader industry categories.
 */
function groupSectorsToIndustries(sectors) {
  const industryGroups = {
    'Energy': ['Power Generation', 'Fossil Fuel Operations', 'Oil & Gas', 'Coal Mining', 'Oil Refining'],
    'Transportation': ['Transportation', 'Road Transport', 'Aviation', 'International Aviation', 'Shipping'],
    'Manufacturing': ['Manufacturing', 'Steel Production', 'Cement Production', 'Chemicals', 'Petrochemicals'],
    'Buildings': ['Buildings'],
    'Agriculture': ['Agriculture', 'Livestock', 'Rice Cultivation'],
    'Waste & Land Use': ['Waste', 'Solid Waste', 'Land Use', 'Deforestation']
  };

  const industryColors = {
    'Energy': '#f59e0b',
    'Transportation': '#06b6d4',
    'Manufacturing': '#8b5cf6',
    'Buildings': '#ec4899',
    'Agriculture': '#22c55e',
    'Waste & Land Use': '#a855f7'
  };

  const industries = [];
  
  for (const [industry, sectorNames] of Object.entries(industryGroups)) {
    const industrySectors = sectors.filter(s => sectorNames.includes(s.name));
    const totalEmissions = industrySectors.reduce((sum, s) => sum + s.emissions, 0);
    
    if (totalEmissions > 0) {
      industries.push({
        id: industry.toLowerCase().replace(/\s+/g, '-'),
        name: industry,
        totalEmissions,
        percentage: industrySectors.reduce((sum, s) => sum + s.percentage, 0).toFixed(1),
        color: industryColors[industry] || '#6b7280',
        sectors: industrySectors
      });
    }
  }

  return industries.sort((a, b) => b.totalEmissions - a.totalEmissions);
}

/**
 * Returns empty response structure for error cases.
 */
function getEmptyResponse(since, to) {
  return {
    year: to,
    yearRange: { since, to },
    source: 'Data Source: Climate TRACE (Unavailable)',
    dataProvider: 'Climate TRACE Coalition',
    lastUpdated: new Date().toISOString(),
    apiStatus: 'error',
    worldTotals: { co2: 0, ch4: 0, n2o: 0, co2e_100yr: 0 },
    countries: [],
    topCountries: []
  };
}

/**
 * Legacy export for backward compatibility.
 * @deprecated Use getCountryEmissions instead
 */
export async function fetchOWIDData() {
  return getCountryEmissions({ since: 2023, to: 2023 });
}
