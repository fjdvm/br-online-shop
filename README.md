# BR Ecommerce

Monorepo for Bren Raphael's ecommerce applications.

## Applications

```
br-ecommerce/
├── apps/
│   ├── web-shop/    Next.js customer storefront (port 3012, HTTPS)
│   └── web-oos/     Next.js operations app (port 3004, HTTPS)
└── services/
    └── api-oos/     .NET API (http 5004 / https 7004)
```

## Run locally

Install the root dependency and the dependencies for each web app:

```bash
npm install
cd apps/web-shop && npm install && cd -
cd apps/web-oos && npm install && cd -
```

Copy each app's `.env.example` to its local environment file and fill in the
required values. Never commit secrets.

```bash
cp services/api-oos/.env.example services/api-oos/.env
cp apps/web-shop/.env.example apps/web-shop/.env.local
cp apps/web-oos/.env.example apps/web-oos/.env.local
```

Start the auth service first, then start all ecommerce apps:

```bash
npm run dev
```

`api-oos` connects to the CRM API through the `ApiCrms__BaseUrl` setting, so
the CRM stack must also be running for integrations such as support tickets.
