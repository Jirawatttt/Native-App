import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppText } from './AppText';
import { colors } from '@/lib/theme';

export interface Datum {
  label: string;
  value: number;
}

const BAR_COLORS = [
  'rgba(27,58,107,0.80)',
  'rgba(35,80,160,0.75)',
  'rgba(27,58,107,0.65)',
  'rgba(35,80,160,0.55)',
  'rgba(27,58,107,0.45)',
];

const PIE_COLORS = [
  'rgba(27,58,107,0.85)',
  'rgba(35,80,160,0.80)',
  'rgba(201,162,39,0.85)',
  'rgba(27,58,107,0.55)',
  'rgba(35,80,160,0.50)',
  'rgba(201,162,39,0.55)',
  'rgba(135,150,171,0.75)',
];

// กราฟแท่ง (สิทธิยอดนิยม)
export function BarChart({ data }: { data: Datum[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const H = 120;
  return (
    <View style={styles.barRow}>
      {data.map((d, i) => (
        <View key={`${d.label}-${i}`} style={styles.barCol}>
          <AppText weight="semi" style={styles.barValue}>
            {d.value}
          </AppText>
          <View
            style={{
              height: Math.max((d.value / max) * H, 4),
              width: '70%',
              backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
              borderRadius: 6,
            }}
          />
          <AppText style={styles.barLabel} numberOfLines={2}>
            {d.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

// กราฟวงกลม (หมวดหมู่สิทธิ) วาดด้วย SVG
export function PieChart({ data, size = 190 }: { data: Datum[]; size?: number }) {
  const items = data.filter(d => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const c = size / 2;
  const r = c - 2;
  const slices = items.map((d, i) => {
    const before = items.slice(0, i).reduce((sum, x) => sum + x.value, 0);
    const a1 = -Math.PI / 2 + (before / total) * Math.PI * 2;
    const a2 = a1 + (d.value / total) * Math.PI * 2;
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return {
      key: `${d.label}-${i}`,
      color: PIE_COLORS[i % PIE_COLORS.length],
      path: `M ${c} ${c} L ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${c + r * Math.cos(a2)} ${c + r * Math.sin(a2)} Z`,
    };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {items.length === 1 ? (
          <Circle cx={c} cy={c} r={r} fill={slices[0].color} stroke="#fff" strokeWidth={2} />
        ) : (
          slices.map(s => <Path key={s.key} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />)
        )}
      </Svg>
      <View style={styles.legend}>
        {items.map((d, i) => (
          <View key={`${d.label}-${i}`} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }]} />
            <AppText style={{ fontSize: 12 }}>
              {d.label} ({d.value})
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

// กล่อง placeholder สีเทาระหว่างรอโหลดกราฟ
export function Skeleton({ height }: { height: number }) {
  const [opacity] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ height, borderRadius: 8, backgroundColor: '#E4E9F2', opacity }} />;
}

const styles = StyleSheet.create({
  barRow: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 190, borderBottomWidth: 1, borderBottomColor: '#E8EDF5' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  barLabel: { fontSize: 11, textAlign: 'center', marginTop: 6, marginBottom: 4, minHeight: 32 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
