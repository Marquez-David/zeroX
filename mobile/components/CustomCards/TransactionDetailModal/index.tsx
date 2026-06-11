import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight } from 'lucide-react-native';

import { useOperation } from '@hooks/queries/operations';
import { categoryColor, categoryIcon, formatCurrency, formatFullDate, shortId, withOpacity } from '@lib/format';
import { transactionStrings } from '@lib/strings';
import { colors } from '@lib/theme';
import type { Category, Operation, OperationCategory } from '@lib/types';
import { useModalFade } from '@hooks/useModalFade';

import styles from './styles';

type TransactionDetailModalProps = {
  visible: boolean;
  operation: Operation | null;
  categories: Category[];
  onClose: () => void;
  onSaveCategory: (operationUuid: string, newCategoryUuid: string) => Promise<unknown>;
};

const TransactionDetailModal = ({
  visible,
  operation,
  categories,
  onClose,
  onSaveCategory,
}: TransactionDetailModalProps) => {
  const [optimisticCategory, setOptimisticCategory] = useState<OperationCategory | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { mounted, opacity } = useModalFade(visible);

  useEffect(() => {
    if (!visible) {
      setPickerOpen(false);
      setOptimisticCategory(null);
    }
  }, [visible]);

  const { data: fetchedOperation } = useOperation(operation?.uuid);

  useEffect(() => {
    const current = fetchedOperation ?? operation;
    if (current && optimisticCategory && optimisticCategory.uuid === current.category.uuid) {
      setOptimisticCategory(null);
    }
  }, [fetchedOperation, operation, optimisticCategory]);

  const lastOperationRef = useRef<Operation | null>(null);
  const currentOperation = fetchedOperation ?? operation;
  if (currentOperation) lastOperationRef.current = currentOperation;
  const display = currentOperation ?? lastOperationRef.current;

  if (!mounted) return null;
  if (!display) return null;

  const displayCategory = optimisticCategory ?? display.category;
  const isIncome = display.amount >= 0;
  const amountColor = isIncome ? colors.success[500] : colors.error[500];
  const amountBg = isIncome ? colors.success[50] : colors.error[50];
  const TypeIcon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const typeLabel = isIncome ? transactionStrings.income : transactionStrings.expense;
  const categoryTint = categoryColor(displayCategory.name);
  const CategoryIcon = categoryIcon(displayCategory.name);

  const handlePickCategory = async (next: Category) => {
    setPickerOpen(false);
    if (next.uuid === display.category.uuid) return;
    setOptimisticCategory({ uuid: next.uuid, name: next.name });
    try {
      await onSaveCategory(display.uuid, next.uuid);
    } catch {
      setOptimisticCategory(null);
    }
  };

  const numDots = 22;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType='none'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.root, { opacity }]} pointerEvents='box-none'>
        <Pressable style={styles.flex} onPress={onClose}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Pressable style={styles.cardShadow} onPress={() => {}}>
              <View style={styles.card}>
                {/* Hero */}
                <View style={styles.hero}>
                  <Text style={[styles.heroAmount, { color: amountColor }]}>
                    {formatCurrency(display.amount)}
                  </Text>
                  <Text style={styles.heroConcept} numberOfLines={2}>
                    {display.concept}
                  </Text>
                </View>

                {/* Seam */}
                <View style={styles.seam}>
                  <View style={[styles.notch, styles.notchLeft]} />
                  <View style={styles.dashed}>
                    {Array.from({ length: numDots }).map((_, i) => (
                      <View key={i} style={styles.dashedDot} />
                    ))}
                  </View>
                  <View style={[styles.notch, styles.notchRight]} />
                </View>

                {/* Detail rows */}
                <View style={styles.details}>
                  {/* Type row — income/expense pill */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{transactionStrings.type}</Text>
                    <View style={[styles.typePill, { backgroundColor: amountBg }]}>
                      <TypeIcon size={11} color={amountColor} strokeWidth={2.5} />
                      <Text style={[styles.typePillText, { color: amountColor }]}>
                        {typeLabel}
                      </Text>
                    </View>
                  </View>
                  <DetailRow
                    label={transactionStrings.concept}
                    value={display.concept}
                  />
                  <DetailRow
                    label={transactionStrings.date}
                    value={formatFullDate(display.date)}
                  />
                  <DetailRow
                    label={transactionStrings.amount}
                    value={formatCurrency(display.amount)}
                    valueColor={amountColor}
                  />
                  {/* Category row — tappable chip */}
                  <TouchableOpacity
                    onPress={() => setPickerOpen(true)}
                    disabled={categories.length === 0}
                    activeOpacity={0.7}
                    style={styles.detailRow}
                  >
                    <Text style={styles.detailLabel}>{transactionStrings.category}</Text>
                    <View style={styles.detailValueBlock}>
                      <View
                        style={[
                          styles.categoryChip,
                          { backgroundColor: withOpacity(categoryTint, 0.12) },
                        ]}
                      >
                        <CategoryIcon size={12} color={categoryTint} strokeWidth={2.5} />
                        <Text style={[styles.categoryChipText, { color: categoryTint }]}>
                          {displayCategory.name}
                        </Text>
                      </View>
                      <ChevronRight size={14} color={colors.text.muted} />
                    </View>
                  </TouchableOpacity>
                  <DetailRow
                    label={transactionStrings.reference}
                    value={shortId(display.uuid)}
                    mono
                    last
                  />
                </View>
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Animated.View>

      <CategoryPickerSheet
        visible={pickerOpen}
        categories={categories}
        selectedUuid={displayCategory.uuid}
        onPick={handlePickCategory}
        onClose={() => setPickerOpen(false)}
      />
    </Modal>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
  last?: boolean;
};

const DetailRow = ({ label, value, valueColor, mono, last }: DetailRowProps) => (
  <View style={[styles.detailRow, last && styles.detailRowLast]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        valueColor ? { color: valueColor } : null,
        mono ? styles.detailValueMono : null,
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

type CategoryPickerSheetProps = {
  visible: boolean;
  categories: Category[];
  selectedUuid: string;
  onPick: (category: Category) => void;
  onClose: () => void;
};

const CategoryPickerSheet = ({
  visible,
  categories,
  selectedUuid,
  onPick,
  onClose,
}: CategoryPickerSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType='slide'
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <Pressable style={styles.pickerBackdrop} onPress={onClose}>
      <Pressable style={styles.pickerSheet} onPress={() => {}}>
        <View style={styles.pickerHandle} />
        <Text style={styles.pickerTitle}>{transactionStrings.pickCategory}</Text>
        <ScrollView
          style={styles.pickerList}
          contentContainerStyle={styles.pickerListContent}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((cat) => {
            const isSelected = cat.uuid === selectedUuid;
            const Icon = categoryIcon(cat.name);
            const tint = categoryColor(cat.name);
            return (
              <TouchableOpacity
                key={cat.uuid}
                onPress={() => onPick(cat)}
                activeOpacity={0.7}
                style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
              >
                <View style={styles.pickerIcon}>
                  <Icon size={18} color={tint} strokeWidth={2.5} />
                </View>
                <Text
                  style={[
                    styles.pickerOptionText,
                    isSelected && styles.pickerOptionTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
                {isSelected ? (
                  <Check size={18} color={colors.primary[600]} strokeWidth={2.5} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

export default TransactionDetailModal;
