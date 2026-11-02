import React from 'react';
import { portfolioData } from '../data/portfolioData';

export const Italy: React.FC = () => {
  return (
    <section id="location" className="italy">
      <p className="label t-30 italy__label">{portfolioData.location}</p>
    </section>
  );
};

