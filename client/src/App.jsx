import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';
import YearFilter from './components/YearFilter';
import { MessageCircle, X } from 'lucide-react';
import { api } from './config';

// Helper to handle API responses with rate limit detection
async function fetchWithRateLimit(url) {
  const response = await fetch(url);
  
  if (response.status === 429) {
    const error = await response.json();
    throw new Error(error.message || 'Rate limit exceeded. Please wait a moment.');
  }
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [emissionsData, setEmissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Year filter state
  const [yearRange, setYearRange] = useState({ since: 2025, to: 2025 });
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years on mount
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // Fetch emissions data when year changes
  useEffect(() => {
    fetchEmissionsData();
  }, [yearRange]);

  const fetchAvailableYears = async () => {
    try {
      const response = await fetch(api.emissions.years);
      const data = await response.json();
      setAvailableYears(data.availableYears || [2019, 2020, 2021, 2022, 2023, 2024, 2025]);
    } catch (error) {
      console.error('Failed to fetch years:', error);
      setAvailableYears([2019, 2020, 2021, 2022, 2023, 2024, 2025]);
    }
  };

  const fetchEmissionsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        since: yearRange.since,
        to: yearRange.to
      });

      const [summary, industries, sectors, trends, regions, countries] = await Promise.all([
        fetchWithRateLimit(`${api.emissions.summary}?${params}`),
        fetchWithRateLimit(`${api.emissions.byIndustry}?${params}`),
        fetchWithRateLimit(`${api.emissions.bySector}?${params}`),
        fetchWithRateLimit(`${api.emissions.trends}?startYear=${Math.min(...availableYears) || 2019}&endYear=${yearRange.to}`),
        fetchWithRateLimit(`${api.emissions.byRegion}?${params}`),
        fetchWithRateLimit(`${api.emissions.countries}?${params}&limit=20`),
      ]);

      setEmissionsData({
        summary,
        industries: industries.industries || [],
        sectors: sectors.sectors || [],
        trends: trends.trends || [],
        regions: regions.regions || [],
        topCountries: regions.topCountries || [],
        countries,
      });
    } catch (err) {
      console.error('Failed to fetch emissions data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [yearRange, availableYears]);

  const handleYearChange = (newRange) => {
    setYearRange(newRange);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-lens-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-lens-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen relative pt-16 lg:pt-0">
        {/* Year Filter Header */}
        <div className="sticky top-16 lg:top-0 z-30 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
          <div className="px-4 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-4 flex items-center justify-between">
            <div className="text-sm text-dark-400 hidden sm:block">
              {emissionsData?.summary?.source && (
                <span className="px-2 py-1 bg-lens-500/20 text-lens-300 rounded-full text-xs">
                  {emissionsData.summary.source}
                </span>
              )}
            </div>
            <YearFilter
              yearRange={yearRange}
              availableYears={availableYears}
              onChange={handleYearChange}
            />
          </div>
        </div>

        <Dashboard 
          activeView={activeView} 
          data={emissionsData} 
          loading={loading}
          error={error}
          yearRange={yearRange}
          onYearChange={handleYearChange}
        />
      </main>

      {/* Chat Toggle Button - hidden on mobile when chat is open */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-4 right-4 md:bottom-5 md:right-5 lg:bottom-6 lg:right-6 z-50 w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isChatOpen 
            ? 'hidden sm:flex bg-dark-700 text-dark-300 hover:bg-dark-600' 
            : 'bg-gradient-lens text-white glow hover:scale-110'
        }`}
        whileHover={{ scale: isChatOpen ? 1 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatPanel onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
