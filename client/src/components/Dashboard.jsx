import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import OverviewView from './views/OverviewView';
import IndustriesView from './views/IndustriesView';
import TrendsView from './views/TrendsView';
import RegionsView from './views/RegionsView';
import InsightsView from './views/InsightsView';
import GasesView from './views/GasesView';
import LoadingState from './LoadingState';

const views = {
  overview: OverviewView,
  industries: IndustriesView,
  trends: TrendsView,
  regions: RegionsView,
  gases: GasesView,
  insights: InsightsView,
};

function ErrorState({ message, onRetry }) {
  const isRateLimit = message?.toLowerCase().includes('rate limit');
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isRateLimit ? 'bg-amber-500/20' : 'bg-red-500/20'
        }`}>
          <AlertTriangle className={`w-8 h-8 ${isRateLimit ? 'text-amber-400' : 'text-red-400'}`} />
        </div>
        <h3 className="text-xl font-display font-semibold text-white mb-2">
          {isRateLimit ? 'Slow Down!' : 'Something went wrong'}
        </h3>
        <p className="text-dark-400 mb-6">
          {isRateLimit 
            ? 'You\'ve made too many requests. Please wait a moment before refreshing.'
            : message || 'Failed to load emissions data. Please try again.'
          }
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-lens-500 hover:bg-lens-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

export default function Dashboard({ activeView, data, loading, error, yearRange, onYearChange }) {
  const View = views[activeView] || OverviewView;

  if (loading && activeView !== 'gases') {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 pt-4">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pt-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <View 
            data={data} 
            yearRange={yearRange}
            onYearChange={onYearChange}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
