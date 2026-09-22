import React, { useState, useEffect } from 'react';
import { motion, Transition } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  defaultValue?: string | null;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  defaultValue = null,
  value: externalValue,
  onValueChange,
  className = '',
  transition = { type: 'spring', bounce: 0.2, duration: 0.3 },
  enableHover = false,
}) => {
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  const activeValue = externalValue !== undefined ? externalValue : internalValue;

  useEffect(() => {
    if (defaultValue !== null && activeValue === null) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue]);

  const handleSelect = (id: string) => {
    setInternalValue(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  return (
    <div className="relative inline-flex flex-wrap items-center">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const id = (child.props as { 'data-id'?: string })['data-id'];
        if (!id) return child;

        const isSelected = activeValue === id;
        const isHovered = hoveredValue === id;

        return (
          <div
            key={id}
            className="relative"
            onMouseEnter={() => enableHover && setHoveredValue(id)}
            onMouseLeave={() => enableHover && setHoveredValue(null)}
            onClick={() => handleSelect(id)}
          >
            {(isSelected || (enableHover && isHovered)) && (
              <motion.div
                layoutId={`animated-bg-${id}`}
                className={`absolute inset-0 z-0 ${className}`}
                initial={false}
                transition={transition}
              />
            )}
            <div className="relative z-10">{child}</div>
          </div>
        );
      })}
    </div>
  );
};
