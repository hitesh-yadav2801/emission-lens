import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Flame, Wind, Droplets, Atom, TrendingUp, Globe } from 'lucide-react';

const GAS_COLORS = {
  co2: '#64748b',
  ch4: '#f97316',
  n2o: '#06b6d4',
  co2e_100yr: '#8b5cf6',
  co2e_20yr: '#ec4899'
};

const GAS_ICONS = {
  co2: Flame,
  ch4: Wind,
  n2o: Droplets,
  co2e_100yr: Atom,
  co2e_20yr: TrendingUp
};

export default function GasesView({ yearRange, onYearChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGas, setSelectedGas] = useState('co2e_100yr');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'chart'

  useEffect(() => {
    fetchGasesData();
  }, [yearRange]);

  const fetchGasesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        since: yearRange?.since || 2023,
        to: yearRange?.to || 2023,
        limit: 30
      });
      
      const response = await fetch(`/api/emissions/gases?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch gases data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lens-400"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-dark-400">
        Failed to load gas emissions data
      </div>
    );
  }

  const gasTypes = [
    { key: 'co2', label: 'CO₂', fullName: 'Carbon Dioxide', color: GAS_COLORS.co2 },
    { key: 'ch4', label: 'CH₄', fullName: 'Methane', color: GAS_COLORS.ch4 },
    { key: 'n2o', label: 'N₂O', fullName: 'Nitrous Oxide', color: GAS_COLORS.n2o },
    { key: 'co2e_100yr', label: 'CO₂e (100yr)', fullName: 'CO₂ Equivalent (100yr GWP)', color: GAS_COLORS.co2e_100yr },
    { key: 'co2e_20yr', label: 'CO₂e (20yr)', fullName: 'CO₂ Equivalent (20yr GWP)', color: GAS_COLORS.co2e_20yr }
  ];

  // Prepare chart data
  const chartData = data.countries?.slice(0, 15).map(c => ({
    name: c.name,
    co2: c.gases.co2.value,
    ch4: c.gases.ch4.value,
    n2o: c.gases.n2o.value,
    co2e_100yr: c.gases.co2e_100yr.value,
    co2e_20yr: c.gases.co2e_20yr.value
  })) || [];

  // World totals pie chart data
  const pieData = gasTypes.slice(0, 3).map(g => ({
    name: g.fullName,
    value: data.worldTotals?.[g.key]?.value || 0,
    color: g.color
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            All Greenhouse Gas Emissions
          </h1>
          <p className="text-dark-400">
            Comprehensive view of CO₂, CH₄, N₂O, and CO₂ equivalent emissions by country
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-dark-400">
            Data Year: <span className="text-white font-semibold">{data.year}</span>
          </div>
          <div className="text-xs px-3 py-1 bg-lens-500/20 text-lens-300 rounded-full">
            {data.source}
          </div>
        </div>
      </div>

      {/* World Totals Cards */}
      <div className="grid grid-cols-5 gap-4">
        {gasTypes.map((gas, index) => {
          const Icon = GAS_ICONS[gas.key];
          const total = data.worldTotals?.[gas.key];
          
          return (
            <motion.div
              key={gas.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedGas(gas.key)}
              className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-4 border cursor-pointer transition-all
                ${selectedGas === gas.key 
                  ? 'border-lens-400 ring-2 ring-lens-400/20' 
                  : 'border-dark-700/50 hover:border-dark-600'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${gas.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: gas.color }} />
                </div>
                <span className="text-sm font-medium text-dark-300">{gas.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {total?.value?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-dark-400">{total?.unit || 'Mt'}</div>
            </motion.div>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'table' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'chart' ? 'bg-lens-500 text-white' : 'text-dark-400 hover:text-white'}`}
          >
            Chart View
          </button>
        </div>
        
        <div className="text-sm text-dark-400">
          Showing: <span className="text-white font-medium">
            {gasTypes.find(g => g.key === selectedGas)?.fullName}
          </span>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Data Table */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-4 text-dark-400 font-medium text-sm">Rank</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium text-sm">Country</th>
                  {gasTypes.map(gas => (
                    <th 
                      key={gas.key}
                      onClick={() => setSelectedGas(gas.key)}
                      className={`text-right py-4 px-4 font-medium text-sm cursor-pointer transition-colors
                        ${selectedGas === gas.key ? 'text-lens-400' : 'text-dark-400 hover:text-white'}`}
                    >
                      {gas.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.countries?.map((country, index) => (
                  <motion.tr
                    key={country.country}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-dark-700/50 hover:bg-dark-700/30"
                  >
                    <td className="py-3 px-4 text-dark-400 font-mono text-sm">
                      {country.rank || index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{country.name}</span>
                        <span className="text-dark-500 text-xs">{country.country}</span>
                      </div>
                    </td>
                    {gasTypes.map(gas => (
                      <td 
                        key={gas.key}
                        className={`py-3 px-4 text-right font-mono text-sm
                          ${selectedGas === gas.key ? 'text-white font-semibold' : 'text-dark-300'}`}
                      >
                        {country.gases[gas.key]?.value?.toLocaleString() || 0}
                        <span className="text-dark-500 text-xs ml-1">
                          {country.gases[gas.key]?.unit || 'Mt'}
                        </span>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Chart View */
        <div className="grid grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Top 15 Countries - {gasTypes.find(g => g.key === selectedGas)?.fullName}
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#9ca3af" 
                    fontSize={11}
                    width={100}
                    tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [value.toLocaleString(), gasTypes.find(g => g.key === selectedGas)?.label]}
                  />
                  <Bar 
                    dataKey={selectedGas} 
                    fill={GAS_COLORS[selectedGas]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart - Gas Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Global Gas Type Distribution
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => value.toLocaleString()}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-dark-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 bg-dark-800/50 backdrop-blur-sm rounded-xl border border-dark-700/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Gas Type Comparison
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {gasTypes.map(gas => {
                const total = data.worldTotals?.[gas.key];
                const topCountry = data.countries?.[0];
                const topEmission = topCountry?.gases[gas.key];
                
                return (
                  <div 
                    key={gas.key}
                    className="p-4 rounded-lg border border-dark-700/50"
                    style={{ borderColor: `${gas.color}40` }}
                  >
                    <div className="text-sm font-medium mb-2" style={{ color: gas.color }}>
                      {gas.fullName}
                    </div>
                    <div className="text-xl font-bold text-white mb-1">
                      {total?.value?.toLocaleString() || 0} {total?.unit}
                    </div>
                    <div className="text-xs text-dark-400">
                      Top: {topCountry?.name} ({topEmission?.value?.toLocaleString()} {topEmission?.unit})
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="flex items-center justify-between text-sm text-dark-500 pt-4 border-t border-dark-700/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>Source: {data.source}</span>
        </div>
        <div>
          Last Updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

