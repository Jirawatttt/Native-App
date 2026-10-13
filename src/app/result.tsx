import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { BenefitCard } from '@/components/BenefitCard';
import { FooterBar, IconButton, PrimaryButton } from '@/components/Buttons';
import { analyzeMoreRights, analyzeRights, type Analysis } from '@/lib/api';
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/labels';
import { useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

const BASE_DISCLAIMER =
  '* หมายเหตุ: ผลที่แสดงเป็นการประเมินเบื้องต้นเท่านั้น กรุณาติดต่อหน่วยงานที่เกี่ยวข้องเพื่อยืนยันสิทธิอย่างเป็นทางการ';

function Hero({ title, body, loading }: { title: string; body: string; loading?: boolean }) {
  return (
    <LinearGradient
      colors={['#11264e', '#245a9b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, loading && { minHeight: 174, justifyContent: 'center' }]}>
      <AppText weight="bold" style={styles.kicker}>
        AI + RAG ANALYSIS
      </AppText>
      <AppText weight="bold" style={styles.heroTitle}>
        {title}
      </AppText>
      {!!body && <AppText style={styles.heroBody}>{body}</AppText>}
      {loading && <Dots />}
    </LinearGradient>
  );
}

function Dots() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 3), 350);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 7, marginTop: 20 }}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#f3cf7a',
            opacity: tick === i ? 1 : 0.3,
          }}
        />
      ))}
    </View>
  );
}

const messageOf = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export default function ResultScreen() {
  const { userText, analysis, setAnalysis } = useSession();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>(analysis ? 'done' : 'loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const runInitial = useCallback(async () => {
    try {
      const result = await analyzeRights(userText);
      setAnalysis(result);
      setPhase('done');
    } catch (e) {
      console.error('AI analysis error:', e);
      setErrorMsg(messageOf(e, 'ไม่สามารถเชื่อมต่อกับ server ได้'));
      setPhase('error');
    }
  }, [userText, setAnalysis]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (analysis) return;
    if (!userText) {
      router.replace('/input');
      return;
    }
    analyzeRights(userText)
      .then(result => {
        setAnalysis(result);
        setPhase('done');
      })
      .catch(e => {
        console.error('AI analysis error:', e);
        setErrorMsg(messageOf(e, 'ไม่สามารถเชื่อมต่อกับ server ได้'));
        setPhase('error');
      });
  }, [analysis, userText, setAnalysis]);

  const loadMore = async () => {
    const extra = analysis?.additional_benefits ?? [];
    if (!analysis || !userText || extra.length === 0) return;
    setLoadingMore(true);
    try {
      const more = await analyzeMoreRights(userText, extra.map(x => x.slug));
      const merged: Analysis = {
        ...analysis,
        benefits: [...(analysis.benefits ?? []), ...(more.benefits ?? [])],
        follow_up_questions: [
          ...new Set([...(analysis.follow_up_questions ?? []), ...(more.follow_up_questions ?? [])]),
        ],
        additional_benefits: [],
      };
      setAnalysis(merged);
    } catch (e) {
      console.error('Additional AI analysis error:', e);
      Alert.alert('ไม่สำเร็จ', e instanceof Error && e.message ? e.message : 'ไม่สามารถวิเคราะห์สิทธิเพิ่มเติมได้');
    } finally {
      setLoadingMore(false);
    }
  };

  const benefits = analysis?.benefits ?? [];

  const buildText = () => {
    let t = `ผลการวิเคราะห์สิทธิประโยชน์ภาครัฐเบื้องต้น\nพบรายการ ${benefits.length} รายการ\n${'='.repeat(40)}\n\n`;
    benefits.forEach((b, i) => {
      t += `${i + 1}. ${b.name}\n`;
      t += `   สถานะ: ${STATUS_LABEL[b.status] ?? b.status}\n`;
      t += `   ${b.explanation}\n`;
      t += `   ตรวจเพิ่ม: ${(b.missing_information ?? []).join(', ') || '-'}\n\n`;
    });
    return t;
  };

  const copy = async () => {
    if (benefits.length === 0) return;
    await Clipboard.setStringAsync(buildText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (benefits.length === 0) return;
    Share.share({ message: buildText() }).catch(() => {});
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace('/input'));

  const disclaimer = analysis?.coverage_warning
    ? `${BASE_DISCLAIMER} ${analysis.coverage_warning}`
    : BASE_DISCLAIMER;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="ผลการตรวจสอบสิทธิ" onLogoPress={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionBar}>
          <IconButton label="แชร์ผลลัพธ์" onPress={share} disabled={phase !== 'done'} />
          <IconButton
            label={copied ? '✓ คัดลอกแล้ว' : 'คัดลอกผลลัพธ์'}
            onPress={copy}
            disabled={phase !== 'done'}
            done={copied}
          />
        </View>

        {phase === 'loading' && (
          <Hero
            loading
            title="กำลังวิเคราะห์ข้อมูลของคุณ"
            body="AI กำลังอ่านข้อมูลที่คุณพิมพ์และค้นหาหลักฐานจากฐานความรู้ อาจใช้เวลาสักครู่"
          />
        )}

        {phase === 'error' && (
          <View style={styles.noResult}>
            <View style={styles.noIcon}>
              <AppText weight="bold" style={{ fontSize: 22, color: '#C77700' }}>
                !
              </AppText>
            </View>
            <AppText weight="bold" style={{ fontSize: 18, marginBottom: 8 }}>
              ยังไม่สามารถวิเคราะห์ด้วย AI ได้
            </AppText>
            <AppText style={{ color: colors.textSub, textAlign: 'center', lineHeight: 26, marginBottom: 16 }}>
              {errorMsg}
              {'\n'}กรุณาลองใหม่อีกครั้ง
            </AppText>
            <PrimaryButton
              label="ลองอีกครั้ง"
              onPress={() => {
                setPhase('loading');
                runInitial();
              }}
            />
          </View>
        )}

        {phase === 'done' && analysis && (
          <>
            <Hero title="ผลวิเคราะห์สิทธิประโยชน์เบื้องต้น" body={analysis.summary ?? ''} />

            {STATUS_ORDER.flatMap(status =>
              benefits.filter(b => b.status === status).map((b, i) => (
                <BenefitCard key={`${status}-${b.slug ?? b.name}-${i}`} item={b} />
              )),
            )}

            {benefits.length === 0 && (
              <View style={styles.noResult}>
                <AppText weight="bold" style={{ fontSize: 18 }}>
                  โปรดตรวจสอบคำถามของคุณ
                </AppText>
              </View>
            )}

            {(analysis.additional_benefits ?? []).length > 0 && (
              <View style={styles.more}>
                <AppText weight="bold" style={{ color: colors.navy, fontSize: 16, marginBottom: 6 }}>
                  สิทธิที่อาจเกี่ยวข้องเพิ่มเติม ({analysis.additional_benefits!.length})
                </AppText>
                <AppText style={{ color: colors.textSub, lineHeight: 25, marginBottom: 14 }}>
                  พบรายการเพิ่มเติม คุณสามารถให้ AI สรุปรายละเอียดในรูปแบบเดียวกับผลหลักได้
                </AppText>
                <View style={{ alignSelf: 'flex-start' }}>
                  <IconButton
                    label={loadingMore ? 'กำลังวิเคราะห์สิทธิเพิ่มเติม...' : 'ดูรายการเพิ่มเติม'}
                    onPress={loadMore}
                    disabled={loadingMore}
                  />
                </View>
              </View>
            )}

            {(analysis.follow_up_questions ?? []).length > 0 && (
              <View style={[styles.qCard]}>
                <AppText weight="bold" style={{ fontSize: 17, marginBottom: 10 }}>
                  คำถามเพื่อให้วิเคราะห์ได้แม่นยำขึ้น
                </AppText>
                {analysis.follow_up_questions!.map((q, i) => (
                  <AppText key={i} style={{ color: colors.textSub, lineHeight: 26, marginBottom: 4 }}>
                    • {q}
                  </AppText>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.disclaimer}>
          <AppText style={{ fontSize: 13, color: colors.textMuted, lineHeight: 21 }}>{disclaimer}</AppText>
        </View>
      </ScrollView>

      <FooterBar>
        <PrimaryButton label="ตรวจสอบอีกครั้ง" onPress={back} />
      </FooterBar>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 28 },
  actionBar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  hero: { borderRadius: 16, padding: 24, marginBottom: 20 },
  kicker: { color: '#f3cf7a', letterSpacing: 1.5, fontSize: 11.5, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 20, marginBottom: 8, lineHeight: 30 },
  heroBody: { color: 'rgba(255,255,255,0.86)', lineHeight: 26, fontSize: 15 },
  noResult: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  noIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  more: {
    marginTop: 4,
    marginBottom: 16,
    padding: 18,
    backgroundColor: colors.answerBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  qCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    borderRadius: 8,
  },
});
