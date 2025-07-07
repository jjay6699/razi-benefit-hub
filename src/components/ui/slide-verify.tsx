import { useState, useRef, useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SlideVerifyProps {
  onVerify: (verified: boolean) => void;
  text?: string;
  disabled?: boolean;
  reset?: boolean;
}

export const SlideVerify = ({ onVerify, text = "Slide to verify", disabled = false, reset = false }: SlideVerifyProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxPosition = 260; // Approximate width minus slider width

  useEffect(() => {
    if (reset) {
      setIsVerified(false);
      setSliderPosition(0);
      onVerify(false);
    }
  }, [reset, onVerify]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isVerified) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isVerified) return;
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = Math.max(0, Math.min(maxPosition, e.clientX - containerRect.left - 20));
      setSliderPosition(newPosition);

      if (newPosition >= maxPosition * 0.9) {
        setIsVerified(true);
        setIsDragging(false);
        onVerify(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const newPosition = Math.max(0, Math.min(maxPosition, touch.clientX - containerRect.left - 20));
      setSliderPosition(newPosition);

      if (newPosition >= maxPosition * 0.9) {
        setIsVerified(true);
        setIsDragging(false);
        onVerify(true);
      }
    };

    const handleMouseUp = () => {
      if (isDragging && !isVerified) {
        setSliderPosition(0);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isVerified, maxPosition, onVerify]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`relative h-12 bg-muted rounded-lg border-2 overflow-hidden transition-all duration-300 ${
          isVerified 
            ? 'border-green-500 bg-green-50 dark:bg-green-950' 
            : disabled 
              ? 'border-muted-foreground/20 opacity-50' 
              : 'border-border hover:border-primary/50'
        }`}
      >
        {/* Background fill */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${
            isVerified 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-primary/10'
          }`}
          style={{ 
            width: isVerified ? '100%' : `${(sliderPosition / maxPosition) * 100}%` 
          }}
        />
        
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`font-medium transition-all duration-300 ${
            isVerified 
              ? 'text-green-700 dark:text-green-300' 
              : isDragging 
                ? 'text-primary' 
                : 'text-muted-foreground'
          }`}>
            {isVerified ? 'Verified!' : text}
          </span>
        </div>
        
        {/* Slider */}
        <div
          ref={sliderRef}
          className={`absolute top-1 left-1 w-10 h-10 rounded-md transition-all duration-300 cursor-pointer select-none flex items-center justify-center ${
            isVerified
              ? 'bg-green-500 text-white'
              : disabled
                ? 'bg-muted-foreground/20 cursor-not-allowed'
                : isDragging
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-background border border-border hover:bg-accent'
          }`}
          style={{ 
            transform: `translateX(${sliderPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {isVerified ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
};