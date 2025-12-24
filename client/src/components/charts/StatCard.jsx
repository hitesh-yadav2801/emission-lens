import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorClasses = {
  lens: {
    bg: 'bg-lens-500/10',
    border: 'border-lens-500/20',
    icon: 'bg-lens-500/20 text-lens-400'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'bg-purple-500/20 text-purple-400'
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/20 text-amber-400'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'bg-green-500/20 text-green-400'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'bg-red-500/20 text-red-400'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    icon: 'bg-cyan-500/20 text-cyan-400'
  }
};

export default function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const colors = colorClasses[stat.color] || colorClasses.lens;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-5 rounded-2xl border ${colors.bg} ${colors.border} backdrop-blur-sm`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <Icon size={20} />
        </div>
        {stat.change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            stat.change < 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stat.change < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {Math.abs(stat.change)}%
          </div>
        )}
      </div>
      
      <p className="text-dark-400 text-sm mb-1">{stat.title}</p>
      <p className="text-2xl font-display font-bold text-white">
        {stat.value}
        {stat.unit && (
          <span className="text-sm font-normal text-dark-400 ml-2">
            {stat.unit}
          </span>
        )}
      </p>
    </motion.div>
  );
}


