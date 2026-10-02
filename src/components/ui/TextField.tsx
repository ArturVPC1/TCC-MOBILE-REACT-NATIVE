import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, type } from '../../theme';
import { Txt } from './Txt';

export interface TextFieldProps extends Omit<TextInputProps, 'onChange'> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  mask?: (v: string) => string;
  maxLength?: number;
}

export const TextField = React.forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helper, required, leftIcon, rightElement, mask, multiline, editable = true, onChangeText, value, maxLength, ...rest },
  ref,
) {
  const [focus, setFocus] = useState(false);
  const border = error ? colors.danger : focus ? colors.primary : colors.border;
  return (
    <View>
      {label ? (
        <Txt variant="label" style={{ marginBottom: 6 }}>
          {label}
          {required ? <Txt variant="label" style={{ color: colors.muted }}>{' *'}</Txt> : null}
        </Txt>
      ) : null}
      <View style={[s.box, multiline && s.multi, { borderColor: border, backgroundColor: editable ? colors.surface : colors.surfaceMuted }]}>
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          value={value}
          editable={editable}
          multiline={multiline}
          maxLength={maxLength}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={label}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChangeText={(t) => onChangeText?.(mask ? mask(t) : t)}
          style={[type.input, s.input, multiline && { textAlignVertical: 'top', paddingTop: 12 }, { outlineStyle: 'none' } as never]}
          {...rest}
        />
        {rightElement}
      </View>
      {multiline && maxLength ? (
        <Txt variant="micro" style={{ color: colors.muted, textAlign: 'right', marginTop: 4 }}>
          {(value ?? '').length}/{maxLength}
        </Txt>
      ) : null}
      {error ? (
        <Txt variant="micro" style={{ color: colors.danger, marginTop: 4 }}>{error}</Txt>
      ) : helper ? (
        <Txt variant="micro" style={{ color: colors.muted, marginTop: 4 }}>{helper}</Txt>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  box: { minHeight: 48, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  multi: { minHeight: 96, alignItems: 'flex-start' },
  input: { flex: 1, paddingVertical: 0, minHeight: 46 },
});
