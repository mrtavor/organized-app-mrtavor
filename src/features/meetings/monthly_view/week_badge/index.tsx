import { useState, MouseEvent } from 'react';
import Typography from '@components/typography';
import { Box, IconButton } from '@mui/material';
import { WeekBadgeType } from './index.types';
import { IconGenerate } from '@components/icons';
import IconLoading from '@components/icon_loading';
import { displaySnackNotification } from '@services/states/app';
import { getMessageByCode } from '@services/i18n/translation';
import { schedulesStartAutofill } from '@services/app/autofill';
import { useAppTranslation } from '@hooks/index';

const WeekBadge = (props: WeekBadgeType) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useAppTranslation();

  const handleAutofill = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!props.week) return;

    // Guard: show informative snackbar if the week's source data isn't
    // available on JW.ORG yet instead of silently no-oping.
    if (props.isWeekAvailable === false) {
      displaySnackNotification({
        header: t('tr_meetingContentPending', {
          defaultValue: 'Meeting content pending',
        }),
        message: t('tr_meetingContentPendingDesc', {
          defaultValue:
            "This week's meeting programme hasn't been released on JW.ORG yet. Try again once it's available.",
        }),
        severity: 'success',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await schedulesStartAutofill(props.week, props.week, 'midweek');
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      displaySnackNotification({
        header: getMessageByCode('error_app_generic-title'),
        message: getMessageByCode((error as Error).message),
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        flex: '1',
        height: '32px',
        padding: '6px 8px 6px 8px',
        gap: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--accent-150)',
        borderRadius: 'var(--radius-s)',
        position: 'relative',
      }}
    >
      <Typography color={'var(--accent-dark)'} className="h4">
        {props.text}
      </Typography>
      {props.week && (
        <IconButton
          onClick={handleAutofill}
          disabled={isProcessing}
          sx={{
            padding: '4px',
            position: 'absolute',
            right: '4px',
          }}
        >
          {isProcessing ? (
            <IconLoading width={16} height={16} color="var(--accent-dark)" />
          ) : (
            <IconGenerate color="var(--accent-dark)" />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default WeekBadge;
