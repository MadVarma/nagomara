import { useState, useEffect } from 'react';

const PETALS = [
  { id: 0,  left: '3%',  delay: '0s',    dur: '9s',   w: 10, h: 9,  v: 1 },
  { id: 1,  left: '9%',  delay: '1.4s',  dur: '11s',  w: 13, h: 11, v: 2 },
  { id: 2,  left: '16%', delay: '2.8s',  dur: '8s',   w: 9,  h: 8,  v: 3 },
  { id: 3,  left: '22%', delay: '0.6s',  dur: '13s',  w: 14, h: 12, v: 1 },
  { id: 4,  left: '29%', delay: '4.2s',  dur: '10s',  w: 11, h: 9,  v: 2 },
  { id: 5,  left: '36%', delay: '3.0s',  dur: '9s',   w: 8,  h: 7,  v: 3 },
  { id: 6,  left: '43%', delay: '1.0s',  dur: '12s',  w: 15, h: 13, v: 1 },
  { id: 7,  left: '50%', delay: '5.2s',  dur: '8s',   w: 10, h: 9,  v: 2 },
  { id: 8,  left: '57%', delay: '0.4s',  dur: '11s',  w: 12, h: 10, v: 3 },
  { id: 9,  left: '64%', delay: '2.6s',  dur: '9s',   w: 9,  h: 8,  v: 1 },
  { id: 10, left: '71%', delay: '1.8s',  dur: '14s',  w: 13, h: 11, v: 2 },
  { id: 11, left: '78%', delay: '4.0s',  dur: '10s',  w: 11, h: 9,  v: 3 },
  { id: 12, left: '85%', delay: '0.2s',  dur: '8s',   w: 8,  h: 7,  v: 1 },
  { id: 13, left: '92%', delay: '3.6s',  dur: '12s',  w: 14, h: 12, v: 2 },
  { id: 14, left: '7%',  delay: '6.5s',  dur: '9s',   w: 10, h: 9,  v: 3 },
  { id: 15, left: '54%', delay: '7.2s',  dur: '11s',  w: 12, h: 10, v: 1 },
  { id: 16, left: '40%', delay: '8.1s',  dur: '8s',   w: 9,  h: 8,  v: 2 },
  { id: 17, left: '27%', delay: '5.8s',  dur: '13s',  w: 11, h: 9,  v: 3 },
];

export default function SakuraPetals() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="sakura-bg" aria-hidden="true">
      {PETALS.map(p => (
        <span
          key={p.id}
          className={`sakura-petal sp-v${p.v}`}
          style={{
            left: p.left,
            width: p.w + 'px',
            height: p.h + 'px',
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}
