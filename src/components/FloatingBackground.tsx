import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Briefcase, Coins, LineChart, PieChart, Wallet, Landmark } from 'lucide-react';

const ICONS = [DollarSign, TrendingUp, Briefcase, Coins, LineChart, PieChart, Wallet, Landmark];

const Taximeter = ({ size }: { size: number }) => {
  const [value, setValue] = useState(Math.random() * 5000 + 1000);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + Math.random() * 50);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{ fontSize: size * 0.6 }} className="font-mono font-bold whitespace-nowrap">
      R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};

const FloatingElement = ({ id, total }: { id: number, total: number }) => {
  const isIcon = Math.random() > 0.4;
  const isTaximeter = !isIcon && Math.random() > 0.5;
  const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  
  // Distribute evenly across a grid to ensure they are spread out
  const cols = Math.ceil(Math.sqrt(total * (16/9))); // Aspect ratio adjustment for typical screens
  const rows = Math.ceil(total / cols);
  
  const col = id % cols;
  const row = Math.floor(id / cols);
  
  const cellWidth = 120 / cols;
  const cellHeight = 120 / rows;
  
  // Start position within its grid cell (with some overflow -10vw to 110vw)
  const startX = -10 + (col * cellWidth) + (Math.random() * cellWidth);
  const startY = -10 + (row * cellHeight) + (Math.random() * cellHeight);
  
  const directionType = Math.floor(Math.random() * 3);
  let endX = startX;
  let endY = startY;
  
  const distance = 30 + Math.random() * 50;
  
  if (directionType === 0) {
    // Horizontal
    endX = startX + (Math.random() > 0.5 ? distance : -distance);
    endY = startY + (Math.random() * 20 - 10);
  } else if (directionType === 1) {
    // Vertical
    endX = startX + (Math.random() * 20 - 10);
    endY = startY + (Math.random() > 0.5 ? distance : -distance);
  } else {
    // Diagonal
    endX = startX + (Math.random() > 0.5 ? distance : -distance);
    endY = startY + (Math.random() > 0.5 ? distance : -distance);
  }

  const duration = 20 + Math.random() * 40; // 20s to 60s
  const delay = Math.random() * -60; // Negative delay so they start already in motion
  const size = 30 + Math.random() * 80; 
  const blur = 3 + Math.random() * 10; 
  const opacity = 0.03 + Math.random() * 0.15; 

  return (
    <motion.div
      className="absolute pointer-events-none select-none flex items-center justify-center text-emerald-500"
      initial={{ 
        x: `${startX}vw`, 
        y: `${startY}vh`,
        opacity: 0,
        rotate: Math.random() * 360
      }}
      animate={{ 
        x: [`${startX}vw`, `${endX}vw`], 
        y: [`${startY}vh`, `${endY}vh`],
        opacity: [0, opacity, opacity, 0],
        rotate: Math.random() * 360 + (Math.random() > 0.5 ? 360 : -360)
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "linear",
        delay
      }}
      style={{
        filter: `blur(${blur}px)`,
        zIndex: 0
      }}
    >
      {isIcon ? (
        <Icon size={size} strokeWidth={1.5} />
      ) : isTaximeter ? (
        <Taximeter size={size} />
      ) : (
        <span style={{ fontSize: size * 0.7 }} className="font-mono font-bold whitespace-nowrap">
          +{Math.floor(Math.random() * 500)}%
        </span>
      )}
    </motion.div>
  );
};

export const FloatingBackground = () => {
  const [elements, setElements] = useState<number[]>([]);
  const TOTAL_ELEMENTS = 45;

  useEffect(() => {
    // Generate elements on client side to avoid hydration mismatch
    const elms = Array.from({ length: TOTAL_ELEMENTS }, (_, i) => i);
    setElements(elms);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808] z-10" />
      {elements.map(id => (
        <FloatingElement key={id} id={id} total={TOTAL_ELEMENTS} />
      ))}
    </div>
  );
};
