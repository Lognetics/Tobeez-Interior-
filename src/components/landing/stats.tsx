"use client";

import * as React from "react";
import { animate, motion, useInView } from "framer-motion";

const stats = [
  { value: 20, suffix: "", label: "Projects Completed" },
  { value: 1, suffix: "", label: "Country Served" },
  { value: 10, suffix: "", label: "Design Styles" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  const display = val >= 1000 ? `${(val / 1000).toFixed(val < to ? 1 : 0)}k` : Math.round(val).toString();
  return <span ref={ref}>{display}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-14">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 gap-6 px-5 sm:px-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <p className="font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
