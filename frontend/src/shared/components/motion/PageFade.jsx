'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function PageFade({
  as = 'div',
  children,
  className = '',
  delay = 0,
  motionKey,
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      key={motionKey}
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </MotionComponent>
  );
}
