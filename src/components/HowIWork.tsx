import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { SplitText } from './SplitText';

export const HowIWork: React.FC = () => {
  return (
    <section id="approach" className="howIWork">
      <div className="howIWork__content">
        <SplitText type="split" className="label t-30 howIWork__line">
          {portfolioData.workPhilosophy}
        </SplitText>
      </div>
    </section>
  );
};

