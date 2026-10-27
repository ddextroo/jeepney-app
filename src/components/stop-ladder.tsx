import { View } from 'react-native';

import type { Stop } from '@/data/types';
import { palette, radius, spacing } from '@/theme';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

type StopLadderProps = {
  stops: Stop[];
  boardId: string;
  alightId: string;
  color: string;
};

/** Vertical stop-by-stop ladder with board/alight markers and connector line. */
export function StopLadder({ stops, boardId, alightId, color }: StopLadderProps) {
  return (
    <View>
      {stops.map((stop, index) => {
        const isBoard = stop.id === boardId;
        const isAlight = stop.id === alightId;
        const isEnd = index === stops.length - 1;
        const isMid = !isBoard && !isAlight;

        return (
          <View key={stop.id} style={{ flexDirection: 'row' }}>
            {/* rail column */}
            <View style={{ width: 28, alignItems: 'center' }}>
              <View style={{ width: 2, flex: 1, backgroundColor: index === 0 ? 'transparent' : palette.border }} />
              <StopDot isBoard={isBoard} isAlight={isAlight} isMid={isMid} color={color} />
              <View style={{ width: 2, flex: 1, backgroundColor: isEnd ? 'transparent' : palette.border }} />
            </View>

            {/* content column */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <AppText variant={isBoard || isAlight ? 'bodyStrong' : 'body'} numberOfLines={1}>
                  {stop.name}
                </AppText>
                {isBoard ? <Tag label="Board here" color={palette.success} /> : null}
                {isAlight ? <Tag label='Shout "Alang!" here' color={palette.danger} /> : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StopDot({ isBoard, isAlight, isMid, color }: { isBoard: boolean; isAlight: boolean; isMid: boolean; color: string }) {
  if (isBoard || isAlight) {
    return (
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.pill,
          backgroundColor: palette.white,
          borderWidth: 3,
          borderColor: isBoard ? palette.success : palette.danger,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={isBoard ? 'flag' : 'location'} size={9} color={isBoard ? palette.success : palette.danger} />
      </View>
    );
  }
  return <View style={{ width: 10, height: 10, borderRadius: radius.pill, backgroundColor: isMid ? color : palette.border }} />;
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', marginTop: 2, paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: `${color}1A` }}>
      <AppText variant="micro" color={color}>
        {label}
      </AppText>
    </View>
  );
}
