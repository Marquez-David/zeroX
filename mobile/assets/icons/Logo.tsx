import React from 'react';
import Svg, { SvgProps, G, Path } from 'react-native-svg';

const Logo = (props: SvgProps) => (
  <Svg viewBox='100 300 720 150' {...props}>
    <G id='logo-group'>
      <G id='logo-center'>
        <G id='title'>
          <Path
            d='M 392.37987,-36 356.23588,-14.4 353.64387,0 h 117.072 l 2.592,-14.4 h -91.152 l 36.144,-21.6 2.59201,-14.4 h -58.32001 l -2.592,14.4 z m 25.48801,17.28 h 56.15999 l 2.304,-12.96 h -56.16 z m 3.024,-17.28 h 56.15999 l 2.592,-14.4 h -56.16 z'
            strokeWidth={0}
            strokeLinejoin='miter'
            strokeMiterlimit={2}
            fill='#fff'
            stroke='#fff'
            transform='translate(193.19862 333.6) scale(2) translate(-353.64387 50.4)'
          />
          <Path
            d='m 474.39238,0 h 17.27999 l 3.024,-17.208 h 9.504 L 511.83238,0 h 17.99999 l -8.064,-18.144 c 6.98401,-1.44 12.24,-5.4 14.04,-15.696 2.66401,-15.12 -7.19999,-16.56 -19.8,-16.56 h -32.68799 l -2.592,14.4 h 36 c 1.15199,0 2.01599,1.008 1.79999,2.16 -0.216,1.152 -1.36799,2.16 -2.52,2.16 h -36 z'
            strokeWidth={0}
            strokeLinejoin='miter'
            strokeMiterlimit={2}
            fill='#fff'
            stroke='#fff'
            transform='translate(434.69564 333.6) scale(2) translate(-474.39238 50.4)'
          />
          <Path
            d='m 622.04525,-50.4 h -56.592 c -15.12,0 -27.936,10.8 -30.456,25.2 -2.52,14.4 6.264,25.2 21.384,25.2 h 13.104 c 15.12,0 27.936,-10.8 30.456,-25.2 0.36,-2.232 0.504,-4.392 0.36,-6.48 h -18.72 c 1.008,1.728 1.44,4.032 1.08,6.336 -1.08,6.12 -6.768,10.872 -12.888,10.944 l -8.424,0.072 c -6.12,0.072 -10.152,-4.896 -9.072,-11.016 1.08,-5.76 6.768,-10.656 12.888,-10.656 h 47.448 l 7.992,10.08 -29.808,25.92 h 23.76 l 15.768,-13.68 10.872,13.68 h 20.88 l -19.44,-24.48 29.808,-25.92 h -23.76 l -15.768,13.68 z'
            strokeWidth={0}
            strokeLinejoin='miter'
            strokeMiterlimit={2}
            fill='#fff'
            stroke='#fff'
            transform='translate(555.04842 333.6) scale(2) translate(-534.56877 50.4)'
          />
        </G>
      </G>
    </G>
  </Svg>
);

export default Logo;
