# Rock Paper Scissors Lizard Spock

A full stack web application implementing the Rock Paper Scissors Lizard Spock variant, built with an ASP.NET Core REST API backend and a React TypeScript frontend. The project focuses on clean API design, separation of concerns, and a lightweight but production-minded architecture.

---

## Features

- Play Rock Paper Scissors Lizard Spock against a computer opponent
- Enter a username to identify your results
- Global scoreboard displaying the 10 most recent game results
- Reset the global scoreboard at any time
- Swagger UI for interactive API exploration
- Docker Compose setup for one-command local deployment
- Automated backend (unit + integration) and frontend tests

---

## Tech Stack

**Backend**
- .NET 8 / ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Polly (resilience and retry for external random number API)
- xUnit (unit and integration tests)

**Frontend**
- React 18
- TypeScript
- Vite
- Vitest + React Testing Library

**Infrastructure**
- Docker
- Docker Compose

---

## Architecture

The solution is separated into:
- ASP.NET Core REST API backend
- React TypeScript frontend
- SQL Server database
- Dockerized local environment

The backend follows a layered structure with controllers, services, and persistence separated for maintainability and testability.

---

## Running Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server Express (or any SQL Server instance) running at `localhost\SQLEXPRESS`
- Node.js 18+

### Backend

```bash
cd BillupsCodingChallenge
dotnet run
```

The API will be available at `http://localhost:5249`.  
Swagger UI: `http://localhost:5249/swagger`

> On first run, Entity Framework will apply migrations and create the database automatically.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Running with Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose.

From the repository root:

```bash
docker compose up --build
```

To stop Docker:

```bash
docker compose down
```

| Service  | URL                                |
|----------|------------------------------------|
| Frontend | http://localhost:3000              |
| Backend  | http://localhost:8080              |
| Swagger  | http://localhost:8080/swagger      |

---

## API Endpoints

| Method   | Endpoint      | Description                                              |
|----------|---------------|----------------------------------------------------------|
| `GET`    | `/choices`    | Returns all valid choices (Rock, Paper, Scissors, Lizard, Spock) |
| `GET`    | `/choice`     | Returns a single randomly selected computer choice       |
| `POST`   | `/play`       | Plays a round against the computer and records the result |
| `GET`    | `/scoreboard` | Returns the 10 most recent game results                  |
| `DELETE` | `/scoreboard` | Clears all scoreboard entries                            |

### GET /choices — Response

```json
[
  { "id": 1, "name": "Rock" },
  { "id": 2, "name": "Paper" },
  { "id": 3, "name": "Scissors" },
  { "id": 4, "name": "Lizard" },
  { "id": 5, "name": "Spock" }
]
```

### GET /choice — Response

```json
{ "id": 3, "name": "Scissors" }
```

### POST /play — Request Body

```json
{
  "username": "Alice",
  "player": 1
}
```

`player` is an integer 1–5 corresponding to: `1` Rock, `2` Paper, `3` Scissors, `4` Lizard, `5` Spock.

### POST /play — Response

```json
{
  "username": "Alice",
  "results": "Win",
  "player": 1,
  "computer": 3
}
```

### GET /scoreboard — Response

```json
[
  {
    "id": 42,
    "username": "Alice",
    "playerChoiceId": 1,
    "computerChoiceId": 3,
    "result": "Win",
    "playedAtUtc": "2026-05-06T14:23:00Z"
  }
]
```

### DELETE /scoreboard — Response

`204 No Content`

---

## Design Decisions

**Global scoreboard**  
The scoreboard is shared across all users and shows the 10 most recent results globally. This keeps the implementation simple while still providing meaningful feedback. A per-user view would require authentication and session management, which is out of scope for this challenge.

**No authentication**  
The username field is a lightweight identifier — not an authenticated account. It allows results to be labelled without introducing JWT issuance, token refresh, or session infrastructure that would not be meaningful within this challenge's scope.

**No caching**  
All scoreboard reads hit the database directly to ensure results are always fresh. Given the small dataset (max 10 rows returned) and the challenge's scale, caching adds complexity without meaningful benefit here.

**No custom UI components**
The UI uses native HTML elements directly rather than wrapping them in custom components (e.g. a `Button` wrapper). The app has no repeated styling variants or shared interactive behaviour that would justify the abstraction overhead.

**Performance considerations**  
The application intentionally avoids additional optimisation techniques such as React memoization, list virtualization, pagination, and caching because the dataset is intentionally small (only the 10 most recent results are displayed) and rendering costs are negligible for this scale.

In a larger-scale application, these optimisations would be evaluated based on profiling and real usage patterns.

**External random number API**  
Computer choices are sourced from an external random number API (`codechallenge.boohma.com`). Polly is configured with a retry policy (3 attempts, exponential backoff) to handle transient failures gracefully. If the API is unavailable, the service returns an appropriate error response rather than silently failing.

---

## Future Improvements

- **JWT authentication** — issue tokens on login to verify identity server-side
- **Per-user authorisation** — associate results with authenticated accounts and enforce access control
- **Scoped scoreboard** — allow users to view their personal history in addition to the global feed
- **Caching** — introduce response caching for the `/choices` endpoint and short-lived caching for the scoreboard at higher traffic volumes
- **Scalability** — pagination, circuit breakers, and horizontal scaling strategies
- **Real-time scoreboard updates** — use SignalR or lightweight polling to synchronise scoreboard changes across multiple connected clients

---

## Testing

### Backend

```bash
# Unit tests
cd BillupsCodingChallenge.UnitTests
dotnet test

# Integration tests
cd BillupsCodingChallenge.IntegrationTests
dotnet test
```

### Frontend

```bash
cd frontend
npm test
```
