import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  Globe,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../../config';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const suggestedSearches = [
  'Latest carbon emission regulations 2024',
  'Renewable energy growth trends',
  'Net zero commitments by industry',
  'Electric vehicle impact on emissions',
  'Carbon capture technology advances',
  'Climate policy updates Europe'
];

export default function InsightsView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setQuery(searchQuery);

    try {
      const response = await fetch(api.search, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Web <span className="text-gradient">Insights</span>
        </h1>
        <p className="text-dark-400">
          Search the internet for the latest emissions news, research, and insights
        </p>
      </motion.div>

      {/* Search Box */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-4 sm:p-6">
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col sm:hidden gap-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {loading ? (
                  <Loader2 className="w-5 h-5 text-lens-400 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-dark-400" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search emissions insights..."
                className="w-full pl-12 pr-4 py-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-lens-500/50 focus:ring-1 focus:ring-lens-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="w-full px-4 py-3 bg-gradient-lens text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Search Web
            </button>
          </div>

          {/* Tablet/Desktop: Inline layout */}
          <div className="hidden sm:block relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-lens-400 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-dark-400" />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for emissions insights, news, and research..."
              className="w-full pl-12 pr-36 py-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-lens-500/50 focus:ring-1 focus:ring-lens-500/20 transition-all"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-lens text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Sparkles size={16} />
              Search Web
            </button>
          </div>

          {/* Suggested Searches */}
          {!searched && (
            <div className="mt-4">
              <p className="text-sm text-dark-400 mb-2">Suggested searches:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="px-3 py-1.5 text-sm text-dark-300 bg-dark-800/50 border border-dark-700/30 rounded-full hover:border-lens-500/30 hover:text-white transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-lens flex items-center justify-center glow mb-4">
              <Globe className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-white font-medium mb-2">Searching the web...</p>
            <p className="text-dark-400 text-sm">Finding the latest emissions insights</p>
          </motion.div>
        ) : searched && results.length > 0 ? (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-400">
                Found {results.length} results for "{query}"
              </p>
              <button
                onClick={() => handleSearch()}
                className="text-sm text-lens-400 hover:text-lens-300 flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {results.map((result, index) => (
              <motion.a
                key={index}
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                className="block glass-light rounded-xl p-5 border border-dark-700/30 hover:border-lens-500/30 transition-all group"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-dark-700 flex items-center justify-center">
                        <Globe size={12} className="text-dark-400" />
                      </div>
                      <span className="text-xs text-lens-400 font-medium">
                        {result.source}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 group-hover:text-lens-400 transition-colors">
                      {result.title}
                    </h3>
                    <p className="text-dark-400 text-sm line-clamp-2">
                      {result.snippet}
                    </p>
                  </div>
                  <ExternalLink 
                    size={18} 
                    className="text-dark-500 group-hover:text-lens-400 transition-colors flex-shrink-0 mt-1" 
                  />
                </div>
              </motion.a>
            ))}
          </motion.div>
        ) : searched ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-white font-medium mb-2">No results found</p>
            <p className="text-dark-400 text-sm">Try adjusting your search terms</p>
          </motion.div>
        ) : (
          <motion.div
            key="initial"
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Feature Cards */}
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Real-time Search"
              description="Get the latest news and research on emissions from across the web"
              color="#10b981"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI-Powered Insights"
              description="Our AI filters and surfaces the most relevant information for you"
              color="#8b5cf6"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Stay Updated"
              description="Track policy changes, industry commitments, and research breakthroughs"
              color="#f59e0b"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      {!searched && (
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-4">
            Search Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-lens-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lens-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Be specific</p>
                <p className="text-dark-400">Include industry names, years, or regions for better results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-lens-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lens-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Use keywords</p>
                <p className="text-dark-400">Terms like "carbon", "net zero", "sustainability" work well</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-lens-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lens-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Check sources</p>
                <p className="text-dark-400">We prioritize authoritative sources like IEA, IPCC, and major news</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-lens-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lens-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-white font-medium">Explore topics</p>
                <p className="text-dark-400">Try clicking suggested searches to discover new insights</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="glass-light rounded-xl p-5 border border-dark-700/30">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <h3 className="font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-dark-400">{description}</p>
    </div>
  );
}


