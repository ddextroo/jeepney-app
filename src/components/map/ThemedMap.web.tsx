import { forwardRef } from 'react';
import { View } from 'react-native';

import { MapPlaceholder } from './MapPlaceholder';
import type { MapCameraHandle, ThemedMapProps } from './ThemedMap';

/**
 * Web build of ThemedMap. Never references @rnmapbox/maps so the web bundle
 * stays clean; always renders the designed dark placeholder map.
 */
export const ThemedMap = forwardRef<MapCameraHandle, ThemedMapProps>(function ThemedMap(props, ref) {
  return (
    <View style={{ flex: 1 }}>
      <MapPlaceholder
        ref={ref}
        routes={props.routes}
        stops={props.stops}
        selectedRouteId={props.selectedRouteId}
        userLocation={props.userLocation}
        mode={props.mode}
      />
    </View>
  );
});

export type { MapCameraHandle, ThemedMapProps };

