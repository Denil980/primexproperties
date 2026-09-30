import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ value, duration = 2.2, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState<string>(() => {
    // Initial placeholder matching prefix + 0 + suffix
    const match = value.match(/^(.*?)(\d[\d,.]*)(.*)$/);
    if (!match) return value;
    const prefix = match[1];
    const suffix = match[3];
    const isDecimal = match[2].includes('.');
    return `${prefix}${isDecimal ? '0.0' : '0'}${suffix}`;
  });

  useEffect(() => {
    if (!isInView) return;

    const match = value.match(/^(.*?)(\d[\d,.]*)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1];
    const rawNumStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const isDecimal = rawNumStr.includes('.');
    const decimals = isDecimal ? (rawNumStr.split('.')[1]?.length || 1) : 0;
    const target = parseFloat(rawNumStr);

    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        let formattedNum: string;
        if (isDecimal) {
          formattedNum = latest.toFixed(decimals);
        } else {
          formattedNum = Math.round(latest).toLocaleString('en-IN');
        }
        setDisplayValue(`${prefix}${formattedNum}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
