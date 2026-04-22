import { ReactElement } from 'react';
import { WeekHoverBoxType } from './index.types';
import MeetingPart from '@features/meetings/meeting_part';
import Tooltip from '@components/tooltip';
import { useAtomValue } from 'jotai';
import { userDataViewState } from '@states/settings';
import { sourcesState } from '@states/sources';
import Typography from '@components/typography';
import { useAppTranslation } from '@hooks/index';

const WeekHoverBox = (props: WeekHoverBoxType) => {
  const { t } = useAppTranslation();
  const dataView = useAtomValue(userDataViewState);
  const sources = useAtomValue(sourcesState);

  // A week is "available" if a source record exists for it
  const isWeekAvailable =
    !props.week || sources.some((s) => s.weekOf === props.week);

  const tooltipTitle = isWeekAvailable ? (
    <MeetingPart
      week={props.week}
      type={props.type}
      color={'var(--black)'}
      dataView={dataView}
    />
  ) : (
    <Typography className="body-small-regular" color="var(--grey-400)">
      {t('tr_meetingContentPending', {
        defaultValue:
          "Content pending — this week's material isn't available on JW.ORG yet",
      })}
    </Typography>
  );

  return (
    <Tooltip
      sx={{
        flex: '1',
        // Prevent this flex child from growing beyond its share of the row
        minWidth: 0,
        ...props.sx,
      }}
      placement="bottom-start"
      slotProps={{
        tooltip: {
          sx: {
            padding: '16px',
            borderRadius: 'var(--radius-m)',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--accent-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '339px',
          },
        },
        popper: { style: { zIndex: 2 } },
      }}
      title={tooltipTitle}
    >
      {props.children as ReactElement}
    </Tooltip>
  );
};

export default WeekHoverBox;
