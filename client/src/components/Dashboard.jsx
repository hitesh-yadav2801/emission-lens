import { motion, AnimatePresence } from 'framer-motion';
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

export default function Dashboard({ activeView, data, loading, yearRange, onYearChange }) {
  const View = views[activeView] || OverviewView;

  if (loading && activeView !== 'gases') {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 pt-4">
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
