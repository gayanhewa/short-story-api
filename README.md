# Story Generator API

A Bun-based API that uses the Phi-2 model from Hugging Face to generate short stories.

## Prerequisites

- Install [Bun](https://bun.sh/) on your system:
```bash
curl -fsSL https://bun.sh/install | bash
```

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create a `.env` file in the root directory and add your Hugging Face API key:
```
HUGGING_FACE_API_KEY=your_api_key_here
```

3. Start the server:
```bash
bun start
```

For development with auto-reload:
```bash
bun dev
```

## API Endpoints

### Generate Story
- **POST** `/generate-story`
- **Body**:
```json
{
    "prompt": "a magical forest",
    "max_length": 200
}
```
- **Response**:
```json
{
    "story": "Generated story text..."
}
```

### Health Check
- **GET** `/health`
- **Response**:
```json
{
    "status": "ok"
}
```

## Notes
- The API runs on port 3000 by default
- You can change the port by setting the PORT environment variable
- Make sure to keep your Hugging Face API key secure
- This project uses Bun as the JavaScript runtime for better performance 