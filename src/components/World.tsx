import React, { useEffect, useRef, useState } from 'react';

export const World: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const update = () => setSize(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const center = size / 2;
  const radius = 0.46 * size;

  return (
    <section id="world" className="world">
      <svg
        ref={svgRef}
        className="world__ring"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {size > 0 && (
          <>
            <defs>
              <path
                id="ring-top"
                d={`M ${center - radius},${center} A ${radius},${radius} 0 0 1 ${center + radius},${center}`}
              />
              <path
                id="ring-bottom"
                d={`M ${center + radius},${center} A ${radius},${radius} 0 0 1 ${center - radius},${center}`}
              />
            </defs>
            <text className="world__ringText" textAnchor="middle">
              <textPath href="#ring-top" startOffset="50%">
                Working globally
              </textPath>
            </text>
            <text className="world__ringText" textAnchor="middle">
              <textPath href="#ring-bottom" startOffset="50%">
                Working globally
              </textPath>
            </text>
          </>
        )}
      </svg>
    </section>
  );
};

