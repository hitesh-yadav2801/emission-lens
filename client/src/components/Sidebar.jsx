import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Factory, 
  TrendingUp, 
  Globe2, 
  Leaf,
  Search,
  Settings,
  HelpCircle,
  Flame,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'industries', label: 'Industries', icon: Factory },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'regions', label: 'Regions', icon: Globe2 },
  { id: 'gases', label: 'All Gases', icon: Flame },
  { id: 'insights', label: 'Web Insights', icon: Search },
];

const bottomItems = [
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeView, setActiveView, isOpen, setIsOpen }) {
  const handleNavClick = (id) => {
    setActiveView(id);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-lens flex items-center justify-center glow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display font-bold text-lg text-white">
            Emission<span className="text-gradient">Lens</span>
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -264 }}
        animate={{ x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024) ? -264 : 0 }}
        className={`fixed left-0 top-0 h-screen w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 flex flex-col z-50 lg:z-40 pt-16 lg:pt-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform lg:transition-none`}
      >
      {/* Logo */}
      <div className="p-6 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-lens flex items-center justify-center glow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">
              Emission<span className="text-gradient">Lens</span>
            </h1>
            <p className="text-xs text-dark-400 font-medium">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider px-3 mb-3">
          Dashboard
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-lens-500/10 text-lens-400 border border-lens-500/20'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={18} className={isActive ? 'text-lens-400' : ''} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-lens-400"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-dark-700/50 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all duration-200"
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
        
        {/* User info */}
        <div className="mt-4 p-3 rounded-xl bg-dark-800/50 border border-dark-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-lens flex items-center justify-center text-white text-sm font-semibold">
              E
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Environment Analyst</p>
              <p className="text-xs text-dark-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
    </>
  );
}


