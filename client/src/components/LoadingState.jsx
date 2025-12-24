import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-lens flex items-center justify-center glow"
        >
          <Leaf className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-xl font-display font-semibold text-white mb-2">
          Loading Emissions Data
        </h2>
        <p className="text-dark-400 text-sm">
          Analyzing global emissions across industries...
        </p>
        
        <div className="mt-6 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-lens-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}


