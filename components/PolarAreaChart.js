import ColorItem from './ColorItem';
import { prettyNumber } from '../util';
import { COLORS } from '../util/constants';

const { log } = console;

function getCoordinatesForPercent(percent, size, radii) {
  return {
    x: size / 2 - (Math.cos(percent * (2 * Math.PI)) * radii),
    y: size / 2 - (Math.sin(percent * (2 * Math.PI)) * radii)
  };
}

export default function PolarAreaChart({
  data,
  colors,
  width = '100%'
}) {
  const size = 100;
  const radii = 50;
  const values = Object.values(data);
  const total = values.reduce((acc, current) => acc + current, 0);
  const percentages = values.map(p => p * 1 / total);
  const maxPercentage = Math.max(...percentages);

  let acc = 0;

  const items = Object.entries(data).map(([key, value], i) => {
    const percent = value * 1 / total;
    const r = percent * radii / maxPercentage;

    const start = getCoordinatesForPercent(acc, size, r);
    acc += 1 / values.length;
    const end = getCoordinatesForPercent(acc, size, r);
    const f = 1 / values.length > .5 ? 1 : 0;

    return {
      key,
      value,
      d: `
        M ${size/2} ${size/2}
        L ${start.x} ${start.y}
        A ${r} ${r} 0 ${f} 1 ${end.x} ${end.y}
      `,
      color: colors?.[key] ?? COLORS[i]
    }
  });

  return (
    <div className='root'>
      <div className="chartWrapper">
        <svg
          viewBox={`0 0 ${size} ${size}`}
        >
          {new Array(5).fill(0).map((_, i, arr) => {
            return (
              <circle
                key={i}
                fill='none'
                stroke='var(--gps-border-color)'
                opacity='.5'
                r={radii / arr.length * (i+1)}
                cx={size/2}
                cy={size/2}
              />
            )
          })}
          {items.map((p, i) => (
            <path key={p.key} d={p.d} fill={p.color}/>
          ))}
        </svg>
      </div>
      <div className='info'>
        {items.map((item, i) =>
          <ColorItem
            key={i}
            color={item.color}
            text={item.key}
            secondaryText={prettyNumber(item.value)}
            rx='3'
          />
        )}
      </div>
      <style jsx>{`
        .root {
          display: flex;
        }
        .chartWrapper {
          flex: 1 0 50%;
        }
        svg {
          transform: rotate(90deg);
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
