# Story Generation API

A Node.js API built with Bun that generates short stories using OpenAI's GPT-3.5-turbo-instruct model. Stories are generated based on keywords and cached in memory for faster retrieval.

## Features

- Story generation using keywords
- Keyword categories (games, characters, elements, settings)
- In-memory caching for generated stories
- Input validation
- Cost-effective using GPT-3.5-turbo-instruct

## Prerequisites

- [Bun](https://bun.sh/) installed
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd story-generator-api
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

Development mode:
```bash
bun run dev
```

Production mode:
```bash
bun run start
```

## API Endpoints

### Generate Story
```bash
POST /generate-story
```
Request body:
```json
{
    "keywords": ["Minecraft", "girl", "magic"]  // Optional
}
```
Response:
```json
{
    "story": "Generated story content...",
    "keywords_used": ["Minecraft", "girl", "magic"],
    "cached": false
}
```

### Get Available Keywords
```bash
GET /keywords
```
Response:
```json
{
    "categories": {
        "games": ["Minecraft", "Roblox", "Fortnite", "Among Us"],
        "characters": ["boy", "girl", "wizard", "warrior", "explorer"],
        "elements": ["magic", "adventure", "mystery", "friendship"],
        "settings": ["castle", "forest", "space", "underwater"]
    },
    "total_keywords": 16
}
```

### Health Check
```bash
GET /health
```
Response:
```json
{
    "status": "ok",
    "cache_size": 10
}
```

## Deployment

This application can be deployed to various platforms:

### Fly.io (Recommended)
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Deploy
fly launch
fly deploy
```

### Railway.app
1. Connect your GitHub repository
2. Create new project from GitHub
3. Add environment variables
4. Deploy automatically

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3000)

## Cost Considerations

Using GPT-3.5-turbo-instruct model:
- Cost per 1K tokens: $0.0015
- Average story cost: ~$0.00045 (300 tokens)
- Caching helps reduce costs for repeated requests

## Error Handling

The API includes validation for:
- Invalid keywords
- Missing OpenAI API key
- Server errors
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 