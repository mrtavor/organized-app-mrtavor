import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { MonthItemProps, MonthStatusType } from './index.types';
import { monthNamesState } from '@states/app';
import { currentMonthServiceYear } from '@utils/date';
import { congFieldServiceReportsState } from '@states/field_service_reports';
import { branchFieldReportsState } from '@states/branch_field_service_reports';
import useCurrentUser from '@hooks/useCurrentUser';
import usePerson from '@features/persons/hooks/usePerson';

const useMonthItem = ({ month, person }: MonthItemProps) => {
  const { first_report } = useCurrentUser();

  const {
    personIsEnrollmentActive,
    personIsBaptizedPublisher,
    personIsUnbaptizedPublisher,
  } = usePerson();

  const monthNames = useRecoilValue(monthNamesState);

  const reports = useRecoilValue(congFieldServiceReportsState);
  const branchReports = useRecoilValue(branchFieldReportsState);

  const [showEdit, setShowEdit] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const branchReport = useMemo(() => {
    return branchReports.find((record) => record.report_date === month);
  }, [branchReports, month]);

  const report = useMemo(() => {
    if (!person) return;

    return reports.find(
      (record) =>
        record.report_data.report_date === month &&
        record.report_data.person_uid === person.person_uid
    );
  }, [reports, month, person]);

  const monthname = useMemo(() => {
    const monthIndex = +month.split('/')[1] - 1;
    return monthNames[monthIndex];
  }, [month, monthNames]);

  const isCurrent = useMemo(() => {
    const current = currentMonthServiceYear();

    return month === current;
  }, [month]);

  const isAhead = useMemo(() => {
    const current = currentMonthServiceYear();

    return month > current;
  }, [month]);

  const monthStatus: MonthStatusType = useMemo(() => {
    if (!first_report || first_report?.length === 0) return;

    if (month < first_report) return;

    if (!report) return 'not_shared';

    const status = report.report_data.shared_ministry ? 'shared' : 'not_shared';
    return status;
  }, [month, first_report, report]);

  const isAP = useMemo(() => {
    return personIsEnrollmentActive(person, 'AP', month);
  }, [person, month, personIsEnrollmentActive]);

  const total_hours = useMemo(() => {
    if (!report) return 0;

    const field = report.report_data.hours.field_service;
    const credit = report.report_data.hours.credit.approved;

    return field + credit;
  }, [report]);

  const bible_studies = useMemo(() => {
    if (!report) return 0;

    return report.report_data.bible_studies;
  }, [report]);

  const comments = useMemo(() => {
    if (!report) return '';

    return report.report_data.comments;
  }, [report]);

  const isInactive = useMemo(() => {
    if (!person) return true;

    const isBaptized = personIsBaptizedPublisher(person, month);
    const isUnbaptized = personIsUnbaptizedPublisher(person, month);

    const active = isBaptized || isUnbaptized;

    return !active;
  }, [person, month, personIsBaptizedPublisher, personIsUnbaptizedPublisher]);

  const allowEdit = useMemo(() => {
    if (isInactive) return false;

    if (!first_report || first_report?.length === 0) return false;

    if (month < first_report) return false;

    if (!branchReport) return true;

    if (branchReport.report_data.submitted && monthStatus === 'not_shared') {
      return true;
    }

    if (!branchReport.report_data.submitted) {
      return true;
    }

    return false;
  }, [isInactive, month, first_report, branchReport, monthStatus]);

  const mobileShowEdit = useMemo(() => {
    if (!allowEdit) return false;

    if (isCurrent || isAhead) return false;

    return true;
  }, [allowEdit, isCurrent, isAhead]);

  const handleHover = () => {
    if (!mobileShowEdit) return;

    setShowEdit(true);
  };

  const handleUnhover = () => {
    setShowEdit(false);
  };

  const handleOpenEditor = () => {
    setShowEdit(false);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setShowEdit(false);
    setEditorOpen(false);
  };

  return {
    monthname,
    monthStatus,
    bible_studies,
    total_hours,
    isAP,
    comments,
    isCurrent,
    isAhead,
    showEdit,
    handleHover,
    handleUnhover,
    editorOpen,
    handleOpenEditor,
    handleCloseEditor,
    mobileShowEdit,
  };
};

export default useMonthItem;
