import dotenv from "dotenv";
dotenv.config({ path: "/Users/finn/vivalence/code/spanish/app/postgres/.env" });

const { SVELTE_CLIENT_COOKIE, PUBLIC_CLIENT_URL } = process.env;

const cookie =
  "sb-localhost-auth-token=%7B%22access_token%22%3A%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzE3MDcwMDA0LCJpYXQiOjE3MTcwNjY0MDQsInN1YiI6IjFmN2JjNDAzLTZkMmQtNGE3Yi1iNTJmLTNiZmVlZjBkNTkwYiIsImVtYWlsIjoiZmlubkB2aXZhbGVuY2UuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJyb2xlcyI6WyJVU0VSIl19LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzE3MDY2NDA0fV0sInNlc3Npb25faWQiOiJmMjhiNTljZC04OWRkLTRiYzctODk2My1mOWM1NWI1NzAyNjYifQ.D_NzaX1qFI7i3xCLwrpdzwR7JYB8Cz2MWf71ECszUrs%22%2C%22token_type%22%3A%22bearer%22%2C%22expires_in%22%3A3600%2C%22expires_at%22%3A1717070004%2C%22refresh_token%22%3A%227kZZtN27kp89m7s-GwUzqg%22%2C%22user%22%3A%7B%22id%22%3A%221f7bc403-6d2d-4a7b-b52f-3bfeef0d590b%22%2C%22aud%22%3A%22authenticated%22%2C%22role%22%3A%22authenticated%22%2C%22email%22%3A%22finn%40vivalence.com%22%2C%22email_confirmed_at%22%3A%222024-03-01T16%3A43%3A56.021465Z%22%2C%22phone%22%3A%22%22%2C%22confirmed_at%22%3A%222024-03-01T16%3A43%3A56.021465Z%22%2C%22last_sign_in_at%22%3A%222024-05-30T10%3A53%3A24.23318451Z%22%2C%22app_metadata%22%3A%7B%22provider%22%3A%22email%22%2C%22providers%22%3A%5B%22email%22%5D%7D%2C%22user_metadata%22%3A%7B%22roles%22%3A%5B%22USER%22%5D%7D%2C%22identities%22%3A%5B%7B%22identity_id%22%3A%22f5f61520-caf4-4c04-b3af-f9a3c4f1f67b%22%2C%22id%22%3A%221f7bc403-6d2d-4a7b-b52f-3bfeef0d590b%22%2C%22user_id%22%3A%221f7bc403-6d2d-4a7b-b52f-3bfeef0d590b%22%2C%22identity_data%22%3A%7B%22email%22%3A%22finn%40vivalence.com%22%2C%22email_verified%22%3Afalse%2C%22phone_verified%22%3Afalse%2C%22sub%22%3A%221f7bc403-6d2d-4a7b-b52f-3bfeef0d590b%22%7D%2C%22provider%22%3A%22email%22%2C%22last_sign_in_at%22%3A%222024-03-01T16%3A43%3A56.016857Z%22%2C%22created_at%22%3A%222024-03-01T16%3A43%3A56.016953Z%22%2C%22updated_at%22%3A%222024-03-01T16%3A43%3A56.016953Z%22%2C%22email%22%3A%22finn%40vivalence.com%22%7D%5D%2C%22created_at%22%3A%222024-03-01T16%3A43%3A56.006731Z%22%2C%22updated_at%22%3A%222024-05-30T10%3A53%3A24.247002Z%22%7D%7D";

export async function post(url, body) {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(PUBLIC_CLIENT_URL + url, options);
  return response.json();
}
