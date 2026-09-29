import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F5F7F5',
  card: '#FFFFFF',
  ink: '#19352F',
  muted: '#62766F',
  green: '#146B52',
  paleGreen: '#E4F3E9',
  amber: '#9A5D08',
  paleAmber: '#FFF1D6',
  red: '#A23F37',
  paleRed: '#FCE8E5',
  border: '#DDE7E0',
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: colors.green, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 25, marginBottom: 12 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 17, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assetLabel: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  body: { color: colors.ink, fontSize: 15 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.paleGreen, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, marginTop: 12 },
  pillText: { color: colors.green, fontSize: 12, fontWeight: '700' },
  button: { backgroundColor: colors.green, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: { borderColor: colors.green, borderWidth: 1, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.green, fontSize: 15, fontWeight: '800' },
  input: { backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink, fontSize: 16, marginTop: 8 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 18 },
  error: { color: colors.red, fontSize: 14, marginTop: 12 },
});
