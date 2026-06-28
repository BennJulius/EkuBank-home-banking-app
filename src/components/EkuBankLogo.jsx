import React from 'react';

const EkuBankLogo = ({ size = 80, color = '#0A2540', withDot = false }) => {
  // EkuBank logo: A premium-looking shield icon with a stylized "E" inside, and clean typography.
  // Perfectly fits a 320x100 viewport (aspect ratio 3.2:1)
  const isWhite = color === '#ffffff';
  const iconColor = isWhite ? '#38BDF8' : '#0284C7'; // Cyan for white background, Ocean blue for dark background
  const textColor = isWhite ? '#ffffff' : '#072146'; // White or Dark Navy
  
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size * 0.3125}
        viewBox="0 0 320 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="EkuBank"
      >
        {/* Shield Background / Border */}
        <path
          d="M50 90C50 90 85 72.5 85 47.5V20L50 5L15 20V47.5C15 72.5 50 90 50 90Z"
          fill={iconColor}
          opacity="0.15"
        />
        {/* Shield Solid Emblem */}
        <path
          d="M50 85C50 85 80 69.5 80 47.5V23L50 9L20 23V47.5C20 69.5 50 85 50 85Z"
          fill={iconColor}
        />
        {/* Stylized White "E" inside the shield */}
        <path
          d="M38 32H62V40H46V46H58V54H46V60H62V68H38V32Z"
          fill="#ffffff"
        />
        
        {/* Premium typography layout for EkuBank */}
        <text
          x="95"
          y="62"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="36"
          fill={textColor}
          letterSpacing="0.5px"
        >
          Eku
          <tspan fill={isWhite ? '#38BDF8' : '#0284C7'} fontWeight="400">
            Bank
          </tspan>
        </text>
      </svg>
      {withDot && <span className="w-2 h-2 rounded-full bg-[#38BDF8] shrink-0 animate-pulse" />}
    </span>
  );
};

export default EkuBankLogo;
