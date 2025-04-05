# Story Generator API

A simple API for generating short stories using OpenAI's GPT-3.5 model. The API accepts keywords and generates engaging stories suitable for young readers.

## Features

- Generate stories using predefined keywords
- Random keyword generation if none provided
- Story caching to avoid duplicate API calls
- Input validation and sanitization
- Customizable character name and age
- Health check endpoint
- Available keywords endpoint

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

### POST /generate-story

Generate a new story using provided keywords or random keywords.

**Request Body:**
```json
{
  "keywords": ["Minecraft", "magic"],  // Optional
  "name": "Alex",                      // Optional
  "age": 10                            // Optional
}
```

**Parameters:**
- `keywords`: Array of keywords to use in the story (optional)
  - If not provided, random keywords will be selected
  - Must be from the available keywords list
- `name`: Character's name (optional)
  - Must contain at least one alphabetic character
  - Non-alphabetic characters will be removed
  - Only the first word will be used
- `age`: Character's age (optional)
  - Must be a positive integer between 1 and 16

**Response:**
```json
{
  "story": "Once upon a time...",
  "keywords_used": ["Minecraft", "magic"],
  "cached": false
}
```

### GET /keywords

Get all available keywords organized by categories.

**Response:**
```json
{
  "categories": {
    "games": ["Minecraft", "Roblox", "Fortnite", "Among Us"],
    "characters": ["boy", "girl", "wizard", "warrior", "explorer"],
    "elements": ["magic", "adventure", "mystery", "friendship"],
    "settings": ["castle", "forest", "space", "underwater"]
  },
  "total_keywords": 17
}
```

### GET /health

Check the API health status.

**Response:**
```json
{
  "status": "ok",
  "cache_size": 5
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

## Error Responses

The API returns appropriate error messages for invalid inputs:

```json
{
  "error": "Invalid keywords provided",
  "invalidKeywords": ["InvalidKeyword1", "InvalidKeyword2"],
  "message": "Please use only keywords from the available list. Use GET /keywords to see all available options."
}
```

```json
{
  "error": "Invalid name",
  "message": "Name must contain at least one alphabetic character"
}
```

```json
{
  "error": "Invalid age",
  "message": "Age must be a positive integer between 1 and 16"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 