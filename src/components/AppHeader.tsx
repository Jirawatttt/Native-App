import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { colors } from '@/lib/theme';

// แถบ header สีกรมท่า มีเส้นสีทองด้านบน (เหมือน .app-header ของเว็บ)
export function AppHeader({ title, onLogoPress }: { title: string; onLogoPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const logo = (
    <Image
      source={require('../../assets/images/logo.png')}
      style={styles.logo}
      resizeMode="contain"
      accessibilityLabel="Smart Rights Viewer"
    />
  );
  return (
    <LinearGradient
      colors={[colors.navyDark, colors.navy, colors.navyLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top, height: 68 + insets.top }]}>
      <LinearGradient
        colors={[colors.gold, colors.goldLight, colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.goldLine, { top: insets.top }]}
      />
      {onLogoPress ? (
        <Pressable onPress={onLogoPress} hitSlop={10} accessibilityRole="button">
          {logo}
        </Pressable>
      ) : (
        logo
      )}
      <AppText weight="bold" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
        {title}
      </AppText>
      <View style={styles.spacer} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  goldLine: { position: 'absolute', left: 0, right: 0, height: 3 },
  logo: { width: 36, height: 36, tintColor: '#fff' },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, marginHorizontal: 8 },
  spacer: { width: 36 },
});
