import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import ConfirmDialog from '@components/CustomCards/ConfirmDialog';
import Toast, { type ToastEntry, type ToastType } from '@components/CustomCards/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastConfig = {
  message: string;
  sub?: string;
  type: ToastType;
};

type ConfirmConfig = {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: 'destructive' | 'primary';
  icon?: LucideIcon;
  onConfirm: () => void;
};

type ModalContextValue = {
  confirm: (config: ConfirmConfig) => void;
  toast: (config: ToastConfig) => void;
  setToastOffset: (n: number) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ModalContext = createContext<ModalContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // Confirm dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<ConfirmConfig | null>(null);
  // Keep last config alive so ConfirmDialog has content during its fade-out
  const lastDialogRef = useRef<ConfirmConfig | null>(null);
  if (dialogConfig) lastDialogRef.current = dialogConfig;
  const displayDialog = dialogConfig ?? lastDialogRef.current;

  const confirm = useCallback((config: ConfirmConfig) => {
    setDialogConfig(config);
    setDialogVisible(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogVisible(false);
    // Clear config after fade-out (120 ms) + margin
    setTimeout(() => setDialogConfig(null), 200);
  }, []);

  const handleDialogConfirm = useCallback(() => {
    const onConfirm = dialogConfig?.onConfirm;
    closeDialog();
    onConfirm?.();
  }, [dialogConfig, closeDialog]);

  // Toast
  const toastIdRef = useRef(0);
  const [toastEntry, setToastEntry] = useState<ToastEntry | null>(null);
  const [toastOffset, setToastOffset] = useState(0);

  const toast = useCallback((config: ToastConfig) => {
    toastIdRef.current += 1;
    setToastEntry({ id: toastIdRef.current, ...config });
  }, []);

  const dismissToast = useCallback(() => setToastEntry(null), []);

  return (
    <ModalContext.Provider value={{ confirm, toast, setToastOffset }}>
      {children}
      <ConfirmDialog
        visible={dialogVisible}
        title={displayDialog?.title ?? ''}
        body={displayDialog?.body}
        confirmLabel={displayDialog?.confirmLabel ?? ''}
        cancelLabel={displayDialog?.cancelLabel ?? ''}
        variant={displayDialog?.variant}
        icon={displayDialog?.icon}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {toastEntry ? (
          <Toast
            key={toastEntry.id}
            {...toastEntry}
            bottomOffset={toastOffset}
            onDismiss={dismissToast}
          />
        ) : null}
      </View>
    </ModalContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
