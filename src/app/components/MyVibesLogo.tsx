import React from 'react';

interface MyVibesLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

interface MyVibesIconProps {
  size?: number;
  variant?: 'default' | 'white';
}

export function MyVibesIcon({ size = 48, variant = 'default' }: MyVibesIconProps) {
  const barHeights = [
    size * 0.5,   // 24px at size 48
    size * 0.67,  // 32px at size 48
    size * 0.42,  // 20px at size 48
    size * 0.75,  // 36px at size 48
    size * 0.5,   // 24px at size 48
  ];
  
  return (
    <div className="relative flex items-center gap-0.5" style={{ height: size }}>
      <div 
        className={`w-1 rounded-full ${
          variant === 'white' 
            ? 'bg-white shadow-lg shadow-white/30' 
            : 'bg-gradient-to-t from-orange-500 to-pink-500'
        }`}
        style={{ height: barHeights[0] }}
      />
      <div 
        className={`w-1 rounded-full ${
          variant === 'white' 
            ? 'bg-white shadow-lg shadow-white/30' 
            : 'bg-gradient-to-t from-purple-500 to-blue-500'
        }`}
        style={{ height: barHeights[1] }}
      />
      <div 
        className={`w-1 rounded-full ${
          variant === 'white' 
            ? 'bg-white shadow-lg shadow-white/30' 
            : 'bg-gradient-to-t from-orange-500 to-purple-600'
        }`}
        style={{ height: barHeights[2] }}
      />
      <div 
        className={`w-1 rounded-full ${
          variant === 'white' 
            ? 'bg-white shadow-lg shadow-white/30' 
            : 'bg-gradient-to-t from-blue-500 to-cyan-500'
        }`}
        style={{ height: barHeights[3] }}
      />
      <div 
        className={`w-1 rounded-full ${
          variant === 'white' 
            ? 'bg-white shadow-lg shadow-white/30' 
            : 'bg-gradient-to-t from-purple-500 to-pink-500'
        }`}
        style={{ height: barHeights[4] }}
      />
    </div>
  );
}

export function MyVibesLogo({ className = '', variant = 'default' }: MyVibesLogoProps) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Logo Icon - Sound wave/vibe visualization */}
      <MyVibesIcon size={48} variant={variant} />
      
      {/* Logo Text */}
      <div className="flex flex-col leading-none">
        <span className={`text-2xl font-black tracking-tight ${
          variant === 'white' 
            ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' 
            : 'bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 bg-clip-text text-transparent'
        }`}>
          MYVIBES
        </span>
        <span className={`text-[0.5rem] font-semibold tracking-widest uppercase ${
          variant === 'white' ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : 'text-gray-600'
        }`}>
          Hospitality
        </span>
      </div>
    </div>
  );
}

// Default export for convenience
export default MyVibesLogo;