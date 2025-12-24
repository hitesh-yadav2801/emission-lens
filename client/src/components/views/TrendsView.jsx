import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
  Cell
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

const industryColors = {
  'Energy': '#f59e0b',
  'Manufacturing': '#8b5cf6',
  'Transportation': '#06b6d4',
  'Agriculture': '#22c55e',
  'Buildings': '#ec4899',
  'Waste & Land Use': '#a855f7'
};

const countryColors = {
  CHN: '#ef4444',
  USA: '#3b82f6',
  IND: '#22c55e',
  RUS: '#8b5cf6',
  JPN: '#f59e0b'
};

export default function TrendsView({ data, yearRange }) {
  const [selectedIndustries, setSelectedIndustries] = useState(['Energy', 'Manufacturing', 'Transportation', 'Waste & Land Use']);
  const [timeRange, setTimeRange] = useState('all');
  const [viewMode, setViewMode] = useState('industry'); // 'industry' | 'country' | 'total'

  if (!data) return null;

  const { trends = [], industries = [] } = data;

  // Use industries from data or fallback to default list
  const availableIndustries = industries.length > 0 
    ? industries 
    : Object.keys(industryColors).map(name => ({ name, color: industryColors[name] }));

  const toggleIndustry = (name) => {
    setSelectedIndustries(prev => 
      prev.includes(name) 
        ? prev.filter(i => i !== name)
        : [...prev, name]
    );
  };

  const filteredTrends = timeRange === 'all' 
    ? trends 
    : trends.slice(-parseInt(timeRange));

  // Calculate year-over-year changes for total emissions
  const calculateYoYChange = () => {
    if (trends.length < 2) return 0;
    const current = trends[trends.length - 1]?.total || 0;
    const previous = trends[trends.length - 2]?.total || 0;
    return previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 0;
  };

  const yoyChange = parseFloat(calculateYoYChange());

  // Prepare country trend data
  const countryTrendData = filteredTrends.map(t => {
    const entry = { year: t.year };
    t.countries?.forEach(c => {
      entry[c.code] = c.co2;
    });
    return entry;
  });

  // Get unique country codes
  const countryCodes = [...new Set(trends.flatMap(t => t.countries?.map(c => c.code) || []))];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            CO₂ Emission <span className="text-gradient">Trends</span>
          </h1>
          <p className="text-dark-400">
            Historical analysis from {trends[0]?.year || 2019} to {trends[trends.length - 1]?.year || 2023}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 glass-light rounded-xl p-1">
          {[
            { value: 'all', label: 'All Time' },
            { value: '5', label: '5 Years' },
            { value: '3', label: '3 Years' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-lens-500 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-1">
            <Globe className="w-4 h-4" />
            Latest Total (MT CO₂)
          </div>
          <div className="text-2xl font-bold text-white">
            {(trends[trends.length - 1]?.total || 0).toLocaleString()}
          </div>
          <div className="text-xs text-dark-500">
            Year {trends[trends.length - 1]?.year || 2023}
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-1">
            {yoyChange < 0 ? <TrendingDown className="w-4 h-4 text-green-400" /> : <TrendingUp className="w-4 h-4 text-red-400" />}
            Year-over-Year Change
          </div>
          <div className={`text-2xl font-bold ${yoyChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {yoyChange > 0 ? '+' : ''}{yoyChange}%
          </div>
          <div className="text-xs text-dark-500">
            vs {trends[trends.length - 2]?.year || 2022}
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="text-dark-400 text-sm mb-1">Data Points</div>
          <div className="text-2xl font-bold text-white">
            {trends.length} years
          </div>
          <div className="text-xs text-dark-500">
            {trends[0]?.year || 2019} - {trends[trends.length - 1]?.year || 2023}
          </div>
        </div>
      </motion.div>

      {/* View Mode Toggle */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'total' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            Total Emissions
          </button>
          <button
            onClick={() => setViewMode('industry')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'industry' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            By Industry
          </button>
          <button
            onClick={() => setViewMode('country')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'country' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            By Country
          </button>
        </div>
      </motion.div>

      {/* Industry Filter (only show for industry view) */}
      {viewMode === 'industry' && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {availableIndustries.map(industry => (
            <button
              key={industry.name}
              onClick={() => toggleIndustry(industry.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedIndustries.includes(industry.name)
                  ? 'text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedIndustries.includes(industry.name) 
                  ? `${industry.color || industryColors[industry.name]}30` 
                  : 'rgba(51, 65, 85, 0.3)',
                borderColor: selectedIndustries.includes(industry.name) 
                  ? (industry.color || industryColors[industry.name])
                  : 'transparent',
                borderWidth: 1
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: industry.color || industryColors[industry.name] }}
              />
              {industry.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main Chart */}
      <motion.div variants={itemVariants}>
        {viewMode === 'total' && (
          <ChartCard 
            title="Global CO₂ Emissions Over Time" 
            subtitle="Total world emissions in Million Tonnes"
            className="h-[500px]"
          >
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={filteredTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip content={<TotalTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorTotal)"
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {viewMode === 'industry' && (
          <ChartCard 
            title="CO₂ Emissions by Industry" 
            subtitle="Compare emissions across selected industries over time"
            className="h-[500px]"
          >
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-dark-300 text-sm">{value}</span>}
                />
                {selectedIndustries.map(industry => (
                  <Line
                    key={industry}
                    type="monotone"
                    dataKey={industry}
                    stroke={industryColors[industry]}
                    strokeWidth={2}
                    dot={{ fill: '#1e293b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {viewMode === 'country' && (
          <ChartCard 
            title="CO₂ Emissions by Top Countries" 
            subtitle="Top 5 emitting countries over time"
            className="h-[500px]"
          >
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={countryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CountryTooltip trends={trends} />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-dark-300 text-sm">{getCountryName(value, trends)}</span>}
                />
                {countryCodes.slice(0, 5).map(code => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    name={code}
                    stroke={countryColors[code] || '#6b7280'}
                    strokeWidth={2}
                    dot={{ fill: '#1e293b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </motion.div>

      {/* Stacked Area Chart (only for industry view) */}
      {viewMode === 'industry' && (
        <motion.div variants={itemVariants}>
          <ChartCard 
            title="Cumulative Emissions" 
            subtitle="Stacked view of total emissions by industry"
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={filteredTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<StackedTooltip />} />
                {Object.keys(industryColors).map((industry) => (
                  <Area
                    key={industry}
                    type="monotone"
                    dataKey={industry}
                    stackId="1"
                    stroke={industryColors[industry]}
                    fill={industryColors[industry]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      )}

      {/* Year-by-Year Comparison Bar Chart */}
      <motion.div variants={itemVariants}>
        <ChartCard title="Year-by-Year Comparison" subtitle="Total CO₂ emissions per year">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b" 
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<TotalTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {filteredTrends.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === filteredTrends.length - 1 ? '#10b981' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}

// Country name helper - now uses dynamic data from API
// Builds a lookup map from the trends data which includes country names
function getCountryName(code, trends = []) {
  // Search through trends data for the country name
  for (const trend of trends) {
    const country = trend.countries?.find(c => c.code === code);
    if (country?.name) {
      return country.name;
    }
  }
  // Fallback to code if name not found
  return code;
}

function TotalTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-2">{label}</p>
      <p className="text-lens-400 font-semibold">
        {payload[0]?.value?.toLocaleString()} MT CO₂
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-dark-300">{entry.name}</span>
          </div>
          <span style={{ color: entry.color }}>
            {entry.value?.toLocaleString()} MT
          </span>
        </div>
      ))}
    </div>
  );
}

function CountryTooltip({ active, payload, label, trends = [] }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-dark-300">{getCountryName(entry.dataKey, trends)}</span>
          </div>
          <span style={{ color: entry.color }}>
            {entry.value?.toLocaleString()} MT
          </span>
        </div>
      ))}
    </div>
  );
}

function StackedTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="custom-tooltip max-w-xs">
      <p className="text-white font-medium mb-2">{label}</p>
      <p className="text-lens-400 font-semibold mb-2">
        Total: {total.toLocaleString()} MT
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {payload.reverse().map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-dark-300">{entry.name}</span>
            </div>
            <span className="text-dark-400">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
