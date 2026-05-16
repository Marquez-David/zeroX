import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { colors } from '@lib/theme';

import styles from './styles';

type SelectValue = string | number;

type SelectOption<T extends SelectValue> = {
  value: T;
  label: string;
};

type SelectProps<T extends SelectValue> = {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

function Select<T extends SelectValue>({
  options,
  value,
  onChange,
  placeholder = '—',
  disabled,
  style,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        disabled={disabled || options.length === 0}
        activeOpacity={0.7}
        style={[styles.pill, disabled && styles.pillDisabled, style]}
        hitSlop={4}
      >
        <Text style={styles.label}>{selected?.label ?? placeholder}</Text>
        <ChevronDown
          size={14}
          color={colors.text.primary}
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType='fade'
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected ? (
                    <Check
                      size={16}
                      color={colors.primary[600]}
                      strokeWidth={2.5}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default Select;
