import React, { useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Line,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { formatCurrency } from '@lib/format';
import { colors, spacing } from '@lib/theme';

import styles from './styles';

type BalanceChartProps = {
  labels: string[];
  values: number[];
};

const HEIGHT = 240;
const PADDING = { top: 28, right: 12, bottom: 32, left: 44 };

const BalanceChart = ({ labels, values }: BalanceChartProps) => {
  const { width: windowWidth } = useWindowDimensions();
  // The chart now renders edge-to-edge inside the card (no card padding on
  // sides), so it only needs to account for the outer screen padding.
  const width = Math.max(0, windowWidth - spacing.screenPadding * 2);

  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;

  const toY = (v: number) =>
    PADDING.top + chartHeight - ((v - minValue) / range) * chartHeight;

  const zeroY = toY(0);
  const hasNegative = minValue < 0;
  const yTicks = hasNegative ? [maxValue, 0, minValue] : [maxValue, 0];

  const slotWidth = values.length > 0 ? chartWidth / values.length : 0;
  const barWidth = Math.max(8, Math.min(slotWidth * 0.6, 36));

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (values.length === 0 || width === 0) {
    return (
      <View style={[styles.container, { width: Math.max(width, 0) }]}>
        <Text style={styles.emptyText}>—</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width }]}>
      <Svg width={width} height={HEIGHT}>
        <Defs>
          <LinearGradient id='positiveGradient' x1='0' y1='0' x2='0' y2='1'>
            <Stop
              offset='0'
              stopColor={colors.success[500]}
              stopOpacity='1'
            />
            <Stop
              offset='1'
              stopColor={colors.success[500]}
              stopOpacity='0.55'
            />
          </LinearGradient>
          <LinearGradient id='negativeGradient' x1='0' y1='0' x2='0' y2='1'>
            <Stop
              offset='0'
              stopColor={colors.error[500]}
              stopOpacity='0.55'
            />
            <Stop
              offset='1'
              stopColor={colors.error[500]}
              stopOpacity='1'
            />
          </LinearGradient>
        </Defs>

        {/* Y-axis gridlines + tick labels */}
        {yTicks.map((tick, i) => {
          const y = toY(tick);
          const isZero = tick === 0;
          return (
            <React.Fragment key={`tick-${i}`}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartWidth}
                y2={y}
                stroke={isZero ? colors.gray[400] : colors.border}
                strokeWidth={isZero ? 1 : 0.5}
                strokeDasharray={isZero ? undefined : '3,5'}
              />
              <SvgText
                x={PADDING.left - 8}
                y={y + 4}
                fontSize='11'
                fontFamily='Inter-SemiBold'
                fill={colors.text.muted}
                textAnchor='end'
              >
                {formatShortCurrency(tick)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {values.map((v, i) => {
          const centerX = PADDING.left + slotWidth * (i + 0.5);
          const isPositive = v >= 0;
          const barTop = isPositive ? toY(v) : zeroY;
          const rawHeight = Math.abs(toY(v) - zeroY);
          const barHeight = v === 0 ? 0 : Math.max(3, rawHeight);
          const fillUrl = isPositive
            ? 'url(#positiveGradient)'
            : 'url(#negativeGradient)';
          const isActive = activeIndex === i;
          const dim =
            activeIndex !== null && !isActive ? 0.25 : isActive ? 1 : 0.9;

          return (
            <Rect
              key={`bar-${i}`}
              x={centerX - barWidth / 2}
              y={barTop}
              width={barWidth}
              height={barHeight}
              rx={4}
              ry={4}
              fill={fillUrl}
              opacity={dim}
              onPress={() => setActiveIndex(isActive ? null : i)}
            />
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const centerX = PADDING.left + slotWidth * (i + 0.5);
          return (
            <SvgText
              key={`label-${i}`}
              x={centerX}
              y={HEIGHT - 10}
              fontSize='11'
              fontFamily='Inter-Medium'
              fill={
                activeIndex === i ? colors.text.primary : colors.text.muted
              }
              textAnchor='middle'
            >
              {label}
            </SvgText>
          );
        })}

        {/* Active bar tooltip */}
        {activeIndex !== null && values[activeIndex] !== undefined
          ? (() => {
              const v = values[activeIndex];
              const centerX =
                PADDING.left + slotWidth * (activeIndex + 0.5);
              const y = toY(v);
              const labelY =
                v >= 0 ? Math.max(y - 10, PADDING.top - 8) : y + 16;
              return (
                <SvgText
                  x={centerX}
                  y={labelY}
                  fontSize='12'
                  fontFamily='Inter-Bold'
                  fill={colors.text.primary}
                  textAnchor='middle'
                >
                  {formatCurrency(v)}
                </SvgText>
              );
            })()
          : null}
      </Svg>
    </View>
  );
};

function formatShortCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}€${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}€${(abs / 1_000).toFixed(1)}k`;
  return `${sign}€${Math.round(abs)}`;
}

export default BalanceChart;
