import { Text, type TextProps } from 'react-native';
import { colors, fonts } from '@/lib/theme';

type Weight = keyof typeof fonts;

// Text ที่ใช้ฟอนต์ Sarabun และสีตัวอักษรหลักเป็นค่าเริ่มต้น
export function AppText({
  weight = 'regular',
  style,
  ...rest
}: TextProps & { weight?: Weight }) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], color: colors.textMain, fontSize: 16 }, style]} />;
}
