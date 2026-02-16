import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Radio } from 'lucide-react';
import logo from 'figma:asset/9d22ff3a7bbfe67f3b8c6b7e77ec7472e366e19e.png';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Shows', path: '/shows' },
  { name: 'Listen', path: '/listen' },
  { name: 'News', path: '/news' },
  { name: 'Events', path: '/events' },
  { name: 'Get Involved', path: '/get-involved' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#d4af37]/20 shadow-2xl shadow-[#d4af37]/5' 
          : 'bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-[#d4af37]/10'
      }`}
    >
      <div className="container mx-auto px-6">
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
        
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/10 to-[#d4af37]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img 
              src={logo} 
              alt="Resistance Radio" 
              className={`transition-all duration-300 relative z-10 ${scrolled ? 'h-10' : 'h-12'}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-2 transition-colors duration-300 ${
                  isActive(item.path)
                    ? 'text-[#d4633f]'
                    : 'text-[#f5f5f5] hover:text-[#d4633f]'
                }`}
              >
                <span>{item.name}</span>
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#d4633f] to-[#d4af37]" />
                )}
              </Link>
            ))}
          </div>

          {/* Live Button */}
          <Link
            to="/listen"
            className="hidden lg:flex items-center gap-2 px-6 py-3 bg-[#d4633f] text-[#f5f5f5] rounded-full hover:bg-[#d4633f]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#d4633f]/50"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </div>
            <Radio className="w-4 h-4" />
            <span className="font-medium">Listen Live</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[#f5f5f5] hover:text-[#d4633f] transition-colors p-2 relative z-50"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-[#f5f5f5]/10 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'text-[#d4633f] bg-[#d4633f]/10'
                    : 'text-[#f5f5f5] hover:text-[#d4633f] hover:bg-[#f5f5f5]/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/listen"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-[#d4633f] text-[#f5f5f5] rounded-full"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </div>
              <Radio className="w-4 h-4" />
              <span className="font-medium">Listen Live</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}