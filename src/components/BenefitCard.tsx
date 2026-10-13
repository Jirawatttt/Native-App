import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import type { Benefit, Source } from '@/lib/api';
import { STATUS_LABEL } from '@/lib/labels';
import { colors } from '@/lib/theme';

function Bullets({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <AppText style={styles.value}>ไม่ระบุ</AppText>;
  return (
    <View style={{ gap: 2 }}>
      {items.map((v, i) => (
        <AppText key={i} style={styles.value}>
          • {v}
        </AppText>
      ))}
    </View>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <AppText weight="semi" style={styles.factLabel}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

// กล่องข้อมูลอ้างอิงจากฐานข้อมูล (คำอธิบาย/ผลประโยชน์/เอกสาร/ติดต่อ/URL)
function Facts({ source }: { source: Source }) {
  return (
    <View style={styles.facts}>
      <AppText weight="bold" style={styles.smallHead}>
        ข้อมูลสิทธิจากฐานข้อมูล
      </AppText>
      <Fact label="คำอธิบายสิทธิ">
        <AppText style={styles.value}>{source.short_description || 'ไม่ระบุ'}</AppText>
      </Fact>
      <Fact label="ผลประโยชน์">
        <AppText style={styles.value}>{source.benefit_details || 'ไม่ระบุ'}</AppText>
      </Fact>
      <Fact label="เอกสารที่ต้องใช้">
        <Bullets items={source.docs} />
      </Fact>
      <Fact label="ติดต่อ">
        <Bullets items={source.contact} />
      </Fact>
      <Fact label="URL">
        {source.url ? (
          <AppText
            weight="bold"
            style={[styles.value, { color: colors.navyLight, textDecorationLine: 'underline' }]}
            onPress={() => Linking.openURL(source.url!).catch(() => {})}>
            เปิดแหล่งข้อมูล
          </AppText>
        ) : (
          <AppText style={styles.value}>ไม่มีลิงก์อ้างอิงในฐานข้อมูล</AppText>
        )}
      </Fact>
    </View>
  );
}

const STATUS_COLOR = {
  likely_eligible: colors.green,
  needs_verification: colors.amber,
  not_eligible: colors.textMuted,
} as const;

export function BenefitCard({ item }: { item: Benefit }) {
  const color = STATUS_COLOR[item.status] ?? colors.navy;
  return (
    <View style={styles.card}>
      <View style={[styles.pill, { borderColor: color }]}>
        <View style={[styles.pillDot, { backgroundColor: color }]} />
        <AppText weight="bold" style={{ fontSize: 12.5, color }}>
          {STATUS_LABEL[item.status] ?? item.status}
        </AppText>
      </View>
      <AppText weight="bold" style={styles.title}>
        {item.name}
      </AppText>

      <View style={styles.answer}>
        <AppText weight="bold" style={styles.smallHead}>
          สรุปสำหรับคุณ
        </AppText>
        <AppText style={{ color: colors.textSub, lineHeight: 27 }}>{item.explanation}</AppText>
      </View>

      {(item.sources ?? []).map((s, i) => (
        <Facts key={i} source={s} />
      ))}

      {(item.missing_information ?? []).length > 0 && (
        <View style={{ marginTop: 16 }}>
          <AppText weight="bold" style={styles.smallHead}>
            ข้อมูลที่ต้องตรวจเพิ่ม
          </AppText>
          <Bullets items={item.missing_information} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.navy,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 11,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 18.5, marginTop: 12, marginBottom: 14 },
  answer: {
    backgroundColor: colors.answerBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    borderRadius: 7,
    padding: 15,
  },
  smallHead: { fontSize: 12, color: colors.navy, marginBottom: 7 },
  facts: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.factsBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  factLabel: { fontSize: 13.5, color: colors.textMuted, marginBottom: 2 },
  value: { fontSize: 14.5, color: colors.textSub, lineHeight: 23 },
});
