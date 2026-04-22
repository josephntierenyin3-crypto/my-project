# Executive Daily Planner

React + Vite app with login, schedule, meetings, tasks, budget and MySQL backend.

## Setup

### 1. Database (phpMyAdmin)

- Copy `.env.example` to `.env` and set your MySQL credentials (same as in phpMyAdmin).
- In **phpMyAdmin**, open the **SQL** tab and run the script in `database/schema.sql`. This creates the database `plannerdb` and the `users` table so you can see them in phpMyAdmin.

### 2. Environment

- Edit `.env`: set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME=plannerdb` to match your MySQL/phpMyAdmin setup.
- Set `JWT_SECRET` to a long random string in production.

### 3. Run

```bash
npm install
npm run server    # Backend on http://localhost:3001
npm run dev       # Frontend on http://localhost:5173 (in another terminal)
```

Then open http://localhost:5173: create an account, log in, use the planner, and log out from the sidebar.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
