import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/Buttons';
import { colors } from '@/lib/theme';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const RIGHTS = [
  'เบี้ยยังชีพผู้สูงอายุ',
  'เบี้ยความพิการ',
  'สวัสดิการแห่งรัฐ (บัตรคนจน)',
  'ประกันสังคม ม.33 ม.39 ม.40',
  'เงินอุดหนุนเด็กแรกเกิด',
  'สิทธิหลักประกันสุขภาพถ้วนหน้า',
];

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: colors.navy,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Feature({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.feature}>
      <View style={{ marginBottom: 8 }}>{icon}</View>
      <AppText weight="bold" style={{ fontSize: 14.5, color: colors.navy }}>
        {value}
      </AppText>
      <AppText style={{ fontSize: 11.5, color: colors.textMuted, textAlign: 'center', marginTop: 3 }}>
        {label}
      </AppText>
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="ระบบแสดงสิทธิประโยชน์ภาครัฐเบื้องต้น" />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../assets/images/logo.png')} style={styles.hero} resizeMode="contain" />
        <View style={styles.divider} />

        <AppText weight="bold" style={styles.label}>
          สิทธิประโยชน์ที่มีในระบบ
        </AppText>
        <View style={styles.card}>
          {RIGHTS.map((r, i) => (
            <View key={r} style={[styles.row, i === RIGHTS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.num}>
                <AppText weight="bold" style={{ color: '#fff', fontSize: 12.5 }}>
                  {i + 1}
                </AppText>
              </View>
              <AppText style={{ flex: 1, color: colors.textSub, fontSize: 15 }}>{r}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.featureBar}>
          <Feature
            value="8 สิทธิ"
            label="ครอบคลุมในระบบ"
            icon={
              <Svg {...iconProps}>
                <Path d="M12 3L4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7L12 3z" />
                <Path d="M9 12l2 2 4-4" />
              </Svg>
            }
          />
          <Feature
            value="มีผู้ช่วย"
            label="อธิบายภาษาไทยเข้าใจง่าย"
            icon={
              <Svg {...iconProps}>
                <Circle cx={12} cy={12} r={9} />
                <Path d="M12 7v5l3 3" />
              </Svg>
            }
          />
          <Feature
            value="ปลอดภัย"
            label="ไม่บันทึกข้อมูลส่วนตัว"
            icon={
              <Svg {...iconProps}>
                <Rect x={5} y={11} width={14} height={10} rx={2} />
                <Path d="M8 11V7a4 4 0 018 0v4" />
                <Circle cx={12} cy={16} r={1} fill={colors.navy} stroke="none" />
              </Svg>
            }
          />
        </View>

        <AppText style={{ color: colors.textSub, marginBottom: 16, textAlign: 'center' }}>
          ตรวจสอบสิทธิของคุณได้ในไม่กี่ขั้นตอน
        </AppText>
        <PrimaryButton label="เริ่มต้นใช้งาน" onPress={() => router.push('/input')} />
      </ScrollView>

      <View style={[styles.note, { paddingBottom: 14 + insets.bottom }]}>
        <AppText style={{ fontSize: 12.5, color: colors.textMuted, textAlign: 'center' }}>
          * หมายเหตุ: เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การรับรองสิทธิอย่างเป็นทางการ
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28 },
  hero: { width: 180, height: 150 },
  divider: { width: 40, height: 3, borderRadius: 2, backgroundColor: colors.gold, marginTop: 8, marginBottom: 24 },
  label: { fontSize: 12.5, color: colors.textMuted, marginBottom: 14 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.navy,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  featureBar: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 440, marginBottom: 24 },
  feature: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    borderTopColor: colors.navy,
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  note: {
    paddingTop: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
