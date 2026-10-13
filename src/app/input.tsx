import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { FooterBar, PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { BarChart, PieChart, Skeleton } from '@/components/Charts';
import { SectionTitle } from '@/components/SectionTitle';
import { getStats, suggestInput, type Stats } from '@/lib/api';
import { CATEGORY_NAME, SHORT_NAME } from '@/lib/labels';
import { useSession } from '@/lib/session';
import { colors, fonts } from '@/lib/theme';

const SUGGESTION_DEBOUNCE_MS = 1200;

const fmtInt = (n: number) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// อนิเมชันนับตัวเลขไต่ขึ้นจาก 0 ไปยังค่าเป้าหมาย
function useCountUp(target: number | null, decimal = false): string {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    const dur = 800;
    const start = Date.now();
    let raf = 0;
    const step = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setValue((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  if (target == null) return '—';
  return decimal ? value.toFixed(1) : fmtInt(value);
}

function Steps() {
  const items = [
    { label: 'เริ่มต้น', state: 'done' as const, n: '✓' },
    { label: 'กรอกข้อมูล', state: 'active' as const, n: '2' },
    { label: 'ดูผลลัพธ์', state: 'todo' as const, n: '3' },
  ];
  return (
    <View style={styles.steps}>
      {items.map((s, i) => {
        const bg = s.state === 'active' ? colors.navy : s.state === 'done' ? colors.green : '#fff';
        const border = s.state === 'todo' ? colors.border : bg;
        const fg = s.state === 'todo' ? colors.textMuted : '#fff';
        const labelColor =
          s.state === 'active' ? colors.navy : s.state === 'done' ? colors.green : colors.textMuted;
        return (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={[styles.circle, { backgroundColor: bg, borderColor: border }]}>
                <AppText weight="bold" style={{ color: fg, fontSize: 14 }}>
                  {s.n}
                </AppText>
              </View>
              <AppText
                weight={s.state === 'active' ? 'bold' : 'medium'}
                style={{ fontSize: 12, color: labelColor }}>
                {s.label}
              </AppText>
            </View>
            {i < items.length - 1 && <View style={styles.line} />}
          </View>
        );
      })}
    </View>
  );
}

type SuggestState = { kind: 'idle' } | { kind: 'analyzing' } | { kind: 'suggestion'; text: string };

export default function InputScreen() {
  const session = useSession();
  const [text, setText] = useState(session.userText);
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggest, setSuggest] = useState<SuggestState>({ kind: 'idle' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  // ── Dashboard ──
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsState, setStatsState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    getStats()
      .then(s => {
        if (!alive) return;
        setStats(s);
        setStatsState('ready');
      })
      .catch(e => {
        console.warn('Dashboard unavailable:', e);
        if (alive) setStatsState('error'); // ซ่อนแดชบอร์ดถ้า backend ไม่ตอบ
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const totalCount = useCountUp(stats ? (stats.total_inquiries ?? 0) : null);
  const avgAi = useCountUp(stats ? (stats.avg_ai_response_sec ?? 0) : null, true);

  // ── AI Input Assistant (debounce) ──
  const fetchSuggestion = useCallback(async (value: string, id: number) => {
    try {
      const data = await suggestInput(value);
      if (id !== reqId.current) return; // มีการพิมพ์ใหม่แล้ว ทิ้งผลเก่า
      if (data.status === 'can_add' && data.suggestion) {
        setSuggest({ kind: 'suggestion', text: data.suggestion });
      } else {
        setSuggest({ kind: 'idle' });
      }
    } catch (e) {
      if (id === reqId.current) setSuggest({ kind: 'idle' });
      console.warn('Input suggestion unavailable:', e);
    }
  }, []);

  const onChangeText = (value: string) => {
    setText(value);
    if (value) setInvalid(false);
    if (timer.current) clearTimeout(timer.current);
    reqId.current += 1;
    const id = reqId.current;
    if (!value.trim()) {
      setSuggest({ kind: 'idle' });
      return;
    }
    setSuggest({ kind: 'analyzing' });
    timer.current = setTimeout(() => fetchSuggestion(value.trim(), id), SUGGESTION_DEBOUNCE_MS);
  };

  const submit = () => {
    const value = text.trim();
    if (!value) {
      setInvalid(true);
      return;
    }
    session.setUserText(value);
    session.setAnalysis(null);
    router.push('/result');
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    reqId.current += 1;
    setText('');
    setInvalid(false);
    setSuggest({ kind: 'idle' });
    session.setUserText('');
    session.setAnalysis(null);
  };

  const top = stats?.top_benefits ?? [];
  const cats = stats?.category_breakdown ?? [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="กรอกข้อมูลผู้ใช้" onLogoPress={() => router.navigate('/')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Steps />

        <SectionTitle>ข้อมูลของคุณ</SectionTitle>
        <AppText weight="semi" style={styles.label}>
          พิมพ์ข้อมูลที่ต้องการให้ระบบตรวจสอบ
        </AppText>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          textAlignVertical="top"
          placeholder="ตัวอย่าง: อายุ 65 ปี สัญชาติไทย ไม่มีงานทำ ไม่มีประกันสังคม มีบัตรผู้พิการ และมีบุตรอายุ 4 ปี"
          placeholderTextColor="#BBBBBB"
          style={[
            styles.input,
            text ? { borderColor: colors.green, backgroundColor: colors.greenBg } : null,
            focused ? { borderColor: colors.navyLight } : null,
            invalid ? { borderColor: colors.red, backgroundColor: colors.redBg } : null,
          ]}
        />
        {invalid && (
          <AppText style={{ fontSize: 13, color: colors.red, marginTop: 4 }}>
            กรุณาพิมพ์ข้อมูลอย่างน้อย 1 อย่าง
          </AppText>
        )}
        <AppText style={{ fontSize: 12.5, color: colors.textMuted, marginTop: 8 }}>
          ผู้ช่วยอัจฉริยะจะช่วยแนะนำข้อมูลเพิ่มเติมให้ท่าน
        </AppText>

        {suggest.kind !== 'idle' && (
          <View style={styles.suggest}>
            <AppText style={{ fontSize: 14 }}>{suggest.kind === 'analyzing' ? '⏳' : '💡'}</AppText>
            <AppText
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: 22,
                color: suggest.kind === 'analyzing' ? colors.textMuted : colors.textSub,
                fontFamily: suggest.kind === 'analyzing' ? fonts.regular : fonts.regular,
              }}>
              {suggest.kind === 'analyzing' ? 'กำลังวิเคราะห์ข้อมูล...' : suggest.text}
            </AppText>
          </View>
        )}

        {statsState !== 'error' && (
          <View style={styles.dashboard}>
            <SectionTitle>สถิติการใช้งานระบบ</SectionTitle>

            <View style={styles.dashCard}>
              <AppText weight="bold" style={styles.dashTitle}>
                ภาพรวมการใช้งาน
              </AppText>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.statBox}>
                  <AppText weight="bold" style={styles.statValue}>
                    {totalCount}
                  </AppText>
                  <AppText style={styles.statLabel}>{'การตรวจสอบ\nทั้งหมด'}</AppText>
                </View>
                <View style={styles.statBox}>
                  <AppText weight="bold" style={styles.statValue}>
                    {avgAi}
                  </AppText>
                  <AppText style={styles.statLabel}>{'เวลา AI\nเฉลี่ย (วินาที)'}</AppText>
                </View>
              </View>
            </View>

            <View style={styles.dashCard}>
              <AppText weight="bold" style={styles.dashTitle}>
                หมวดหมู่สิทธิที่ถูกตรวจสอบ
              </AppText>
              {statsState === 'loading' ? (
                <Skeleton height={220} />
              ) : (
                <PieChart
                  data={cats.map(c => ({ label: CATEGORY_NAME[c.category] || c.category, value: c.count }))}
                />
              )}
            </View>

            <View style={styles.dashCard}>
              <AppText weight="bold" style={styles.dashTitle}>
                ผลประเมินเบื้องต้น
              </AppText>
              {statsState === 'loading' ? (
                <Skeleton height={180} />
              ) : (
                <BarChart
                  data={top.map(t => ({ label: SHORT_NAME[t.benefit] || t.benefit, value: t.count }))}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <FooterBar>
        <PrimaryButton label="ตรวจสอบสิทธิ" onPress={submit} />
        <SecondaryButton label="ล้างข้อมูล" onPress={clear} />
      </FooterBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  steps: { flexDirection: 'row', justifyContent: 'center', marginBottom: 28 },
  circle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line: { width: 48, height: 2, backgroundColor: colors.border, marginHorizontal: 8, marginTop: 17 },
  label: { fontSize: 14, color: colors.textSub, marginBottom: 7 },
  input: {
    minHeight: 190,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
    color: colors.textMain,
    fontFamily: fonts.regular,
    fontSize: 15.5,
    lineHeight: 26,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggest: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.suggestBg,
    borderWidth: 1,
    borderColor: 'rgba(35,80,160,0.25)',
    borderRadius: 8,
  },
  dashboard: { marginTop: 32, paddingTop: 24, borderTopWidth: 2, borderTopColor: colors.border },
  dashCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.navy,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dashTitle: { fontSize: 13, color: colors.navy, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center' },
  statValue: { fontSize: 25, color: colors.navy, lineHeight: 36 },
  statLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
