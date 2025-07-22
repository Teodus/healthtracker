import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipePanelsProps {
  panels: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
  currentPanel: number;
  onPanelChange: (index: number) => void;
  className?: string;
}

export function SwipePanels({ panels, currentPanel, onPanelChange, className }: SwipePanelsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setOffsetX(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setOffsetX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    let newPanel = currentPanel;
    
    if (offsetX > threshold && currentPanel > 0) {
      newPanel = currentPanel - 1;
    } else if (offsetX < -threshold && currentPanel < panels.length - 1) {
      newPanel = currentPanel + 1;
    }
    
    onPanelChange(newPanel);
    setIsDragging(false);
    setOffsetX(0);
  };

  const transform = isDragging 
    ? `translateX(calc(-${currentPanel * 100}% + ${offsetX}px))`
    : `translateX(-${currentPanel * 100}%)`;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out"
        style={{ transform }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="w-full flex-shrink-0 px-4"
          >
            {panel.content}
          </div>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {panels.map((_, index) => (
          <button
            key={index}
            onClick={() => onPanelChange(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              index === currentPanel 
                ? "bg-primary scale-125" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to panel ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}