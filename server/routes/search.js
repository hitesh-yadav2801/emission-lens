/**
 * Search API Route
 * Web search endpoint for emissions-related news and articles
 * Uses Serper API for live results, falls back to curated demo results
 */

import express from 'express';

const searchRouter = express.Router();

searchRouter.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const serperKey = process.env.SERPER_API_KEY;
    
    if (serperKey && serperKey.length > 20) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `${query} emissions climate environment`,
          num: 5,
        }),
      });

      const data = await response.json();
      
      return res.json({
        results: data.organic?.map(item => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: new URL(item.link).hostname,
        })) || [],
        source: 'serper'
      });
    }

    res.json({
      results: getMockSearchResults(query),
      source: 'demo'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to perform search',
      details: error.message 
    });
  }
});

/**
 * Returns curated emissions-related articles for demo mode.
 * Filters results based on query keywords.
 */
function getMockSearchResults(query) {
  const lowerQuery = query.toLowerCase();
  
  const allResults = [
    {
      title: "Global Carbon Emissions Reach New Record in 2024 - IEA Report",
      snippet: "The International Energy Agency reports that global CO2 emissions from energy reached 37.4 billion tonnes in 2024, a 1.1% increase from previous year despite growth in renewable energy deployment.",
      link: "https://www.iea.org/reports/co2-emissions-2024",
      source: "iea.org",
      keywords: ["global", "carbon", "energy", "report", "2024"]
    },
    {
      title: "Manufacturing Industry Commits to Net Zero by 2050 - UN Climate",
      snippet: "Major manufacturing companies representing 30% of global industrial emissions have signed the UN's Industry Transition Accord, pledging carbon neutrality by 2050.",
      link: "https://unfccc.int/news/industry-transition-accord",
      source: "unfccc.int",
      keywords: ["manufacturing", "industry", "net zero", "2050"]
    },
    {
      title: "Electric Vehicle Sales Surge: Transportation Emissions Peak - Bloomberg",
      snippet: "Global EV sales exceeded 17 million units in 2024, leading analysts to predict transportation emissions may have peaked. Electrification accelerates across all transport modes.",
      link: "https://www.bloomberg.com/ev-outlook-2024",
      source: "bloomberg.com",
      keywords: ["transport", "electric", "vehicle", "ev"]
    },
    {
      title: "Agriculture Sector Innovations Cut Methane Emissions 15% - Nature",
      snippet: "New farming techniques and feed additives have reduced agricultural methane emissions by 15% in participating regions, offering hope for one of the hardest-to-decarbonize sectors.",
      link: "https://www.nature.com/articles/agriculture-methane",
      source: "nature.com",
      keywords: ["agriculture", "methane", "farming"]
    },
    {
      title: "Carbon Capture Technology Reaches Commercial Scale - Reuters",
      snippet: "The world's largest direct air capture facility began operations in Texas, capable of removing 500,000 tonnes of CO2 annually. Costs have dropped 60% since 2020.",
      link: "https://www.reuters.com/carbon-capture-commercial",
      source: "reuters.com",
      keywords: ["carbon capture", "technology", "dac"]
    },
    {
      title: "European Green Deal Progress Report Shows 23% Emission Reduction",
      snippet: "The European Commission releases mid-term review showing EU emissions have fallen 23% below 1990 levels, putting the bloc on track for 2030 targets.",
      link: "https://ec.europa.eu/green-deal-progress",
      source: "ec.europa.eu",
      keywords: ["europe", "eu", "green deal", "reduction"]
    },
    {
      title: "Renewable Energy Now Cheapest Option in Most Markets - IRENA",
      snippet: "Solar and wind power are now the most cost-effective electricity sources in markets covering 90% of global population, accelerating the energy transition.",
      link: "https://www.irena.org/costs-2024",
      source: "irena.org",
      keywords: ["renewable", "solar", "wind", "energy", "cost"]
    },
    {
      title: "Building Sector Emissions: The Hidden Climate Challenge - UNEP",
      snippet: "Buildings account for 37% of energy-related emissions. New report outlines strategies for retrofitting existing structures and ensuring new construction is net-zero.",
      link: "https://www.unep.org/buildings-emissions",
      source: "unep.org",
      keywords: ["building", "construction", "retrofit"]
    }
  ];

  const filtered = allResults.filter(result => 
    result.keywords.some(keyword => lowerQuery.includes(keyword)) ||
    result.title.toLowerCase().includes(lowerQuery) ||
    result.snippet.toLowerCase().includes(lowerQuery)
  );

  return (filtered.length > 0 ? filtered : allResults).slice(0, 5);
}

export default searchRouter;
