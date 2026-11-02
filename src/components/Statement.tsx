import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { SplitText } from './SplitText';

export const Statement: React.FC = () => {
  return (
    <section id="about" className="statement">
      <div className="statement__copy">
        <SplitText type="split" className="label t-30">
          {portfolioData.statement}
        </SplitText>
      </div>
    </section>
  );
};

