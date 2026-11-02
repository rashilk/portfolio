import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';

interface MonogramProps {
  onHomeClick?: (e: React.MouseEvent) => void;
}

export const Monogram: React.FC<MonogramProps> = ({ onHomeClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      className="monogram__wrap"
      data-hovered={hovered}
      href="/"
      onClick={onHomeClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="monogram__tooltip t-20" data-visible={hovered}>
        hey there!
      </span>
      <svg viewBox="0 0 686 850" aria-hidden="true" className="monogram__svg">
        <g className="monogram__swirl">
          <path
            fillRule="evenodd"
            d="M80,780V70H330C500,70,600,160,600,290C600,400,530,470,430,495L610,780H440L280,520H240V780ZM240,200V400H320C390,400,430,360,430,300C430,240,390,200,320,200Z"
          />
        </g>
        <g className="monogram__mark">
          <circle cx="335" cy="300" r="45" className="monogram__markCircle" />
        </g>
      </svg>
      <p className="footer__line t-16">
        {portfolioData.name} - © {portfolioData.copyrightYear}
      </p>
    </a>
  );
};

