# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Live Demo

- Frontend: https://your-frontend
- Backend: https://your-backend

## Demo Credentials

- **Admin:** `admin@example.com` / `admin123`
- **Moderator:** `mod@example.com` / `mod123`
- **User:** `user@example.com` / `user123`

_Need other accounts? Seed entries exist under `server/data/store.js`; add users directly via the backend API or SQL if needed._

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


### Local dev ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- CRA proxy: root package.json has "proxy": "http://localhost:5000"

### API calling rule
Frontend should call relative URLs like /api/auth/login (proxy handles localhost:5000 in dev).
### Run both apps
- Terminal 1: npm start
- Terminal 2: cd server && npm start

## Screenshots

- Login: `/docs/screenshots/login.png`
- Dashboard: `/docs/screenshots/dashboard.png`
- Users: `/docs/screenshots/users.png`
- Products: `/docs/screenshots/products.png`
- Orders: `/docs/screenshots/orders.png`

## Tech Stack

- **Frontend:** React (Create React App), i18n translations, theme system
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Deployment:** Vercel (frontend), Render/Railway (backend), managed Postgres

## Configuration

- **Development:** CRA proxy handles `/api/*` so the React dev server can call `localhost:5000`.
- **Production:** Set `REACT_APP_API_URL=https://your-backend` so `apiFetch` targets the live service instead of the proxy.
- **CORS:** Provide your deployed frontend domain(s) via `FRONTEND_ORIGINS` so the backend only permits requests from them.
- **Health check:** `GET /api/health` returns `{ ok: true, env: NODE_ENV }` for lightweight uptime verification.
- **Seeding:** Leave `SEED_ON_BOOT` unset/false in production; use `SEED_ON_BOOT=true` temporarily for staging resets.

## Backend Database

- The server now bootstraps a PostgreSQL schema located at `server/db/schema.sql` before listening, so set `DATABASE_URL` or the standard `PG*` environment variables in `server/.env` (e.g., `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`).
- Default fallback credentials point at `postgres:postgres@localhost:5432/admin_panel`, which you can override for production.
- When the server starts it also seeds sample users (Admin/Owner/Moderator), products, and 30 historical orders if the tables are empty, so you can start developing without manual inserts.
- To introspect or extend the schema, edit `server/db/schema.sql` and restart the server; the next boot will re-run `CREATE TABLE IF NOT EXISTS` and keep the existing data while adding new columns.
- The backend now respects a `FRONTEND_ORIGINS` comma-separated allowlist before switching on CORS, so point that at your deployed frontend URL(s) (localhost defaults remain active in development).
- Set `SEED_ON_BOOT=true` only when you need to reset the sample data; by default seeds run only when the corresponding tables are empty.
- Run the server in production with `npm start` (the development-only `npm run dev` uses nodemon and mimics your local workflow).

## Frontend Environment

- Production builds use `REACT_APP_API_URL` as the base for any `/api/*` calls, so configure that variable (e.g., `https://myapp-backend.onrender.com`) in Vercel/Netlify instead of relying on CRA proxying.
- In development the app still calls relative `/api/*` paths so the local React dev server can proxy to `localhost:5000`; no extra changes are needed when `REACT_APP_API_URL` is unset.

## Post-Deployment Smoke Test

Run the following checks against the LIVE URLs (Render/Railway + Vercel/Netlify) after deployment to guard critical production flows:

1. **Backend health**
   - Start the server with `NODE_ENV=production` and confirm the boot logs show `[server] NODE_ENV=production` plus a `[db] connected ...` line; no credentials should appear in the log.
   - Hit `GET /api/health` (or another light endpoint) and expect `200 OK` with a body such as `{ ok: true, env: NODE_ENV }`.

2. **CORS & networking**
   - From the deployed frontend domain(s) defined in `FRONTEND_ORIGINS`, call any `/api/...` endpoint and confirm the request succeeds.
   - Repeat the same call from a different origin (e.g., a playground on a different domain); it should be blocked by CORS.
   - Search the production bundle for `localhost` references to ensure no dev URLs survived the build.

3. **Authentication**
   - Log in with a seeded/registered user through the deployed UI.
   - Refresh the page; the token/session should persist and keep the user signed in.
   - Use the logout control and confirm the state clears and redirect happens if expected.
   - Submit invalid credentials and verify a user-friendly error (no 500).

4. **Core CRUD flows**
   - Users: list loads, updating status or role persists after refresh.
   - Products: create (if allowed), edit, and delete operations succeed and the data remains in the Postgres dashboard.
   - Orders: change a status from the UI and confirm the change reflects in both the Orders list and dashboard stats.

5. **Dashboard integrity**
   - Metrics/cards load without console errors.
   - Recent orders/users display readable data (no missing translations or placeholders).
   - Toasts or other live indicators behave without repeating loops.

6. **Performance sanity**
   - First meaningful paint should remain reasonable on realistic devices.
   - There are no uncontrolled re-fetch loops or repeated API calls in the production bundle.
   - Heavy UI effects (animations, gradients) do not introduce obvious jank.

7. **Env & config validation**
   - `FRONTEND_ORIGINS` equals your deployed frontend domain(s).
   - `DATABASE_URL` points at the production Postgres instance (and honors SSL).
   - `REACT_APP_API_URL` uses the live backend URL.
   - `SEED_ON_BOOT` is unset or `false` so seeds only run when tables are empty.

If any check fails, document the failure in this section along with the fix before flagging the deployment as production-ready.
