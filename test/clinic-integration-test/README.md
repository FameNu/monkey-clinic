# Clinic API integration tests

Install the project-local Bruno CLI and run the integration collection from the
repository root:

```sh
make bruno-setup
make bruno-test
```

Start the API and database first (`make db-up`, then `make api-run` in another
terminal). `make bruno-test` recursively runs this collection and its resource
folders with the `local` environment.
You can also open this folder in Bruno and run the collection in folder order.
Requests are grouped by resource and numbered in execution order within each
folder. The auth collection logs in before protected resource collections run,
and later requests use IDs captured from create responses.

The local environment uses the development admin seeded by the API when the
database has no users. Override `loginEmail` and `loginPassword` in Bruno when
using another account. The allergy request intentionally submits an unknown
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
