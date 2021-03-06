import ColorItem from '~/components/ColorItem';
import { prettyNumber, clamp } from '~/util';
import { COLORS } from '~/util/constants';

const internals = {
  getCoordinatesForPercent(percent, size, radii) {
    return {
      x: size / 2 - Math.cos(percent * (2 * Math.PI)) * radii,
      y: size / 2 - Math.sin(percent * (2 * Math.PI)) * radii,
    };
  },
};

export default function PolarAreaChart({
  data,
  colors,
  size = 100,
  radii = size / 2,
  width = '100%',
}) {
  const values = Object.values(data);
  const total = values.reduce((acc, current) => acc + current, 0);
  const percentages = values.map((p) => (p * 1) / total);
  const maxPercentage = Math.max(...percentages);

  if (total === 0) {
    return (
      <p className="fs-md secondary-text">
        <i>No data to show</i>
      </p>
    );
  }

  let acc = 0;

  const items = Object.entries(data).map(([key, value], i) => {
    const percent = clamp(0.1, (value * 1) / total, 1);
    const radius = (percent * radii) / maxPercentage;
    const start = internals.getCoordinatesForPercent(acc, size, radius);
    const end = internals.getCoordinatesForPercent(
      (acc += 1 / values.length),
      size,
      radius,
    );
    const f = 1 / values.length > 0.5 ? 1 : 0;

    return {
      key,
      value,
      percent,
      d: `
        M ${size / 2} ${size / 2}
        L ${start.x} ${start.y}
        A ${radius} ${radius} 0 ${f} 1 ${end.x} ${end.y}
        Z
      `,
      color: colors?.[key] ?? COLORS[i],
    };
  });

  return (
    <div className="root">
      <svg viewBox={`0 0 ${size} ${size}`}>
        {new Array(5).fill(0).map((_, i, arr) => (
          <circle
            key={i}
            r={(radii / arr.length) * (i + 1)}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            stroke="var(--color-border)"
          />
        ))}
        {items.length === 1
          ? items.map((item, i) => (
              <circle
                key={item.key}
                fill={item.color}
                r={size / 2}
                cx={size / 2}
                cy={size / 2}
                data-tip={`
                ${item.key}: ${prettyNumber(item.value)}
                <br/>
                <strong>${Math.round(item.percent * 100)}%</strong>
              `}
                data-html={true}
              />
            ))
          : items.map((item, i) => (
              <path
                key={item.key}
                d={item.d}
                fill={item.color}
                data-tip={`
                ${item.key}: ${prettyNumber(item.value)}
                <br/>
                <strong>${(item.percent * 100).toFixed(2)}%</strong>
              `}
                data-html={true}
              />
            ))}
      </svg>

      <div className="info">
        {items.map((item, i) => (
          <ColorItem
            key={i}
            color={item.color}
            text={item.key}
            secondaryText={prettyNumber(item.value)}
            rx={3}
          />
        ))}
      </div>

      <style jsx>{`
        .root {
          display: grid;
          grid-template-columns: fit-content(50%) 1fr;
          grid-gap: 1rem;
        }
        svg {
          transform: rotate(90deg);
          width: ${width};
        }
        path {
          stroke: var(--color-background);
          stroke-width: 1.5;
          stroke-linejoin: round;
        }
        .info {
          font-size: 12px;
          margin-left: 10px;
          flex: 0 1 50%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
