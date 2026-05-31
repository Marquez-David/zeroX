import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import styles from './styles';

const VB = 200;
const BANDS = 5;
const SLAB_W = 30;
const SLAB_H = 18;
const GAP = 8;

type Slab = { x: number; y: number; side: 'L' | 'R'; band: number };

const buildSlabs = (): Slab[] => {
  const startY = 100 - (BANDS * SLAB_H + (BANDS - 1) * GAP) / 2;
  const out: Slab[] = [];
  for (let i = 0; i < BANDS; i++) {
    const t = i / (BANDS - 1);
    const y = startY + i * (SLAB_H + GAP);
    const xTL = 30 + t * (140 - SLAB_W);
    const xTR = 170 - SLAB_W - t * (140 - SLAB_W);
    const off = i % 2 === 0 ? -4 : 4;
    out.push({ x: xTL + off, y, side: 'L', band: i });
    out.push({ x: xTR - off, y, side: 'R', band: i });
  }
  return out;
};

export type AnimatedSplashProps = {
  loop?: boolean;
  cycleMs?: number;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
};

const AnimatedSplash = ({
  loop = false,
  cycleMs = 2200,
  size = 220,
  backgroundColor = '#6D28D9',
  foregroundColor = '#ffffff',
}: AnimatedSplashProps) => {
  const slabs = buildSlabs();
  const scale = size / VB;

  return (
    <View style={[styles.container, { backgroundColor }]} pointerEvents='none'>
      <View style={{ width: size, height: size }}>
        {slabs.map((slab, idx) => (
          <SlabAnim
            key={idx}
            slab={slab}
            loop={loop}
            cycleMs={cycleMs}
            scale={scale}
            color={foregroundColor}
          />
        ))}
      </View>
    </View>
  );
};

type SlabAnimProps = {
  slab: Slab;
  loop: boolean;
  cycleMs: number;
  scale: number;
  color: string;
};

const SlabAnim = ({ slab, loop, cycleMs, scale, color }: SlabAnimProps) => {
  const dirX = slab.side === 'L' ? -28 : 28;
  const delay = slab.band * 90 + (slab.side === 'L' ? 0 : 30);

  const opacity = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(dirX)).current;
  const ty = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    const FADE_OUT_AT = cycleMs - 350;
    const HOLD_AFTER_ENTRY = Math.max(0, FADE_OUT_AT - delay - 520);

    const cycle = Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(tx, { toValue: dirX, duration: 0, useNativeDriver: true }),
      Animated.timing(ty, { toValue: -16, duration: 0, useNativeDriver: true }),
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tx, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ty, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(HOLD_AFTER_ENTRY),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const anim = loop ? Animated.loop(cycle) : cycle;
    anim.start();
    return () => anim.stop();
  }, [loop, cycleMs, delay, dirX, opacity, tx, ty]);

  return (
    <Animated.View
      style={[
        styles.slab,
        {
          left: slab.x * scale,
          top: slab.y * scale,
          width: SLAB_W * scale,
          height: SLAB_H * scale,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX: Animated.multiply(tx, scale) },
            { translateY: Animated.multiply(ty, scale) },
          ],
        },
      ]}
    />
  );
};

export default AnimatedSplash;
