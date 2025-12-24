# Emission Lens 🌍

A professional dashboard for visualizing global CO₂ emissions across countries, industries, and regions. Features AI-powered chat and real-time web search.

![Dashboard](https://img.shields.io/badge/React-18-blue) ![API](https://img.shields.io/badge/Node.js-Express-green) ![Data](https://img.shields.io/badge/Data-Climate%20TRACE-orange)

## Features

- **Interactive Dashboard** - Visualize emissions by country, industry, and region
- **AI Chat Assistant** - Ask questions about emissions data (OpenAI GPT-4o-mini)
- **Web Search** - Search for latest climate news and articles (Serper API)
- **Real-time Data** - Fetched from Climate TRACE API
- **Year Filtering** - Filter data by year range

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| AI | OpenAI GPT-4o-mini (modular, swappable) |
| Data | Climate TRACE API |
| Search | Serper API |

## Project Structure

```
emission-lens/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/         # Dashboard views (Overview, Industries, etc.)
│   │   │   ├── charts/        # Chart components
│   │   │   ├── ChatPanel.jsx  # AI chat interface
│   │   │   └── Sidebar.jsx    # Navigation
│   │   └── App.jsx
│   └── package.json
│
├── server/                    # Express backend
│   ├── routes/
│   │   ├── emissions.js       # Emissions data endpoints
│   │   ├── chat.js            # AI chat endpoint
│   │   └── search.js          # Web search endpoint
│   ├── services/
│   │   ├── emissionsApi.js    # Climate TRACE integration
│   │   └── ai/                # Modular AI service
│   │       ├── index.js       # AI factory
│   │       └── providers/     # AI providers (OpenAI, etc.)
│   ├── prompts/
│   │   └── emissions-analyst.txt  # AI system prompt
│   └── package.json
│
└── README.md
```

## API Endpoints

### Emissions Data

| Endpoint | Description |
|----------|-------------|
| `GET /api/emissions/summary` | Global emissions summary |
| `GET /api/emissions/by-country` | Emissions by country |
| `GET /api/emissions/by-region` | Emissions by region |
| `GET /api/emissions/by-industry` | Emissions by industry |
| `GET /api/emissions/trends` | Historical trends |
| `GET /api/emissions/gases` | All greenhouse gases |

**Query Parameters:** `since`, `to` (year filtering)

### AI Chat

| Endpoint | Description |
|----------|-------------|
| `POST /api/chat` | Send message to AI |
| `GET /api/chat/status` | Check AI service status |

**Request Body:**
```json
{
  "message": "What are the top emitting countries?",
  "history": [{"role": "user", "content": "..."}, ...]
}
```

### Web Search

| Endpoint | Description |
|----------|-------------|
| `POST /api/search` | Search for climate articles |

**Request Body:**
```json
{
  "query": "carbon emissions 2024"
}
```

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd emission-lens

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp env.example .env
```

Edit `.env`:
```env
PORT=3001
OPENAI_API_KEY=sk-your-key-here
SERPER_API_KEY=your-serper-key-here
```

### 3. Run

```bash
# From root directory
npm run dev

# Or separately:
cd server && node index.js
cd client && npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for chat |
| `SERPER_API_KEY` | No | Serper API key for web search |
| `AI_PROVIDER` | No | AI provider (default: `openai`) |
| `AI_MODEL` | No | Model name (default: `gpt-4o-mini`) |

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   React     │────▶│   Express   │────▶│  Climate TRACE   │
│  Frontend   │◀────│   Backend   │◀────│      API         │
└─────────────┘     └─────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   OpenAI    │
                    │   / Serper  │
                    └─────────────┘
```

## Adding New AI Providers

The AI service is modular. To add a new provider:

1. Create `server/services/ai/providers/newprovider.js`
2. Extend `BaseAIProvider`
3. Register in `server/services/ai/index.js`
4. Set `AI_PROVIDER=newprovider` in `.env`

