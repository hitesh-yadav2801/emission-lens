import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function YearFilter({ yearRange, availableYears, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'range'

  const handleYearSelect = (year) => {
    if (mode === 'single') {
      onChange({ since: year, to: year });
    } else {
      // Range mode - set the since year, keep to year if valid
      if (year <= yearRange.to) {
        onChange({ ...yearRange, since: year });
      } else {
        onChange({ since: year, to: year });
      }
    }
    if (mode === 'single') {
      setIsOpen(false);
    }
  };

  const handleEndYearSelect = (year) => {
    if (year >= yearRange.since) {
      onChange({ ...yearRange, to: year });
    }
    setIsOpen(false);
  };

  const displayText = yearRange.since === yearRange.to 
    ? `${yearRange.since}` 
    : `${yearRange.since} - ${yearRange.to}`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800/80 hover:bg-dark-700 
          border border-dark-700 rounded-lg transition-colors text-white"
      >
        <Calendar className="w-4 h-4 text-lens-400" />
        <span className="font-medium">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 bg-dark-800 border border-dark-700 
                rounded-xl shadow-xl overflow-hidden min-w-[280px]"
            >
              {/* Mode Toggle */}
              <div className="p-3 border-b border-dark-700">
                <div className="flex bg-dark-900 rounded-lg p-1">
                  <button
                    onClick={() => setMode('single')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${mode === 'single' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
                  >
                    Single Year
                  </button>
                  <button
                    onClick={() => setMode('range')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${mode === 'range' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
                  >
                    Year Range
                  </button>
                </div>
              </div>

              {mode === 'single' ? (
                /* Single Year Selection */
                <div className="p-3">
                  <div className="text-xs text-dark-400 mb-2">Select Year</div>
                  <div className="grid grid-cols-3 gap-2">
                    {availableYears.map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${yearRange.since === year 
                            ? 'bg-lens-500 text-white' 
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Range Selection */
                <div className="p-3 space-y-4">
                  <div>
                    <div className="text-xs text-dark-400 mb-2">From Year</div>
                    <div className="grid grid-cols-3 gap-2">
                      {availableYears.map(year => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${yearRange.since === year 
                              ? 'bg-lens-500 text-white' 
                              : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-dark-400 mb-2">To Year</div>
                    <div className="grid grid-cols-3 gap-2">
                      {availableYears.map(year => (
                        <button
                          key={year}
                          onClick={() => handleEndYearSelect(year)}
                          disabled={year < yearRange.since}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${year < yearRange.since 
                              ? 'bg-dark-800 text-dark-600 cursor-not-allowed'
                              : yearRange.to === year 
                                ? 'bg-lens-500 text-white' 
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              <div className="p-3 border-t border-dark-700 bg-dark-900/50">
                <div className="text-xs text-dark-400 mb-2">Quick Select</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onChange({ since: 2023, to: 2023 });
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-dark-700 text-dark-300 hover:bg-dark-600 
                      hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Latest (2023)
                  </button>
                  <button
                    onClick={() => {
                      const minYear = Math.min(...availableYears);
                      const maxYear = Math.max(...availableYears);
                      onChange({ since: minYear, to: maxYear });
                      setMode('range');
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-dark-700 text-dark-300 hover:bg-dark-600 
                      hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    All Years
                  </button>
                  <button
                    onClick={() => {
                      onChange({ since: 2019, to: 2023 });
                      setMode('range');
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-dark-700 text-dark-300 hover:bg-dark-600 
                      hover:text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Last 5 Years
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

