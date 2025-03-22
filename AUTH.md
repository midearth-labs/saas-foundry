# Work in Progress: [BetterAuth](https://better-auth.com) Integration.

- The BetterAuth setup used here in line and comformant with [this](https://github.com/patelharsh9797/t3_stack_better_auth).
- Unlike the above however, we don't enable email verification and social auth... _yet_.
- The server currently processes the signup request for 2-3 minutes before returning a vague error message.
- Issues could be due to the controller-service-repository architecture pattern not being implemented correctly.

## Signup

```sh
curl -X POST 'http://localhost:3005/api/trpc/auth.signUp' \
-H 'Content-Type: application/json' \
-d '{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}'

```

## signin (not tested yet as Signup still fails)
```sh
curl -X POST 'http://localhost:3005/api/trpc/auth.signIn' \
-H 'Content-Type: application/json' \
-d '{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}'
```