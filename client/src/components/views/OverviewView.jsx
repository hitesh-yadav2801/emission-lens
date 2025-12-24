import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  TrendingUp, 
  Factory, 
  Globe2, 
  Zap,
  Users
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import StatCard from '../charts/StatCard';
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

export default function OverviewView({ data, yearRange }) {
  if (!data) return null;

  const { summary, industries = [], trends = [], regions = [], countries = [] } = data;

  // Format industries for charts
  const industryData = industries.map(ind => ({
    name: ind.name,
    emissions: ind.totalEmissions || 0,
    percentage: parseFloat(ind.percentage) || 0,
    color: ind.color || '#6b7280'
  }));

  // Format trends for charts
  const trendData = trends.map(t => ({
    year: t.year,
    total: t.total || 0
  }));

  // Format regions for pie chart
  const regionData = regions.map(r => ({
    name: r.name,
    emissions: r.emissions || 0,
    percentage: parseFloat(r.percentage) || 0,
    color: r.color || '#6b7280'
  }));

  const stats = [
    {
      title: 'Total CO₂ Emissions',
      value: summary.totalEmissions >= 1000 
        ? `${(summary.totalEmissions / 1000).toFixed(1)}B` 
        : `${summary.totalEmissions?.toLocaleString()}`,
      unit: 'MT CO₂',
      change: summary.changeFromLastYear,
      icon: Factory,
      color: 'lens'
    },
    {
      title: 'Countries Tracked',
      value: summary.totalCountries || countries.length || 0,
      unit: 'countries',
      icon: Globe2,
      color: 'purple'
    },
    {
      title: 'Top Emitter',
      value: countries[0]?.country || summary.topIndustry?.name || 'Energy',
      unit: `${countries[0]?.share_global_co2?.toFixed(1) || 0}% share`,
      icon: Zap,
      color: 'amber'
    },
    {
      title: 'Year-over-Year',
      value: `${summary.changeFromLastYear > 0 ? '+' : ''}${summary.changeFromLastYear || 0}%`,
      unit: `vs ${(summary.year || 2023) - 1}`,
      trend: summary.changeFromLastYear < 0 ? 'down' : 'up',
      icon: summary.changeFromLastYear < 0 ? TrendingDown : TrendingUp,
      color: summary.changeFromLastYear < 0 ? 'green' : 'red'
    }
  ];

  const yearDisplay = yearRange?.since === yearRange?.to 
    ? yearRange?.to 
    : `${yearRange?.since} - ${yearRange?.to}`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              CO₂ Emissions <span className="text-gradient">Overview</span>
            </h1>
            <p className="text-dark-400">
              Global carbon dioxide emissions dashboard — {yearDisplay} data
            </p>
          </div>
          {summary.source && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lens-500/10 border border-lens-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-lens-400 font-medium">
                {summary.source}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions by Region Pie Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <ChartCard title="By Region" subtitle="Distribution of CO₂ emissions">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="emissions"
                  nameKey="name"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {regionData.slice(0, 6).map((region) => (
                <div key={region.name} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-dark-300 truncate">{region.name}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* Emissions Trend Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard title="Historical Trend" subtitle="Total CO₂ emissions over time (MT)">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      {/* Charts Row 2 - Industries */}
      {industryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry Pie Chart */}
          <motion.div variants={itemVariants}>
            <ChartCard title="By Industry" subtitle="CO₂ emissions by sector">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="emissions"
                    nameKey="name"
                    label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}
                    labelLine={false}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>

          {/* Industry Bar Chart */}
          <motion.div variants={itemVariants}>
            <ChartCard title="Industry Breakdown" subtitle="Emissions by industry (MT CO₂)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={industryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11}
                    width={100}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="emissions" 
                    radius={[0, 4, 4, 0]}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>
      )}

      {/* Top Countries */}
      {countries && countries.length > 0 && (
        <motion.div variants={itemVariants}>
          <ChartCard title="Top Emitting Countries" subtitle={`Real CO₂ data from ${yearDisplay} (Million Tonnes)`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-dark-700">
                    <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Rank</th>
                    <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Country</th>
                    <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">CO₂ Emissions</th>
                    <th className="pb-3 text-xs font-semibold text-dark-400 uppercase tracking-wider text-right">% Global</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.slice(0, 15).map((country, index) => (
                    <tr 
                      key={country.iso_code || index}
                      className="border-b border-dark-800 hover:bg-dark-800/30 transition-colors"
                    >
                      <td className="py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 ? 'bg-lens-500/20 text-lens-400' : 'bg-dark-700 text-dark-300'
                        }`}>
                          {country.rank || index + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{country.country}</span>
                          <span className="text-dark-500 text-xs">{country.iso_code}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-white font-mono">
                          {country.co2?.toLocaleString()}
                        </span>
                        <span className="text-dark-500 text-sm ml-1">MT</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-lens-400 font-medium">
                          {country.share_global_co2?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </motion.div>
      )}

      {/* Data Source Info */}
      <motion.div variants={itemVariants}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-semibold text-white mb-1">
                Data Source
              </h3>
              <p className="text-dark-400 text-sm">
                Real emissions data from <span className="text-lens-400">{summary.source || 'Climate TRACE'}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-lg">{yearDisplay}</p>
              <p className="text-dark-500 text-xs">Selected period</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{summary.totalEmissions?.toLocaleString()}</p>
              <p className="text-xs text-dark-400">Million Tonnes CO₂</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{countries?.length || summary.totalCountries || 0}</p>
              <p className="text-xs text-dark-400">Countries Tracked</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${summary.changeFromLastYear < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.changeFromLastYear > 0 ? '+' : ''}{summary.changeFromLastYear || 0}%
              </p>
              <p className="text-xs text-dark-400">YoY Change</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-lens-400">{regions?.length || 0}</p>
              <p className="text-xs text-dark-400">Regions</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' 
            ? entry.value.toLocaleString() 
            : entry.value}
          {entry.dataKey === 'percentage' ? '%' : ' MT'}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="custom-tooltip">
      <p className="text-white font-medium">{data.name}</p>
      <p className="text-sm text-dark-300">
        {data.value.toLocaleString()} MT CO₂
      </p>
      <p className="text-sm" style={{ color: data.payload.color }}>
        {data.payload.percentage}% of total
      </p>
    </div>
  );
}
