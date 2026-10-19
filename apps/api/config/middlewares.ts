import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        ...new Set(
          `${env('CORS_ORIGIN', 'http://localhost:4200')},http://localhost:4200,http://127.0.0.1:4200`
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        ),
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
