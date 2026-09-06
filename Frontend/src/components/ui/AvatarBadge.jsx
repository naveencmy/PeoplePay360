import React from 'react';

const AvatarBadge = ({ name = 'Unknown User', size = 'md', src }) => {
  const getInitials = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getHashColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Keep lightness and saturation in a visible range for dark mode
    return `hsl(${h}, 65%, 45%)`;
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  const sizeClass = sizes[size] || sizes.md;
  const bgColor = src ? 'transparent' : getHashColor(name);

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ring-2 ring-surface-2 ring-offset-0 transition-all duration-150 ${sizeClass}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-white select-none drop-shadow-sm">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

export { AvatarBadge };

export default AvatarBadge;
