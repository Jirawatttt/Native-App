import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { AppText } from './AppText';
import { colors } from '@/lib/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

// ปุ่มหลัก (gradient กรมท่า)
export function PrimaryButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.shadow, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}>
      <LinearGradient
        colors={[colors.navy, colors.navyLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}>
        <AppText weight="semi" style={{ color: '#fff', fontSize: 15.5 }}>
          {label}
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

// ปุ่มรอง (ขอบบาง พื้นขาว)
export function SecondaryButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        styles.secondary,
        { opacity: disabled ? 0.5 : 1, backgroundColor: pressed ? colors.surface : '#fff' },
        style,
      ]}>
      <AppText weight="semi" style={{ color: colors.navy, fontSize: 15.5 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

// ปุ่มเล็กบนแถบ action (คัดลอก / แชร์ / ดูรายการเพิ่มเติม)
export function IconButton({
  label,
  onPress,
  disabled,
  done,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  done?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.icon,
        done && { backgroundColor: '#E8F8F0', borderColor: colors.green },
        { opacity: disabled ? 0.5 : 1 },
        pressed && { backgroundColor: colors.surface },
      ]}>
      <AppText weight="semi" style={{ fontSize: 13.5, color: done ? colors.green : colors.navy }}>
        {label}
      </AppText>
    </Pressable>
  );
}

// แถบปุ่มล่างสุดของหน้า (เหมือน .footer-actions)
export function FooterBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.footer, { paddingBottom: 14 + insets.bottom }]}>{children}</View>;
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 8,
    elevation: 3,
    shadowColor: colors.navy,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { borderWidth: 1.5, borderColor: colors.border },
  icon: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
