import React from 'react';

interface NeutralIconProps {
  className?: string;
}

export const NeutralIcon: React.FC<NeutralIconProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};
