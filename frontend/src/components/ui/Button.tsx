import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px 0px #111111' }}
        whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px #111111' }}
        ref={ref}
        className={cn(
          'px-4 py-2 font-pixel text-sm font-bold border border-border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-text text-white',
          variant === 'secondary' && 'bg-gray-200 text-text',
          variant === 'outline' && 'bg-transparent text-text hover:bg-gray-100',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
