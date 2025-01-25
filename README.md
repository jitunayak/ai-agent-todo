# ai-agent-todo

To install dependencies:

```bash
bun install
```

Docker compose to up Postgresql db

```bash
docker compose -f 'docker-compose.yaml' up -d --build
```

```bash
bun run db:generate
bun rn db:apply
```

To run:

```bash
bun run dev
```

Obtain gemini api key from https://aistudio.google.com/app/apikey

```
Update .env file with GEMINI_API_KEY
```

Reference for Gemini function calling
[https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling)
