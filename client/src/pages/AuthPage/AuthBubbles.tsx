import "./auth-bubbles.css";

const leftParticles = Array.from({ length: 20 }, (_, index) => index);
const rightParticles = Array.from({ length: 20 }, (_, index) => index);

export function AuthBubbles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {leftParticles.map((index) => (
        <span
          key={`left-${String(index)}`}
          className={`auth-particle absolute rounded-full bg-primary ${
            index % 4 === 0 ? "size-1" : "size-1.5"
          }`}
          style={spreadStyle(index, 4, 46)}
        />
      ))}
      {rightParticles.map((index) => (
        <span
          key={`right-${String(index)}`}
          className={`auth-particle absolute rounded-full bg-primary ${
            index % 4 === 0 ? "size-1" : "size-1.5"
          }`}
          style={spreadStyle(index, 54, 96)}
        />
      ))}
    </div>
  );
}

function spreadStyle(index: number, minLeft: number, maxLeft: number) {
  const span = maxLeft - minLeft;
  return {
    left: `${String(minLeft + ((index * 11) % span))}%`,
    top: `${String(6 + ((index * 17) % 86))}%`,
    animationDuration: `${String(2.4 + (index % 8) * 0.35)}s`,
    animationDelay: `${String((index % 10) * 0.16)}s`,
  };
}
