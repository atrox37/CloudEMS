import { markRaw, defineAsyncComponent } from 'vue'
import type { RouteItem } from '@/types/menu'
import homeIcon from '@/assets/icons/sidebar-home.svg'
import stationsIcon from '@/assets/icons/sidebar-stations.svg'
import statisticsIcon from '@/assets/icons/sidebar-statistics.svg'
import settingIcon from '@/assets/icons/sidebar-setting.svg'

// 工具：安全的异步组件（避免被代理）

export const dynamicRoutes: RouteItem[] = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView/index.vue'),
    meta: {
      isSubMenu: false,
      activeNav: '/home',
      icon: homeIcon,
      title: 'Home',
      roles: ['Admin', 'Operator', 'Engineer'],
    },
  },
  {
    path: '/stations',
    name: 'stations',
    component: () => import('@/views/Stations/index.vue'),
    meta: {
      isSubMenu: false,
      activeNav: '/stations',
      icon: stationsIcon,
      title: 'Stations',
      roles: ['Admin', 'Operator', 'Engineer'],
    },
  },
  {
    path: '/stationsDetail',
    name: 'stationsDetail',
    component: () => import('@/views/StationsDetail/index.vue'),
    redirect: '/stationsDetail/overview',
    meta: {
      activeNav: '/stationsDetail',
      roles: ['Admin', 'Operator', 'Engineer'],
    },
    children: [
      {
        path: 'overview/:stationId',
        name: 'Overview',
        component: () => import('@/views/StationsDetail/Overview/index.vue'),
        meta: {
          title: 'Overview',
          activeNav: '/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        },
      },
      {
        path:'performance/:stationId',
        name:'Performance',
        component:()=>import('@/views/StationsDetail/Performance/index.vue'),
        meta:{
          title:'Performance',
          activeNav:'/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        },
      },
      {
        path:'analytics/:stationId',
        name:'Analytics',
        component:()=>import('@/views/StationsDetail/Analytics/index.vue'),
        meta:{
          title:'Analytics',
          activeNav:'/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        }
      },
      {
        path:'maintenance/:stationId',
        name:'Maintenance',
        component:()=>import('@/views/StationsDetail/Maintenance/index.vue'),
        meta:{
          title:'Maintenance',
          activeNav:'/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        },
      },
      {
        path:'Alarm/:stationId',
        name:'Alarm',
        component:()=>import('@/views/StationsDetail/Alarm/index.vue'),
        meta:{
          title:'Alarm',
          activeNav:'/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        },
      },
      {
        path:'forecast/:stationId',
        name:'Forecast',
        component:()=>import('@/views/StationsDetail/Forecast/index.vue'),
        meta:{
          title:'Forecast',
          activeNav:'/stations',
          roles: ['Admin', 'Operator', 'Engineer'],
        },
      },
    ],
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('@/views/Statistics/index.vue'),
    meta: {
      isSubMenu: false,
      activeNav: '/statistics',
      icon: statisticsIcon,
      title: 'Statistics', 
      roles: ['Admin', 'Operator', 'Engineer'],
    },
  },
  {
    path: '/setting',
    name: 'setting',
    meta: {
      isSubMenu: true,
      activeNav: '/setting',
      icon: settingIcon,
      title: 'Setting',
      roles: ['Admin'],
    },
    children: [
      {
        path: 'userManagement',
        name: 'userManagement',
        component: () => import('@/views/Setting/UserManagement/index.vue'),
        meta: {
          title: 'User Management',
          activeNav: '/setting/userManagement',
          roles: ['Admin'],
        },
      },
      {
        path: 'security',
        name: 'security',
        component: () => import('@/views/Setting/Security/index.vue'),
        meta: {
          title: 'Security',
          activeNav: '/setting/security',
          roles: ['Admin'],
        },
      },
      {
        path: 'notification',
        name: 'notification',
        component: () => import('@/views/Setting/Notification/index.vue'),
        meta: {
          title: 'Notification',
          activeNav: '/setting/notification',
          roles: ['Admin'],
        }
      },
      {
        path: 'systemAndGeneral',
        name: 'systemAndGeneral',
        component: () => import('@/views/Setting/SystemAndGeneral/index.vue'),
        meta: {
          title: 'System & General',
          activeNav: '/setting/systemAndGeneral',
          roles: ['Admin'],
        }
      },
      {
        path: 'apiManagement',
        name: 'apiManagement',
        component: () => import('@/views/Setting/ApiManagement/index.vue'),
        meta: {
          title: 'API Management',
          activeNav: '/setting/apiManagement',
          roles: ['Admin'],
        }
      },
      {
        path: 'helpAndDocumentation',
        name: 'helpAndDocumentation',
        component: () => import('@/views/Setting/HelpAndDocumentation/index.vue'),
        meta: {
          title: 'Help&Documentation',
          activeNav: '/setting/helpAndDocumentation',
          roles: ['Admin'],
        }
      }
    ],
  },
]
