import ColorItem from '~/components/ColorItem';
import { percent } from '~/util';
import { COLORS } from '~/util/constants';
import { prettyNumber } from '~/util';

export default function PieChart({
  data,
  colors,
  end = '50%',
  width = '100%',
}) {
  let angleAccumulator = 0;
  const max = Object.values(data).reduce((acc, num) => acc + num, 0);
  const items = Object.entries(data).map((entry, index) => {
    const [key, value] = entry;
    const percentage = percent(value, max);
    const angle = (angleAccumulator * 360) / 100;

    angleAccumulator += percentage;

    return {
      key,
      value,
      percentage,
      angle,
      color: colors?.[key] ?? COLORS[index],
    };
  });

  if (max === 0) {
    return (
      <p className="fs-md secondary-text">
        <i>No data to show</i>
      </p>
    );
  }

  return (
    <div className="wrapper">
      <div className="chartWrapper">
        <svg className="chart" viewBox="0 0 32 32" width={width}>
          {items.map((item, i) => (
            <circle
              key={i}
              strokeDasharray={`${item.percentage} 100`}
              stroke={item.color}
              transform={`rotate(${item.angle},16,16)`}
              r={16}
              cx={16}
              cy={16}
              fill="none"
              strokeWidth={end}
            />
          ))}
        </svg>
      </div>
      <div className="info">
        {items.map((item, i) => (
          <ColorItem
            key={i}
            color={item.color}
            text={item.key}
            secondaryText={prettyNumber(item.value)}
            rx="3"
          />
        ))}
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
        }

        .chartWrapper {
          flex: 1 0 50%;
        }

        .chart {
          border-radius: 50%;
          transform: rotate(-90deg);
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
