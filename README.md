# LibAssist — Library Management System (Spring Boot + React)

A re-implementation of the original [Liberary_Management_System](../../Liberary_Management_System) MERN project,
rebuilt with a **Java Spring Boot** backend and a **React** frontend, backed by **PostgreSQL**.

Same feature set as the original: patrons browse and borrow books, librarians manage the catalogue and issue/return
books, and admins additionally manage librarian/admin accounts and view revenue reports.

## Tech stack

| Layer    | Original (MERN)        | This app                                  |
|----------|-------------------------|--------------------------------------------|
| Backend  | Node.js + Express        | Java 17 + Spring Boot 3 (Web, Security, Data JPA) |
| Database | MongoDB (Mongoose)       | PostgreSQL (Hibernate/JPA)                |
| Auth     | JWT (jsonwebtoken)       | JWT (jjwt), Spring Security               |
| Frontend | React + antd + Redux Toolkit | React + antd + Redux Toolkit (same)   |

## Project structure

```
Library-Management-System/
├── backend/     Spring Boot REST API (Maven project)
└── frontend/    React app (Create React App)
```

## 1. Prerequisites

- **Java 17+** and **Maven 3.9+** — `java -version`, `mvn -v`. If Maven isn't installed, either install it
  (`winget install Apache.Maven`) or open the `backend` folder in an IDE such as IntelliJ IDEA or VS Code
  (with the Java extension pack), which bundle their own Maven and can run the app without the CLI.
- **Node.js 18+** and npm — `node -v`.
- **PostgreSQL 14+** running locally, with a database created for this app:

```bash
# using the psql CLI
psql -U postgres -c "CREATE DATABASE libassist;"
```

## 2. Backend setup

Database credentials are read from environment variables (`DB_USERNAME`, `DB_PASSWORD`, and optionally `DB_URL` /
`JWT_SECRET`) instead of being hardcoded in `application.properties` — see that file for the exact names and their
defaults. Set them before running, e.g. in PowerShell for the current session:

```powershell
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your-postgres-password"
```

(To make them persist across terminal sessions, use `[Environment]::SetEnvironmentVariable("DB_PASSWORD", "...", "User")`
instead, then open a new terminal — or set them as environment variables in your IDE's run configuration.)

`DB_USERNAME` defaults to `postgres` if unset; `DB_PASSWORD` has no default and is required — the app won't start
without it.

Run it:

```bash
cd backend
mvn spring-boot:run
```

Tables are created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`). The API listens on
`http://localhost:5000`.

**Interactive API docs:** once it's running, open [http://localhost:5000/swagger-ui/index.html](http://localhost:5000/swagger-ui/index.html)
in a browser — every endpoint, its request/response shape, and a "Try it out" button. Log in via `/api/users/login`
to get a token, then click **Authorize** at the top and paste it in as `<token>` (no need to type `Bearer `) to call
protected endpoints directly from the page.

### Creating the first librarian/admin

Public self-registration (`/api/users/register`) always creates a `patron` account — same as the original app,
there is no self-service way to become staff. To promote a user to `librarian` or `admin`, register normally through
the app first, then run in `psql`:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

That admin can then see the Patrons/Librarians/Admins/Reports tabs on the Profile page (there's currently no UI to
change roles — it's a direct DB edit, matching how the original project also had no role-promotion endpoint).

## 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Opens on `http://localhost:3000` and proxies `/api/*` calls to the backend on port 5000 (see `"proxy"` in
`frontend/package.json`).

## API overview

All responses share the shape `{ success, message, data }`.

| Method | Path                                   | Auth | Description |
|--------|-----------------------------------------|------|--------------|
| POST   | `/api/users/register`                   | No   | Register a new patron |
| POST   | `/api/users/login`                      | No   | Login, returns a JWT |
| GET    | `/api/users/get-logged-in-user`         | Yes  | Current user's profile |
| GET    | `/api/users/get-all-users/{role}`       | Yes  | List users by role |
| GET    | `/api/users/get-user-by-id/{id}`        | Yes  | Fetch one user |
| POST   | `/api/books/add-book`                   | Yes  | Add a book |
| PUT    | `/api/books/update-book/{id}`           | Yes  | Update a book |
| DELETE | `/api/books/delete-book/{id}`           | Yes  | Delete a book |
| GET    | `/api/books/get-all-books`              | Yes  | List all books |
| GET    | `/api/books/get-book-by-id/{id}`        | Yes  | Fetch one book |
| POST   | `/api/issues/issue-new-book`            | Yes  | Issue a book to a patron |
| POST   | `/api/issues/get-issues`                | Yes  | List issues, filter by `{bookId}` and/or `{userId}` |
| POST   | `/api/issues/return-book`               | Yes  | Return a book (`{issueId}`) |
| POST   | `/api/issues/delete-issue`              | Yes  | Delete an issue record (`{issueId}`) |
| POST   | `/api/issues/edit-issue`                | Yes  | Renew/extend a due date (`{issueId, returnDate}`) |
| GET    | `/api/reports/get-reports`              | Yes  | Dashboard totals (books/users/issues/revenue) |

`Yes` means the request needs `Authorization: Bearer <token>`.

## Notable differences from the original Node version (deliberate improvements)

- IDs are numeric auto-increment (`id`) instead of Mongo ObjectIds (`_id`) — the natural fit for a relational DB.
- User responses never include the password hash (the original leaked the bcrypt hash in every user JSON).
- Rent and overdue fines are (re)computed server-side from `book.rentPerDay` and the due date, instead of trusting
  client-supplied numbers.
- `book.createdBy` is taken from the authenticated user's token, not from the request body.
- Deleting an issue that was already returned no longer double-increments `availableCopies` (a bug in the original).
- Validation errors return a clear message (`@Valid` + a global exception handler) instead of raw Mongoose errors.

## Notes

- No endpoint enforces role-based authorization server-side (any authenticated user can hit `/api/books/add-book`,
  for example) — the same permissive design as the original, which only hides UI by role on the frontend. If you
  intend to expose this beyond trusted users, add `@PreAuthorize`/role checks in the controllers.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for development; for production use a real migration tool
  (Flyway/Liquibase) instead.
