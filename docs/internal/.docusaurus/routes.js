import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'd00'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'c4c'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '34b'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', 'ee3'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/deployment/EXECUTION_GUIDE',
                component: ComponentCreator('/docs/deployment/EXECUTION_GUIDE', '31f'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/deployment/SECURITY_REPORT',
                component: ComponentCreator('/docs/deployment/SECURITY_REPORT', 'f79'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/deployment/SECURITY_REPORT_20250926_053823',
                component: ComponentCreator(
                  '/docs/deployment/SECURITY_REPORT_20250926_053823',
                  '7a2',
                ),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/development/REORGANIZATION_PLAN',
                component: ComponentCreator('/docs/development/REORGANIZATION_PLAN', '129'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/development/STRIPE-PRODUCTS-GUIDE',
                component: ComponentCreator('/docs/development/STRIPE-PRODUCTS-GUIDE', '700'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/COPYRIGHT_NOTICE',
                component: ComponentCreator('/docs/legal/COPYRIGHT_NOTICE', '6d6'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/IMMEDIATE_ACTION_PLAN',
                component: ComponentCreator('/docs/legal/IMMEDIATE_ACTION_PLAN', '46e'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/LEGAL_ACTION_PLAN',
                component: ComponentCreator('/docs/legal/LEGAL_ACTION_PLAN', '50a'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/LICENSING_AGREEMENTS',
                component: ComponentCreator('/docs/legal/LICENSING_AGREEMENTS', 'edc'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/MONITORING_SYSTEM',
                component: ComponentCreator('/docs/legal/MONITORING_SYSTEM', '790'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/SECURITY_GUIDE',
                component: ComponentCreator('/docs/legal/SECURITY_GUIDE', '04b'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/SECURITY_SUMMARY',
                component: ComponentCreator('/docs/legal/SECURITY_SUMMARY', 'ca7'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/TERMINAL_PRO_SECURITY_TEMPLATE',
                component: ComponentCreator('/docs/legal/TERMINAL_PRO_SECURITY_TEMPLATE', '372'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
              {
                path: '/docs/legal/TRADEMARK_REGISTRATION_GUIDE',
                component: ComponentCreator('/docs/legal/TRADEMARK_REGISTRATION_GUIDE', '460'),
                exact: true,
                sidebar: 'tutorialSidebar',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
