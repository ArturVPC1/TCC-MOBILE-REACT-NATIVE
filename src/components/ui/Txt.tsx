import React from 'react';
import { Text, TextProps } from 'react-native';
import { type } from '../../theme';

export function Txt({ variant = 'body', style, ...p }: TextProps & { variant?: keyof typeof type }) {
  return <Text {...p} style={[type[variant], style]} />;
}
