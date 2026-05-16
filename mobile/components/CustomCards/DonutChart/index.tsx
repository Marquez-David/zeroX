import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { colors } from '@lib/theme';

type Segment = {
  color: string;
  value: number;
};

type DonutChartProps = {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
};

const DonutChart = ({
  segments,
  size = 220,
  strokeWidth = 22,
  children,
  style,
}: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Tiny inter-segment gap (in radians along the circle) keeps rounded caps
  // from overlapping at segment boundaries.
  const GAP = Math.min(2, circumference * 0.008);

  let cumulative = 0;

  return (
    <View
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill='none'
          stroke={colors.gray[100]}
          strokeWidth={strokeWidth}
        />

        {/* Coloured segments, rotated so they start at 12 o'clock */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          {segments.map((segment, i) => {
            if (total === 0 || segment.value <= 0) return null;
            const length = Math.max(
              0,
              (segment.value / total) * circumference - GAP,
            );
            const element = (
              <Circle
                key={`seg-${i}`}
                cx={center}
                cy={center}
                r={radius}
                fill='none'
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${length}, ${circumference}`}
                strokeDashoffset={-cumulative}
                strokeLinecap='round'
              />
            );
            cumulative += length + GAP;
            return element;
          })}
        </G>
      </Svg>
      {children}
    </View>
  );
};

export default DonutChart;
