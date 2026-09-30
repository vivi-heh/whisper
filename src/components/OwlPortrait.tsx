/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface OwlPortraitProps {
  className?: string;
  size?: number;
}

export const OwlPortrait: React.FC<OwlPortraitProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dark background circle */}
      <circle cx="50" cy="50" r="46" fill="#18130e" stroke="#3d3024" strokeWidth="3" />

      {/* Owl body & chest feathers */}
      <ellipse cx="50" cy="62" rx="28" ry="32" fill="#2d251d" stroke="#120e0a" strokeWidth="2.5" />
      <path
        d="M32 50 C38 65, 42 75, 50 82 C58 75, 62 65, 68 50"
        fill="#ded4c0"
        stroke="#120e0a"
        strokeWidth="2"
      />
      {/* Chest feather flecks */}
      <path d="M44 58 L48 64 L46 68" stroke="#3d3024" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 58 L56 64 L54 68" stroke="#3d3024" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 70 L52 76" stroke="#3d3024" strokeWidth="1.5" strokeLinecap="round" />

      {/* Facial disk (Heart/Circle shape) */}
      <circle cx="40" cy="38" r="14" fill="#eedec5" stroke="#120e0a" strokeWidth="2" />
      <circle cx="60" cy="38" r="14" fill="#eedec5" stroke="#120e0a" strokeWidth="2" />

      {/* Ear tufts */}
      <path d="M28 26 L36 12 L42 26 Z" fill="#2d251d" stroke="#120e0a" strokeWidth="2" />
      <path d="M72 26 L64 12 L58 26 Z" fill="#2d251d" stroke="#120e0a" strokeWidth="2" />

      {/* Piercing Amber Eyes */}
      <circle cx="40" cy="38" r="7" fill="#d4af37" stroke="#120e0a" strokeWidth="1.5" />
      <circle cx="60" cy="38" r="7" fill="#d4af37" stroke="#120e0a" strokeWidth="1.5" />
      {/* Pupils */}
      <circle cx="40" cy="38" r="3.2" fill="#0d0a08" />
      <circle cx="60" cy="38" r="3.2" fill="#0d0a08" />
      {/* Eye highlights */}
      <circle cx="38.5" cy="36.5" r="1.2" fill="#ffffff" />
      <circle cx="58.5" cy="36.5" r="1.2" fill="#ffffff" />

      {/* Sharp Raptor Beak */}
      <path d="M48 40 L52 40 L50 50 Z" fill="#c49339" stroke="#120e0a" strokeWidth="1.8" />
    </svg>
  );
};
