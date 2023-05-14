import { lazy, useEffect, useState, Suspense } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import CssBaseline from '@mui/material/CssBaseline';
import { InternetChecker } from './features/internetChecker';
import NotificationWrapper from './features/notificationWrapper';
import PrivateVipConnectedRoute from './components/PrivateVipConnectedRoute';
import PrivateVipRoute from './components/PrivateVipRoute';
import ErrorBoundary from './components/ErrorBoundary';
import backupWorkerInstance from './workers/backupWorker';
import { apiHostState, isLightThemeState, isOnlineState, roleReloadState, visitorIDState } from './states/main';
import { congAccountConnectedState } from './states/congregation';
import { appSnackOpenState } from './states/notification';
import WaitingPage from './components/WaitingPage';
import { Setting } from './classes/Setting';
import PrivateSecretaryRoute from './components/PrivateSecretaryRoute';
import PrivateLMMORoute from './components/PrivateLMMORoute';

// lazy loading
const Layout = lazy(() => import('./components/Layout'));
const Administration = lazy(() => import('./pages/Administration'));
const DashboardMenu = lazy(() => import('./pages/DashboardMenu'));
const Persons = lazy(() => import('./pages/Persons'));
const PersonDetails = lazy(() => import('./pages/PersonDetails'));
const Schedules = lazy(() => import('./pages/Schedules'));
const ScheduleDetails = lazy(() => import('./pages/ScheduleDetails'));
const S89 = lazy(() => import('./pages/S89'));
const ScheduleWeekDetails = lazy(() => import('./pages/ScheduleWeekDetails'));
const Settings = lazy(() => import('./pages/UserSettings'));
const SourceMaterials = lazy(() => import('./pages/SourceMaterials'));
const SourceWeekDetails = lazy(() => import('./pages/SourceWeekDetails'));
const CongregationPersonDetails = lazy(() => import('./pages/CongregationPersonDetails'));
const WeeklyAssignments = lazy(() => import('./pages/WeeklyAssignments'));
const CongregationSettings = lazy(() => import('./pages/CongregationSettings'));
const FieldServiceGroup = lazy(() => import('./pages/FieldServiceGroup'));
const MeetingAttendance = lazy(() => import('./pages/MeetingAttendance'));
const FieldServiceReport = lazy(() => import('./pages/FieldServiceReport'));
const BranchOfficeReports = lazy(() => import('./pages/BranchOfficeReports'));

// creating theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const queryClient = new QueryClient();

const App = ({ updatePwa }) => {
  const setVisitorID = useSetRecoilState(visitorIDState);
  const setApiHost = useSetRecoilState(apiHostState);

  const isOnline = useRecoilValue(isOnlineState);
  const isLight = useRecoilValue(isLightThemeState);
  const appSnackOpen = useRecoilValue(appSnackOpenState);
  const isCongAccountConnected = useRecoilValue(congAccountConnectedState);
  const roleReload = useRecoilValue(roleReloadState);

  const [activeTheme, setActiveTheme] = useState(darkTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  const secretaryRole = Setting.cong_role.includes('secretary');
  const lmmoRole = Setting.cong_role.includes('lmmo') || Setting.cong_role.includes('lmmo-backup');
  const adminRole = Setting.cong_role.includes('admin');

  const router = createHashRouter([
    {
      element: <Layout updatePwa={updatePwa} />,
      errorElement: <ErrorBoundary />,
      children: [
        { path: '/', element: <DashboardMenu /> },
        {
          path: '/schedules/view/:weekToFormat',
          element: <WeeklyAssignments />,
        },
        {
          path: '/user-settings',
          element: <Settings />,
        },
        {
          element: <PrivateVipRoute isLMMO={lmmoRole} isSecretary={secretaryRole} />,
          children: [
            {
              path: '/persons',
              element: <Persons />,
            },
            {
              path: '/persons/new',
              element: <PersonDetails />,
            },
            {
              path: '/persons/:id',
              element: <PersonDetails />,
            },
            {
              element: <PrivateLMMORoute isLMMO={lmmoRole} />,
              children: [
                {
                  path: '/schedules',
                  element: <Schedules />,
                },
                {
                  path: '/schedules/:schedule',
                  element: <ScheduleDetails />,
                },
                {
                  path: '/schedules/:schedule/:weekToFormat',
                  element: <ScheduleWeekDetails />,
                },
                {
                  path: '/assignment-form',
                  element: <S89 />,
                },
                {
                  path: '/source-materials',
                  element: <SourceMaterials />,
                },
                {
                  path: '/source-materials/:weekToFormat',
                  element: <SourceWeekDetails />,
                },
              ],
            },
            {
              element: <PrivateSecretaryRoute isSecretary={secretaryRole} />,
              children: [
                {
                  path: '/field-service-group',
                  element: <FieldServiceGroup />,
                },
                {
                  path: '/meeting-attendance-record',
                  element: <MeetingAttendance />,
                },
                {
                  path: '/field-service-report',
                  element: <FieldServiceReport />,
                },
                {
                  path: '/branch-office-reports',
                  element: <BranchOfficeReports />,
                },
              ],
            },
            {
              path: '/congregation-settings',
              element: <CongregationSettings />,
            },

            {
              element: <PrivateVipConnectedRoute isCongAccountConnected={isCongAccountConnected} isAdmin={adminRole} />,
              children: [
                {
                  path: '/administration',
                  element: <Administration />,
                },
                {
                  path: '/administration/members/:id',
                  element: <CongregationPersonDetails />,
                },
              ],
            },
          ],
        },
        { path: '*', element: <DashboardMenu /> },
      ],
    },
  ]);

  useEffect(() => {
    if (isLight) {
      setActiveTheme(lightTheme);
    } else {
      setActiveTheme(darkTheme);
    }
  }, [isLight]);

  useEffect(() => {
    // get visitor ID and check if there is an active connection
    const getUserID = async () => {
      try {
        const fpPromise = FingerprintJS.load({
          apiKey: import.meta.env.VITE_FINGERPRINT_API_CLIENT_KEY,
        });

        let visitorId = '';

        const fp = await fpPromise;
        const result = await fp.get();
        visitorId = result.visitorId;
        console.info('CPE: Fingerprint: Device visitor id has been set');

        setVisitorID(visitorId);
        backupWorkerInstance.setVisitorID(visitorId);
      } catch (error) {
        console.error(`CPE: Fingerprint: ${error}`);
      }
    };

    if (isOnline) {
      getUserID();
    }
  }, [setVisitorID, isOnline]);

  useEffect(() => {
    let apiHost;
    if (
      !process.env.NODE_ENV ||
      process.env.NODE_ENV === 'development' ||
      window.location.host.indexOf('localhost') !== -1
    ) {
      if (import.meta.env.VITE_API_REMOTE_URL) {
        apiHost = import.meta.env.VITE_API_REMOTE_URL;
      } else {
        apiHost = 'http://localhost:8000/';
      }
    } else {
      apiHost = 'https://api.sws2apps.com/';
    }

    setApiHost(apiHost);
    backupWorkerInstance.setApiHost(apiHost);

    console.info(`CPE: API: The client API is set to: ${apiHost}`);
  }, [setApiHost]);

  useEffect(() => {
    const checkBrowser = () => {
      if (!('Worker' in window)) {
        setIsSupported(false);
        console.error(`CPE: Browser Not Supported: Web Worker is not supported in this device`);
        return;
      }

      if (!('crypto' in window)) {
        setIsSupported(false);
        console.error(`CPE: Browser Not Supported: Web Crypto is not supported in this device`);
        return;
      }

      if (!crypto.randomUUID || typeof crypto.randomUUID !== 'function') {
        setIsSupported(false);
        console.error(`CPE: Browser Not Supported: Web Crypto RandomUUID is not supported in this device`);
        return;
      }

      if (!indexedDB) {
        setIsSupported(false);
        console.error(`CPE: Browser Not Supported: IndexedDb is not supported in this device`);
        return;
      }

      if (!('serviceWorker' in navigator)) {
        setIsSupported(false);
        console.error(`CPE: Browser Not Supported: Service Worker is not supported in this device`);
      }
    };

    checkBrowser();
    setIsLoading(false);
  }, []);

  useEffect(() => {}, [roleReload]);

  if (isLoading) {
    return <WaitingPage />;
  }

  return (
    <>
      {!isSupported && (
        <div className="browser-not-supported">
          You are using unsupported browser for the Congregation Program for Everyone app. Make sure that your browser
          is up to date, or try to use another browser.
        </div>
      )}
      {isSupported && (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={activeTheme}>
            <CssBaseline />
            <InternetChecker />
            {appSnackOpen && <NotificationWrapper />}
            <Suspense fallback={<WaitingPage />}>
              <RouterProvider router={router} />
            </Suspense>
          </ThemeProvider>
        </QueryClientProvider>
      )}
    </>
  );
};

export default App;
