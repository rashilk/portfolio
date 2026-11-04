import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { SplitText } from './SplitText';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="hero">
      <div className="hero__copy">
        {/* start="100%": on phones the second line sits at the very bottom of the first screen, inside
            the default "bottom 10%" no-trigger zone, so it must reveal as soon as it is on screen */}
        <SplitText type="blur-anim" delay={0.2} start="100%" className="label t-30">
          {portfolioData.name}
        </SplitText>
        <SplitText type="blur-anim" delay={0.4} start="100%" className="label t-30">
          {portfolioData.role}
        </SplitText>
      </div>
    </section>
  );
};

