import "./auth-bubbles.css";

const fieldParticles = [
  ...spread("left", 16, 4, 42, 10, 78),
  ...spread("right", 12, 54, 42, 14, 72),
];

const frameDots = [
  "left-[18%] top-3 size-1.5",
  "left-[32%] top-2 size-2",
  "left-[46%] top-5 size-1.5",
  "left-[58%] top-3 size-2",
  "right-[16%] top-4 size-1.5",
  "right-[10%] top-3 size-1.5",
  "right-6 top-7 size-2",
  "right-3 top-14 size-1.5",
  "right-5 top-24 size-1.5",
  "right-2 top-[42%] size-1.5",
  "bottom-3 left-[18%] size-2",
  "bottom-2 left-[32%] size-1.5",
  "bottom-4 left-[46%] size-2",
  "bottom-2 left-[60%] size-1.5",
  "bottom-3 right-[28%] size-2",
  "bottom-2 right-[16%] size-1.5",
  "bottom-1.5 right-7 size-2",
  "bottom-4 right-3 size-1.5",
];

export function AuthBubbles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {fieldParticles.map((particle) => (
        <span
          key={particle.key}
          className={`auth-particle absolute rounded-full bg-primary ${
            particle.index % 4 === 0 ? "size-1" : "size-1.5"
          }`}
          style={particle.style}
        />
      ))}
      {frameDots.map((className, index) => (
        <span
          key={`frame-${String(index)}`}
          className={`auth-particle absolute rounded-full bg-primary ${className}`}
          style={{
            animationDuration: `${String(2.6 + (index % 7) * 0.3)}s`,
            animationDelay: `${String((index % 9) * 0.14)}s`,
          }}
        />
      ))}
    </div>
  );
}

type Particle = {
  key: string;
  index: number;
  style: {
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
  };
};

function spread(
  key: string,
  count: number,
  left: number,
  width: number,
  top: number,
  height: number,
): Particle[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `${key}-${String(index)}`,
    index,
    style: {
      left: `${String(left + ((index * 11) % width))}%`,
      top: `${String(top + ((index * 17) % height))}%`,
      animationDuration: `${String(2.4 + (index % 8) * 0.35)}s`,
      animationDelay: `${String((index % 10) * 0.16)}s`,
    },
  }));
}
