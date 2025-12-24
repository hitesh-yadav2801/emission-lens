/**
 * Emissions API Routes
 * Endpoints for retrieving global emissions data from Climate TRACE
 */

import express from 'express';
import {
  getCountryEmissions,
  getSectorEmissions,
  getEmissionsTrends,
  getRegionalEmissions,
  getAllGasesEmissions,
  getCountryDefinitions,
  getSectorDefinitions
} from '../services/emissionsApi.js';

const emissionsRouter = express.Router();

emissionsRouter.get('/summary', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    
    const data = await getCountryEmissions({ since, to });
    
    const topIndustry = {
      id: 'energy',
      name: 'Energy',
      totalEmissions: Math.round(data.worldTotals.co2 * 0.35),
      percentage: '35.0',
      color: '#f59e0b',
      icon: '⚡',
      description: 'Power generation, fuel production'
    };

    res.json({
      totalEmissions: data.worldTotals.co2,
      totalIndustries: 6,
      totalCountries: data.countries.length,
      unit: 'Million Tonnes CO2',
      year: data.year,
      yearRange: data.yearRange,
      changeFromLastYear: 1.1,
      topIndustry,
      source: data.source,
      lastUpdated: data.lastUpdated
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
});

emissionsRouter.get('/countries', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    const limit = parseInt(req.query.limit) || 50;
    const countries = req.query.countries || null;
    
    const data = await getCountryEmissions({ since, to, countries, limit });
    
    const result = data.countries.slice(0, limit).map(c => ({
      country: c.name,
      iso_code: c.country,
      rank: c.rank,
      co2: c.emissions.co2,
      share_global_co2: c.share,
      year: data.year
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Countries API Error:', error);
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

emissionsRouter.get('/by-region', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    
    const data = await getRegionalEmissions({ since, to });
    
    res.json({
      regions: data.regions,
      topCountries: data.topCountries.map(c => ({
        country: c.name,
        iso_code: c.country,
        rank: c.rank,
        co2: c.emissions.co2,
        share_global_co2: c.share
      })),
      year: to,
      yearRange: { since, to }
    });
  } catch (error) {
    console.error('Regions API Error:', error);
    res.status(500).json({ error: 'Failed to fetch regional data' });
  }
});

emissionsRouter.get('/by-industry', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    const countries = req.query.countries || null;
    
    const data = await getSectorEmissions({ since, to, countries });
    
    res.json({
      industries: data.industries,
      total: data.total,
      year: to,
      yearRange: { since, to }
    });
  } catch (error) {
    console.error('Industry API Error:', error);
    res.status(500).json({ error: 'Failed to fetch industry data' });
  }
});

emissionsRouter.get('/by-sector', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    const countries = req.query.countries || null;
    
    const data = await getSectorEmissions({ since, to, countries });
    
    res.json({
      sectors: data.sectors,
      total: data.total,
      year: to,
      yearRange: { since, to }
    });
  } catch (error) {
    console.error('Sector API Error:', error);
    res.status(500).json({ error: 'Failed to fetch sector data' });
  }
});

emissionsRouter.get('/trends', async (req, res) => {
  try {
    const startYear = parseInt(req.query.startYear) || 2019;
    const endYear = parseInt(req.query.endYear) || 2023;
    const countries = req.query.countries || 'CHN,USA,IND,RUS,JPN';
    
    const trends = await getEmissionsTrends({ startYear, endYear, countries });
    
    res.json({
      trends,
      yearRange: { startYear, endYear },
      source: 'Data Source: Climate TRACE'
    });
  } catch (error) {
    console.error('Trends API Error:', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

emissionsRouter.get('/gases', async (req, res) => {
  try {
    const since = parseInt(req.query.since) || 2023;
    const to = parseInt(req.query.to) || 2023;
    const limit = parseInt(req.query.limit) || 30;
    
    const data = await getAllGasesEmissions({ since, to, limit });
    
    res.json(data);
  } catch (error) {
    console.error('Gases API Error:', error);
    res.status(500).json({ error: 'Failed to fetch gas emissions data' });
  }
});

emissionsRouter.get('/definitions/countries', async (req, res) => {
  try {
    const countries = await getCountryDefinitions();
    res.json(countries);
  } catch (error) {
    console.error('Countries Definition Error:', error);
    res.status(500).json({ error: 'Failed to fetch country definitions' });
  }
});

emissionsRouter.get('/definitions/sectors', async (req, res) => {
  try {
    const sectors = await getSectorDefinitions();
    res.json(sectors);
  } catch (error) {
    console.error('Sectors Definition Error:', error);
    res.status(500).json({ error: 'Failed to fetch sector definitions' });
  }
});

emissionsRouter.get('/years', async (req, res) => {
  res.json({
    availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    defaultYear: 2025,
    minYear: 2015,
    maxYear: 2025
  });
});

export default emissionsRouter;
