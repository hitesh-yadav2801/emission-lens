import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, ArrowRight } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Treemap
} from 'recharts';
import ChartCard from '../charts/ChartCard';

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

export default function RegionsView({ data }) {
  const [selectedRegion, setSelectedRegion] = useState(null);

  if (!data) return null;

  const { regions } = data;

  const handleRegionClick = (region) => {
    setSelectedRegion(selectedRegion === region.name ? null : region.name);
  };

  const treemapData = regions.map(r => ({
    name: r.name,
    size: r.emissions,
    color: r.color
  }));

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
          Regional <span className="text-gradient">Analysis</span>
        </h1>
        <p className="text-dark-400">
          Geographic distribution of global greenhouse gas emissions
        </p>
      </motion.div>

      {/* Region Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {regions.map((region, index) => (
          <motion.button
            key={region.name}
            variants={itemVariants}
            onClick={() => handleRegionClick(region)}
            className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
              selectedRegion === region.name
                ? 'glass border-lens-500/50 glow-sm'
                : 'glass-light border-dark-700/30 hover:border-dark-600/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${region.color}20` }}
              >
                <Globe2 size={20} style={{ color: region.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm">{region.name}</h3>
                <p className="text-xs text-dark-400">{region.percentage}% of global</p>
              </div>
            </div>
            
            <p className="text-2xl font-bold text-white">
              {(region.emissions / 1000).toFixed(1)}K
              <span className="text-sm font-normal text-dark-400 ml-1">MMT</span>
            </p>
            
            <div className="mt-3 h-2 rounded-full bg-dark-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${region.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: region.color }}
              />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Selected Region Details - Now using dynamic data */}
      {selectedRegion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {(() => {
            const region = regions.find(r => r.name === selectedRegion);
            const countryData = region?.countryBreakdown || [];
            
            return (
              <>
                <ChartCard 
                  title={`${selectedRegion} Breakdown`} 
                  subtitle={`Top emitting countries (${region?.countryCount || 0} total)`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={countryData}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis 
                        type="number" 
                        stroke="#64748b" 
                        fontSize={12}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={11}
                        width={100}
                        tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="emissions" 
                        fill={region?.color}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Region Stats" subtitle="Key metrics from Climate TRACE">
                  <div className="grid grid-cols-2 gap-3 pt-4 pb-2">
                    <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Total Emissions</p>
                      <p className="text-xl font-bold text-white">
                        {(region?.emissions / 1000).toFixed(1)}K
                        <span className="text-sm font-normal text-dark-400 ml-1">MT</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Global Share</p>
                      <p className="text-xl font-bold text-lens-400">
                        {region?.percentage}%
                      </p>
                    </div>
                    <div className="col-span-2 p-3 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Top Emitter</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-lens-400" />
                          <span className="text-white font-medium text-sm">
                            {countryData[0]?.name || 'N/A'}
                          </span>
                        </div>
                        <span className="text-lens-400 font-mono text-sm">
                          {countryData[0]?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 p-3 rounded-xl bg-dark-800/50 border border-dark-700/30">
                      <p className="text-dark-400 text-sm mb-1">Countries Tracked</p>
                      <p className="text-white font-medium text-sm">
                        {region?.countryCount || 0} countries with emissions data
                      </p>
                    </div>
                  </div>
                </ChartCard>
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div variants={itemVariants}>
          <ChartCard title="Global Distribution" subtitle="Emissions share by region">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={regions}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={130}
                  paddingAngle={2}
                  dataKey="emissions"
                  nameKey="name"
                  onClick={(_, index) => handleRegionClick(regions[index])}
                  style={{ cursor: 'pointer' }}
                >
                  {regions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      opacity={selectedRegion && selectedRegion !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {regions.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionClick(region)}
                  className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full transition-all ${
                    selectedRegion === region.name
                      ? 'bg-dark-700'
                      : 'hover:bg-dark-800'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-dark-300">{region.name}</span>
                </button>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* Treemap */}
        <motion.div variants={itemVariants}>
          <ChartCard title="Proportional View" subtitle="Size represents emission volume">
            <ResponsiveContainer width="100%" height={350}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#1e293b"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <motion.div variants={itemVariants}>
        <ChartCard title="Regional Comparison" subtitle="Detailed metrics by region">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-dark-700">
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Region</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Emissions</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">% of Global</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Countries</th>
                  <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">Top Emitter</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region, index) => (
                  <motion.tr 
                    key={region.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors cursor-pointer"
                    onClick={() => handleRegionClick(region)}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: region.color }}
                        />
                        <span className="text-white font-medium">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-white font-mono">
                        {region.emissions.toLocaleString()}
                      </span>
                      <span className="text-dark-500 text-sm ml-1">MT</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-white">{region.percentage}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-dark-300">
                        {region.countryCount || region.countries} countries
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-dark-300">
                        {region.topCountries?.[0] || 'N/A'}
                      </span>
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
      <p className="text-white font-medium">{payload[0].payload.name}</p>
      <p className="text-sm text-lens-400">
        {payload[0].value?.toLocaleString()} MMT CO2e
      </p>
      <p className="text-xs text-dark-400">
        {payload[0].payload.percentage}% of region
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-sm" style={{ color: payload[0].payload.color }}>
        {payload[0].value?.toLocaleString()} MMT CO2e
      </p>
      <p className="text-xs text-dark-400">
        {payload[0].payload.percentage}% of global
      </p>
    </div>
  );
}

function CustomTreemapContent({ x, y, width, height, name, color }) {
  if (width < 50 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        opacity={0.8}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={width > 100 ? 12 : 10}
        fontWeight="500"
      >
        {name}
      </text>
    </g>
  );
}


