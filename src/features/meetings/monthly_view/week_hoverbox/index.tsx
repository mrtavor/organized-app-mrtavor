import { ReactElement } from 'react';
import { WeekHoverBoxType } from './index.types';
import MeetingPart from '@features/meetings/meeting_part';
import Tooltip from '@components/tooltip';
import { useAtomValue } from 'jotai';
import { userDataViewState } from '@states/settings';

const WeekHoverBox = (props: WeekHoverBoxType) => {
  const dataView = useAtomValue(userDataViewState);

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
      title={
        <MeetingPart
          week={props.week}
          type={props.type}
          color={'var(--black)'}
          dataView={dataView}
        />
      }
    >
      {props.children as ReactElement}
    </Tooltip>
  );
};

export default WeekHoverBox;
