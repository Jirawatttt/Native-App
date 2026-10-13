import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/lib/theme';

// หัวข้อย่อยพร้อมขีดสีทองด้านหน้า (เหมือน .section-title)
export function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <AppText weight="bold" style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  bar: { width: 4, height: 16, borderRadius: 2, backgroundColor: colors.gold },
  text: { color: colors.navy, fontSize: 14 },
});
