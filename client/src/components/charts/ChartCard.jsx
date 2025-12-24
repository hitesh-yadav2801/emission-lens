import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <motion.div
      className={`glass rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-display font-semibold text-white text-lg">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-dark-400 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}


