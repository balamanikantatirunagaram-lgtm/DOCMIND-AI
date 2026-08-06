import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-card border-2 border-border shadow-pixel p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
