## 1. Architecture design

```mermaid
graph TD
  A[User Browser] --> B[React Frontend Application]
  B --> C[Spring Boot Backend API]
  C --> D[Game Logic Service]
  C --> E[WebSocket Handler]
  D --> F[AI Engine]
  E --> G[Redis Session Store]

  subgraph "Frontend Layer"
      B
  end

  subgraph "Backend Layer"
      C
      D
      E
      F
  end

  subgraph "Data Layer"
      G
  end
```

## 2. Technology Description
- Frontend: React@18 + tailwindcss@3 + vite
- Initialization Tool: vite-init
- Backend: Spring Boot@3 + Java 21
- Database: Redis (for session management and game state)
- Build Tool: Maven
- Container: Docker

## 3. Route definitions
| Route | Purpose |
|-------|---------|
| / | Home page, displays game mode selection and statistics |
| /game/local | Local 2-player game interface |
| /game/ai | Player vs