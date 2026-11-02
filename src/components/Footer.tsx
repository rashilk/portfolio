import React from 'react';
import { Monogram } from './Monogram';

interface FooterProps {
  onHomeClick?: (e: React.MouseEvent) => void;
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onHomeClick }) => {
  return (
    <footer className="footer">
      <Monogram onHomeClick={onHomeClick} />
    </footer>
  );
};

