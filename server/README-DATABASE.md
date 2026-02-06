# GoodDay Database Setup (phpMyAdmin + MySQL)

## 1. Create the database in phpMyAdmin

1. Open **phpMyAdmin** in your browser (e.g. `http://localhost/phpmyadmin`).
2. Click **New** (or "Databases") and create a database:
   - **Name:** `goodday_db`
   - **Collation:** `utf8mb4_unicode_ci`
   - Click **Create**.

## 2. Run the SQL schema

1. Select the database `goodday_db` in the left sidebar.
2. Open the **SQL** tab.
3. Copy the contents of **`database.sql`** from this folder and paste into the SQL box.
4. Click **Go** to run the script.

This creates the tables: `users`, `workspaces`, `projects`, `tasks`, and inserts a default admin user.

## 3. Configure the server

Create a **`.env`** file in the `server` folder (or set environment variables) with your MySQL details:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=goodday_db
```

If you leave these unset, the server uses: `localhost`, `root`, no password, and `goodday_db`.

## 4. Install dependencies and start the server

```bash
cd server
npm install
npm start
```

Default admin login: **admin@gmail.com** / **admin123** (role: Admin).
