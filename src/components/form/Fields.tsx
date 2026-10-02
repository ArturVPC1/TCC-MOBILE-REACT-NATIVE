import React from 'react';
import { Controller } from 'react-hook-form';
import { TextInput } from 'react-native';
import { ChipGroup, DateField, SegmentedControl, SelectField } from '../ui';
import { OptionInput } from '../ui/OptionSheet';
import { TextField, TextFieldProps } from '../ui/TextField';

type Base = { control: any; name: string };

export function FText({ control, name, inputRef, ...rest }: Base & TextFieldProps & { inputRef?: (r: TextInput | null) => void }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <TextField {...rest} ref={inputRef} value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
    )} />
  );
}

export function FDate({ control, name, inputRef, ...rest }: Base & TextFieldProps & { inputRef?: (r: TextInput | null) => void }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <DateField {...rest} ref={inputRef} value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
    )} />
  );
}

export function FSelect({ control, name, onValue, ...rest }: Base & {
  label?: string; options: OptionInput[]; required?: boolean; placeholder?: string; disabled?: boolean; onValue?: (v: string) => void;
}) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <SelectField {...rest} value={field.value} onChange={(v) => { field.onChange(v); onValue?.(v); }} error={fieldState.error?.message} />
    )} />
  );
}

export function FSegment({ control, name, ...rest }: Base & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <Controller control={control} name={name} render={({ field }) => (
      <SegmentedControl {...rest} value={field.value} onChange={field.onChange} />
    )} />
  );
}

export function FChips({ control, name, ...rest }: Base & { label?: string; required?: boolean; options: OptionInput[] }) {
  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <ChipGroup {...rest} value={field.value ?? []} onChange={field.onChange} error={fieldState.error?.message} />
    )} />
  );
}
