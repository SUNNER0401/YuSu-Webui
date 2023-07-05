import i18n from '@/i18n';

export let setRoutes = () => {
  return [
    {
      path: '/login',
      component: () => import('@/layouts/LoginLayout'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/Login'),
          meta: {
            title: i18n.t('appPageTitle.login'),
          },
        },
        {
          path: '/change-password',
          name: 'change-password',
          component: () => import('@/views/ChangePassword'),
          meta: {
            title: i18n.t('appPageTitle.changePassword'),
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/console',
      component: () => import('@/layouts/ConsoleLayout'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'serial-over-lan-console',
          name: 'serial-over-lan-console',
          component: () =>
            import('@/views/Operations/SerialOverLan/SerialOverLanConsole'),
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
          },
        },
        {
          path: 'kvm',
          name: 'kvm-console',
          component: () => import('@/views/Operations/Kvm/KvmConsole.vue'),
          meta: {
            title: i18n.t('appPageTitle.kvm'),
          },
        },
      ],
    },
    {
      path: '/',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/layouts/AppLayout'),
      children: [
        {
          path: '',
          name: 'overview',
          component: () => import('@/views/Overview'),
          meta: {
            title: i18n.t('appPageTitle.overview'),
          },
        },
        {
          path: '/profile-settings',
          name: 'profile-settings',
          component: () => import('@/views/ProfileSettings'),
          meta: {
            title: i18n.t('appPageTitle.profileSettings'),
          },
        },
        {
          path: '/logs/event-logs',
          name: 'event-logs',
          component: () => import('@/views/Logs/EventLogs'),
          meta: {
            title: i18n.t('appPageTitle.eventLogs'),
          },
        },
        {
          path: '/logs/post-code-logs',
          name: 'post-code-logs',
          component: () => import('@/views/Logs/PostCodeLogs'),
          meta: {
            title: i18n.t('appPageTitle.postCodeLogs'),
          },
        },
        {
          path: '/logs/operating-logs',
          name: 'operating-logs',
          component: () => import('@/views/Logs/OperatingLogs'),
          meta: {
            title: i18n.t('appPageTitle.operatingLogs'),
          },
        },
        {
          path: '/logs/ras-logs',
          name: 'ras-logs',
          component: () => import('@/views/Logs/RasLogs'),
          meta: {
            title: i18n.t('appPageTitle.rasLogs'),
          },
        },
        {
          path: '/hardware-status/inventory',
          name: 'inventory',
          component: () => import('@/views/HardwareStatus/Inventory'),
          meta: {
            title: i18n.t('appPageTitle.inventory'),
          },
        },
        {
          path: '/hardware-status/sensors',
          name: 'sensors',
          component: () => import('@/views/HardwareStatus/Sensors'),
          meta: {
            title: i18n.t('appPageTitle.sensors'),
          },
        },
        {
          path: '/operations/factory-reset',
          name: 'factory-reset',
          component: () => import('@/views/Operations/FactoryReset'),
          meta: {
            title: i18n.t('appPageTitle.factoryReset'),
          },
        },
        {
          path: '/operations/fan-speed',
          name: 'fan-speed',
          component: () => import('@/views/Operations/FanSpeed'),
          meta: {
            title: i18n.t('appPageTitle.fanSpeed'),
          },
        },
        {
          path: '/operations/kvm',
          name: 'kvm',
          component: () => import('@/views/Operations/Kvm'),
          meta: {
            title: i18n.t('appPageTitle.kvm'),
          },
        },
        {
          path: '/operations/firmware',
          name: 'firmware',
          component: () => import('@/views/Operations/Firmware'),
          meta: {
            title: i18n.t('appPageTitle.firmware'),
          },
        },
        {
          path: '/operations/reboot-bmc',
          name: 'reboot-bmc',
          component: () => import('@/views/Operations/RebootBmc'),
          meta: {
            title: i18n.t('appPageTitle.rebootBmc'),
          },
        },
        {
          path: '/operations/serial-over-lan',
          name: 'serial-over-lan',
          component: () => import('@/views/Operations/SerialOverLan'),
          meta: {
            title: i18n.t('appPageTitle.serialOverLan'),
          },
        },
        {
          path: '/operations/server-power-operations',
          name: 'server-power-operations',
          component: () => import('@/views/Operations/ServerPowerOperations'),
          meta: {
            title: i18n.t('appPageTitle.serverPowerOperations'),
          },
        },
        {
          path: '/operations/virtual-media',
          name: 'virtual-media',
          component: () => import('@/views/Operations/VirtualMedia'),
          meta: {
            title: i18n.t('appPageTitle.virtualMedia'),
          },
        },
        {
          path: '/settings/date-time',
          name: 'date-time',
          component: () => import('@/views/Settings/DateTime'),
          meta: {
            title: i18n.t('appPageTitle.dateTime'),
          },
        },
        {
          path: '/settings/network',
          name: 'network',
          component: () => import('@/views/Settings/Network'),
          meta: {
            title: i18n.t('appPageTitle.network'),
          },
        },
        {
          path: '/settings/power-restore-policy',
          name: 'power-restore-policy',
          component: () => import('@/views/Settings/PowerRestorePolicy'),
          meta: {
            title: i18n.t('appPageTitle.powerRestorePolicy'),
          },
        },
        {
          path: '/settings/alarm-setting',
          name: 'alarm-setting',
          component: () => import('@/views/Settings/AlarmSetting'),
          meta: {
            title: i18n.t('appPageTitle.alarmSetting'),
          },
        },
        {
          path: '/security-and-access/sessions',
          name: 'sessions',
          component: () => import('@/views/SecurityAndAccess/Sessions'),
          meta: {
            title: i18n.t('appPageTitle.sessions'),
          },
        },
        {
          path: '/security-and-access/ldap',
          name: 'ldap',
          component: () => import('@/views/SecurityAndAccess/Ldap'),
          meta: {
            title: i18n.t('appPageTitle.ldap'),
          },
        },
        {
          path: '/security-and-access/user-management',
          name: 'local-users',
          component: () => import('@/views/SecurityAndAccess/UserManagement'),
          meta: {
            title: i18n.t('appPageTitle.userManagement'),
          },
        },
        {
          path: '/security-and-access/policies',
          name: 'policies',
          component: () => import('@/views/SecurityAndAccess/Policies'),
          meta: {
            title: i18n.t('appPageTitle.policies'),
          },
        },
        {
          path: '/security-and-access/certificates',
          name: 'certificates',
          component: () => import('@/views/SecurityAndAccess/Certificates'),
          meta: {
            title: i18n.t('appPageTitle.certificates'),
          },
        },
        {
          path: '/resource-management/power',
          name: 'power',
          component: () => import('@/views/ResourceManagement/Power'),
          meta: {
            title: i18n.t('appPageTitle.power'),
          },
        },
        {
          path: '/resource-management/configureManagement',
          name: 'configureManagement',
          component: () =>
            import('@/views/ResourceManagement/ConfigureManagement'),
          meta: {
            title: i18n.t('appPageTitle.configureManagement'),
          },
        },
        {
          path: '*',
          name: 'page-not-found',
          component: () => import('@/views/PageNotFound'),
          meta: {
            title: i18n.t('appPageTitle.pageNotFound'),
          },
        },
      ],
    },
  ];
};

const routes = setRoutes();

export default routes;
