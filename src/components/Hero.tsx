import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { SplitText } from './SplitText';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="hero">
      <div className="hero__copy">
        <SplitText type="blur-anim" delay={0.2} className="label t-30">
          {portfolioData.name}
        </SplitText>
        <SplitText type="blur-anim" delay={0.4} className="label t-30">
          {portfolioData.role}
        </SplitText>
      </div>
    </section>
  );
};

