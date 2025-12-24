import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Factory, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Zap,
  Truck,
  Building2,
  Leaf,
  Trash2,
  Trees
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ChartCard from '../charts/ChartCard';

const industryIcons = {
  Energy: Zap,
  Manufacturing: Factory,
  Transportation: Truck,
  Buildings: Building2,
  Agriculture: Leaf,
  'Waste Management': Trash2,
  'Forestry & Land Use': Trees
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function IndustriesView({ data }) {
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  if (!data) return null;

  const { industries, sectors } = data;

  // Get industry details dynamically from API data
  const getIndustryDetails = (industryName) => {
    // Find the industry in the data
    const industry = industries.find(i => i.name === industryName);
    if (!industry) return null;

    // Get sectors that belong to this industry
    // The industry object may have a 'sectors' property from the API
    let industrySectors = industry.sectors || [];
    
    // If no sectors in industry object, try to match from the sectors list
    if (industrySectors.length === 0 && sectors) {
      // Map sector names to industries based on common groupings
      const sectorToIndustryMap = {
        'Power Generation': 'Energy',
        'Fossil Fuel Operations': 'Energy',
        'Oil & Gas': 'Energy',
        'Coal Mining': 'Energy',
        'Oil Refining': 'Energy',
        'Transportation': 'Transportation',
        'Road Transport': 'Transportation',
        'Aviation': 'Transportation',
        'International Aviation': 'Transportation',
        'Shipping': 'Transportation',
        'Manufacturing': 'Manufacturing',
        'Steel Production': 'Manufacturing',
        'Cement Production': 'Manufacturing',
        'Chemicals': 'Manufacturing',
        'Petrochemicals': 'Manufacturing',
        'Buildings': 'Buildings',
        'Agriculture': 'Agriculture',
        'Livestock': 'Agriculture',
        'Rice Cultivation': 'Agriculture',
        'Waste': 'Waste & Land Use',
        'Solid Waste': 'Waste & Land Use',
        'Land Use': 'Waste & Land Use',
        'Deforestation': 'Waste & Land Use'
      };

      industrySectors = sectors
        .filter(s => sectorToIndustryMap[s.name] === industryName)
        .map(s => ({
          name: s.name,
          emissions: s.emissions,
          color: s.color || industry.color,
          percentage: s.percentage
        }));
    }

    // Generate color shades for sectors
    const baseColor = industry.color || '#6b7280';
    industrySectors = industrySectors.map((s, idx) => ({
      ...s,
      color: s.color || adjustColorBrightness(baseColor, idx * 15)
    }));

    return {
      sectors: industrySectors,
      totalEmissions: industry.totalEmissions || industry.emissions,
      percentage: industry.percentage
    };
  };

  // Helper to adjust color brightness for sector colors
  const adjustColorBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
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
          Industry <span className="text-gradient">Analysis</span>
        </h1>
        <p className="text-dark-400">
          Deep dive into emissions across major industrial sectors
        </p>
      </motion.div>

      {/* Industry Cards Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {industries.map((industry, index) => {
          const Icon = industryIcons[industry.name] || Factory;
          const isSelected = selectedIndustry === industry.name;
          
          return (
            <motion.button
              key={industry.name}
              variants={itemVariants}
              onClick={() => setSelectedIndustry(isSelected ? null : industry.name)}
              className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'glass border-lens-500/50 glow-sm'
                  : 'glass-light border-dark-700/30 hover:border-dark-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${industry.color}20` }}
                >
                  <Icon size={24} style={{ color: industry.color }} />
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-dark-500 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                />
              </div>
              
              <h3 className="font-display font-semibold text-white mb-1">
                {industry.name}
              </h3>
              <p className="text-2xl font-bold text-white mb-1">
                {((industry.totalEmissions || industry.emissions || 0) / 1000).toFixed(1)}K
                <span className="text-sm font-normal text-dark-400 ml-1">MT</span>
              </p>
              <div className="flex items-center gap-2">
                <div 
                  className="flex-1 h-1.5 rounded-full bg-dark-700"
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${industry.percentage}%`,
                      backgroundColor: industry.color
                    }}
                  />
                </div>
                <span className="text-sm text-dark-400">{industry.percentage}%</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Detailed View - Now using dynamic data */}
      {selectedIndustry && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {(() => {
            const details = getIndustryDetails(selectedIndustry);
            const industrySectors = details?.sectors || [];
            const industryInfo = industries.find(i => i.name === selectedIndustry);
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Breakdown */}
                <ChartCard 
                  title={`${selectedIndustry} Sectors`} 
                  subtitle={industrySectors.length > 0 ? "Breakdown by sub-sector (from Climate TRACE)" : "Sector data"}
                >
                  {industrySectors.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={industrySectors}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="emissions"
                            nameKey="name"
                          >
                            {industrySectors.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {industrySectors.map((sector) => (
                          <div key={sector.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: sector.color }}
                              />
                              <span className="text-dark-300">{sector.name}</span>
                            </div>
                            <span className="text-white font-medium">
                              {sector.emissions?.toLocaleString() || 0} MT
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-dark-400 mb-2">Sector breakdown data</p>
                        <p className="text-2xl font-bold text-white">
                          {industryInfo?.totalEmissions?.toLocaleString() || industryInfo?.emissions?.toLocaleString() || 0} MT
                        </p>
                        <p className="text-dark-500 text-sm mt-1">Total industry emissions</p>
                      </div>
                    </div>
                  )}
                </ChartCard>

                {/* Industry Stats */}
                <ChartCard 
                  title={`${selectedIndustry} Overview`} 
                  subtitle="Key metrics from Climate TRACE"
                >
                  <div className="grid grid-cols-2 gap-4 h-full pt-4">
                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Total Emissions</p>
                      <p className="text-2xl font-bold text-white">
                        {((industryInfo?.totalEmissions || industryInfo?.emissions || 0) / 1000).toFixed(1)}K
                        <span className="text-sm font-normal text-dark-400 ml-1">MT</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Global Share</p>
                      <p className="text-2xl font-bold" style={{ color: industryInfo?.color }}>
                        {industryInfo?.percentage || 0}%
                      </p>
                    </div>
                    <div className="col-span-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-2">Sub-sectors Tracked</p>
                      <p className="text-white font-medium">
                        {industrySectors.length > 0 
                          ? `${industrySectors.length} sectors contributing to ${selectedIndustry}`
                          : 'Aggregated industry data from Climate TRACE'
                        }
                      </p>
                    </div>
                    {industrySectors.length > 0 && industrySectors[0] && (
                      <div className="col-span-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700/30">
                        <p className="text-dark-400 text-sm mb-2">Largest Sector</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{industrySectors[0].name}</span>
                          <span className="text-lens-400 font-mono">
                            {industrySectors[0].emissions?.toLocaleString() || 0} MT
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </ChartCard>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Top Sectors Table */}
      <motion.div variants={itemVariants}>
        <ChartCard title="Top Emitting Sectors" subtitle="All industries combined">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-dark-700">
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Rank</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Sector</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Industry</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Emissions</th>
                </tr>
              </thead>
              <tbody>
                {sectors.slice(0, 10).map((sector, index) => (
                  <motion.tr 
                    key={sector.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="py-3">
                      <span className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs text-dark-300">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-white font-medium">{sector.name}</span>
                    </td>
                    <td className="py-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${sector.industryColor}20`,
                          color: sector.industryColor
                        }}
                      >
                        {sector.industry}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-white font-mono">
                        {sector.emissions.toLocaleString()}
                      </span>
                      <span className="text-dark-500 text-sm ml-1">MMT</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium">{payload[0].name || payload[0].payload.name}</p>
      <p className="text-sm text-lens-400">
        {payload[0].value?.toLocaleString()} MMT CO2e
      </p>
    </div>
  );
}


