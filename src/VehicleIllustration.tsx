import { Image, Text, View } from 'react-native';
import type { Asset } from './model';
import { colors, styles } from './ui';

const images = {
  Bike: require('../assets/demo-bike.png'),
  Car: require('../assets/demo-car.png'),
};

export function VehicleIllustration({ vehicleType }: { vehicleType: Asset['vehicleType'] }) {
  if (!vehicleType) return null;

  return (
    <View style={{ backgroundColor: colors.background, borderRadius: 14, padding: 12 }}>
      <Image
        source={images[vehicleType]}
        style={{ width: '100%', height: 170 }}
        resizeMode="contain"
        accessibilityLabel={`Representative ${vehicleType.toLowerCase()} illustration`}
      />
      <Text style={[styles.muted, { textAlign: 'center', marginTop: 4 }]}>Representative image · not the registered vehicle</Text>
    </View>
  );
}
