import React from 'react';

export default function DeliveryRiderSVG({ className, style, showSpeedTrails = true }) {
  return (
    <svg 
      className={className} 
      style={style} 
      viewBox="-100 -20 500 320" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wind Speed Trails */}
      {showSpeedTrails && (
        <g opacity="0.9">
          <rect x="-80" y="80" width="120" height="4" rx="2" fill="#cbd5e1" opacity="0.6"/>
          <rect x="-30" y="100" width="70" height="4" rx="2" fill="#60a5fa" opacity="0.8"/>
          <rect x="-60" y="120" width="100" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="-90" y="140" width="80" height="4" rx="2" fill="#3b82f6" opacity="0.7"/>
          
          <rect x="-40" y="180" width="80" height="4" rx="2" fill="#cbd5e1" opacity="0.6"/>
          <rect x="-10" y="220" width="50" height="4" rx="2" fill="#60a5fa" />
          <rect x="-50" y="240" width="90" height="4" rx="2" fill="#94a3b8" opacity="0.5"/>
          <rect x="-70" y="260" width="110" height="4" rx="2" fill="#3b82f6" opacity="0.7"/>
        </g>
      )}
      {/* Wheels */}
      <circle cx="110" cy="240" r="35" fill="#1e293b" />
      <circle cx="110" cy="240" r="16" fill="#f8fafc" />
      
      <circle cx="310" cy="240" r="35" fill="#1e293b" />
      <circle cx="310" cy="240" r="16" fill="#f8fafc" />
      
      {/* Scooter Chassis Back/Bottom/Seat */}
      {/* Main body back */}
      <path d="M50 190 Q 50 140 150 150 L 150 230 L 60 230 C 40 230 40 190 50 190 Z" fill="#ffffff" />
      {/* Floorboard */}
      <rect x="120" y="210" width="130" height="20" rx="10" fill="#0f172a" />
      {/* Seat */}
      <rect x="130" y="145" width="80" height="15" rx="5" fill="#0f172a" />
      
      {/* Scooter Front */}
      <path d="M250 130 C 270 120 310 130 350 190 C 370 220 360 240 340 240 L 250 240 Z" fill="#ffffff" />
      {/* Steering column */}
      <path d="M260 140 L 240 90 L 260 85 L 280 130 Z" fill="#334155" /> 
      {/* Handlebar cover / dash */}
      <circle cx="250" cy="85" r="18" fill="#1e293b" />
      <path d="M245 80 L 210 100 L 215 105 L 250 85 Z" fill="#0f172a" />
      {/* Headlight */}
      <circle cx="355" cy="180" r="15" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
      <path d="M355 165 C 365 165 375 175 370 185 Z" fill="#e2e8f0" />
      <circle cx="360" cy="180" r="8" fill="#fef08a" />
      
      {/* Front Mudguard */}
      <path d="M270 200 Q 310 190 340 220 L 280 235 Z" fill="#f1f5f9" />

      {/* Rider's Body */}
      {/* Legs (Black Pants) */}
      <path d="M175 145 L 210 145 C 220 145 230 150 235 160 L 255 200 L 235 205 L 215 170 L 180 170 C 170 170 160 160 165 145 Z" fill="#0f172a" />
      {/* Shoe */}
      <path d="M230 200 L 260 200 C 265 200 270 205 270 210 L 230 210 Z" fill="#ffffff" />
      
      {/* Shirt (White) */}
      <path d="M150 80 Q 200 60 210 120 C 215 140 180 150 160 150 L 145 150 C 130 150 140 100 150 80 Z" fill="#f8fafc" />
      {/* Arm */}
      <path d="M190 90 C 210 100 230 110 240 110 C 245 110 245 100 235 100 C 220 100 200 85 190 90 Z" fill="#fbc7a9" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />
      {/* Hand */}
      <circle cx="225" cy="100" r="10" fill="#fbc7a9" />

      {/* Head & Helmet */}
      {/* Neck */}
      <rect x="165" y="60" width="15" height="20" fill="#fbc7a9" />
      {/* Face */}
      <circle cx="185" cy="50" r="18" fill="#fbc7a9" />
      {/* Mask (White) */}
      <path d="M185 40 C 210 40 205 65 185 65 Z" fill="#ffffff" />
      {/* Eye dot */}
      <circle cx="180" cy="45" r="2.5" fill="#0f172a" />
      {/* Helmet (Blue) */}
      <path d="M155 50 C 150 20 195 10 200 35 C 200 45 190 40 180 40 C 170 40 160 55 165 65 Z" fill="#1e3a8a" />
      <circle cx="165" cy="45" r="5" fill="#94a3b8" />
      
      {/* Delivery Box (White) */}
      {/* Groceries inside (back rendering) */}
      {/* Baguette */}
      <path d="M80 70 L 60 20 Q 65 10 85 60 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <path d="M68 25 L 75 30 M 72 40 L 80 45" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      {/* Greens */}
      <path d="M90 70 Q 85 20 105 30 C 115 40 110 60 95 70 Z" fill="#4ade80" />
      <path d="M100 70 Q 110 30 120 40 C 125 50 115 65 100 70 Z" fill="#22c55e" />
      {/* Water Bottle */}
      <path d="M125 70 L 115 30 C 115 25 125 25 125 30 Z" fill="#38bdf8" />
      <rect x="117" y="27" width="6" height="4" fill="#64748b" />
      <rect x="116" y="45" width="8" height="10" fill="#ffffff" />

      {/* Box main structure */}
      <rect x="60" y="65" width="80" height="80" rx="4" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="3" />
      <rect x="60" y="95" width="80" height="6" fill="#1e3a8a" opacity="0.8" />
      <rect x="96" y="65" width="6" height="80" fill="#1e3a8a" opacity="0.8" />

      {/* Box lid styling slightly open */}
      <path d="M60 65 L 140 65 L 145 75 L 55 75 Z" fill="#e2e8f0" />
      
      {/* Additional speed lines on the scooter itself for motion feel */}
      {showSpeedTrails && (
        <>
          <rect x="50" y="195" width="20" height="2" fill="#cbd5e1" rx="1" />
          <rect x="60" y="205" width="30" height="2" fill="#cbd5e1" rx="1" />
          <rect x="250" y="160" width="15" height="2" fill="#cbd5e1" rx="1" />
        </>
      )}
    </svg>
  );
}
