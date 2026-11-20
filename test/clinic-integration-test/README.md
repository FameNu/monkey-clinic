# Clinic authentication integration test

Open this folder as a Bruno collection and select the `local` environment. Run
the requests in collection order: **Login**, then **Get Current User**. The
login response stores its token as a Bruno runtime variable for the second
request.

The local environment uses the development admin seeded by the API when the
database has no users. Override `loginEmail` and `loginPassword` in Bruno when
using another account.
