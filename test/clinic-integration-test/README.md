# Clinic API integration tests

Start the existing PostgreSQL service once, then run the isolated integration
tests from the repository root:

```sh
make db-up
make bruno-setup
make bruno-test
```

`make bruno-test` uses the existing Postgres container to recreate the
temporary `clinic_test` database, starts Fiber with `APP_ENV=development` on
port `8081`, runs Bruno with the `test` environment, then shuts Fiber down and
drops `clinic_test` even if a test fails. `make bruno-setup` installs the
project-local Bruno CLI. Requests are grouped by resource and numbered in
execution order within each folder. The auth folder runs before protected
resources, and later requests use IDs captured from create responses.

The development seed creates the admin account in the temporary database. The
allergy request intentionally submits an unknown
medication ID and verifies the endpoint's validation response because the API
does not currently expose a medication lookup route from which the suite could
obtain a valid ID.

Covered routes:

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/users`
- `POST /api/v1/doctors`
- `GET /api/v1/doctors`
- `POST /api/v1/doctors/:id/schedule`
- `POST /api/v1/patients`
- `GET /api/v1/patients`
- `GET /api/v1/patients/:id`
- `POST /api/v1/patients/:id/allergies`
- `POST /api/v1/appointments`
- `GET /api/v1/appointments`
- `PATCH /api/v1/appointments/:id/status`

Collection folders:

- `health`
- `auth`
- `users`
- `doctors`
- `patients`
- `appointments`
