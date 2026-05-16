import React from 'react';
import { View, Text } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { colors } from '@lib/theme';

import styles from './styles';

type LineChartProps = {
  values: number[];
  labels: string[];
  width: number;
  height?: number;
  color?: string;
  formatY?: (value: number) => string;
};

const PADDING = { top: 24, right: 14, bottom: 28, left: 48 };
const GRADIENT_ID = 'line-area-gradient';

const LineChart = ({
  values,
  labels,
  width,
  height = 180,
  color = colors.primary[600],
  formatY,
}: LineChartProps) => {
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  if (values.length === 0 || width <= 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>—</Text>
      </View>
    );
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const toY = (v: number) =>
    PADDING.top + chartHeight - ((v - minValue) / range) * chartHeight;

  const step = values.length > 1 ? chartWidth / (values.length - 1) : 0;

  const points = values.map((v, i) => ({
    x: PADDING.left + (values.length === 1 ? chartWidth / 2 : i * step),
    y: toY(v),
    value: v,
  }));

  const lineD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  // Area path: line down to the bottom edge, back to the start.
  const baseY = PADDING.top + chartHeight;
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const areaD = `${lineD} L ${lastX.toFixed(1)},${baseY} L ${firstX.toFixed(1)},${baseY} Z`;

  // Choose sparse X labels (first, middle, last) when there are many points.
  const labelIndexes =
    labels.length <= 4
      ? labels.map((_, i) => i)
      : [0, Math.floor((labels.length - 1) / 2), labels.length - 1];

  const yTicks = [maxValue, minValue];
  const format = formatY ?? ((v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }));

  return (
    <View style={[styles.container, { width }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={GRADIENT_ID} x1='0' y1='0' x2='0' y2='1'>
            <Stop offset='0' stopColor={color} stopOpacity='0.35' />
            <Stop offset='1' stopColor={color} stopOpacity='0.02' />
          </LinearGradient>
        </Defs>

        {/* Gridlines at min/max */}
        {yTicks.map((tick, i) => {
          const y = toY(tick);
          return (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartWidth}
                y2={y}
                stroke={colors.border}
                strokeWidth={0.5}
                strokeDasharray='3,5'
              />
              <SvgText
                x={PADDING.left - 8}
                y={y + 4}
                fontSize='10'
                fontFamily='Inter-SemiBold'
                fill={colors.text.muted}
                textAnchor='end'
              >
                {format(tick)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Area fill */}
        {points.length > 1 ? (
          <Path d={areaD} fill={`url(#${GRADIENT_ID})`} />
        ) : null}

        {/* Line */}
        {points.length > 1 ? (
          <Path
            d={lineD}
            stroke={color}
            strokeWidth={2.5}
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ) : null}

        {/* X labels */}
        {labelIndexes.map((idx) => {
          const p = points[idx];
          if (!p) return null;
          return (
            <SvgText
              key={`xlabel-${idx}`}
              x={p.x}
              y={height - 8}
              fontSize='10'
              fontFamily='Inter-Medium'
              fill={colors.text.muted}
              textAnchor='middle'
            >
              {labels[idx]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default LineChart;
