'use client';

import React, { useEffect, useState } from 'react';

const Background = () => {
  const [particles, setParticles] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const numParticles = 50;
    const newParticles: React.JSX.Element[] = [];
    if (typeof window !== 'undefined') {
      for (let i = 0; i < numParticles; i++) {
        const style = {
          '--x-start': `${Math.random() * 100}vw`,
          '--y-start': `${Math.random() * 100}vh`,
          '--x-end': `${Math.random() * 100}vw`,
          '--y-end': `${Math.random() * 100}vh`,
          animation: `particle-flow ${Math.random() * 10 + 10}s linear infinite`,
          animationDelay: `-${Math.random() * 20}s`,
        } as React.CSSProperties;
        newParticles.push(<div key={i} className="particle" style={style} />);
      }
      setParticles(newParticles);
    }
  }, []);

  return <div className="fixed inset-0 -z-10 h-full w-full">{particles}</div>;
};

export default Background;
