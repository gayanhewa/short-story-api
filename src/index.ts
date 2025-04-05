import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import OpenAI from 'openai';

// Types
interface Theme {
    games: string[];
    characters: string[];
    elements: string[];
    settings: string[];
}

interface StoryRequest {
    keywords?: string[];
}

interface StoryResponse {
    story: string;
    keywords_used: string[];
    cached: boolean;
}

interface ValidationResult {
    isValid: boolean;
    invalidKeywords: string[];
}

interface ErrorResponse {
    error: string;
    message?: string;
    invalidKeywords?: string[];
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Theme categories for random keyword generation
const themes: Theme = {
    games: ['Minecraft', 'Roblox', 'Fortnite', 'Among Us'],
    characters: ['boy', 'girl', 'wizard', 'warrior', 'explorer'],
    elements: ['magic', 'adventure', 'mystery', 'friendship'],
    settings: ['castle', 'forest', 'space', 'underwater']
};

// Create a flattened list of all keywords for validation
const allKeywords: string[] = Object.values(themes).flat();

// In-memory cache for stories
const storyCache: Map<string, string> = new Map();

// Utility function to validate keywords
const validateKeywords = (keywords: string[]): ValidationResult => {
    const invalidKeywords = keywords.filter(keyword => 
        !allKeywords.some(validKeyword => 
            validKeyword.toLowerCase() === keyword.toLowerCase()
        )
    );
    
    return {
        isValid: invalidKeywords.length === 0,
        invalidKeywords
    };
};

// Utility function to generate random keywords
const generateRandomKeywords = (numKeywords: number = 3): string[] => {
    const categories = Object.keys(themes);
    const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
    const selected: string[] = [];

    for (let i = 0; i < numKeywords; i++) {
        const category = shuffledCategories[i] as keyof Theme;
        const options = themes[category];
        selected.push(options[Math.floor(Math.random() * options.length)]);
    }

    return selected;
};

// Utility function to generate cache key
const generateCacheKey = (keywords: string[]): string => {
    return keywords.map(k => k.toLowerCase()).sort().join('|');
};

// Get all available keywords endpoint
app.get('/keywords', (_req: Request, res: Response) => {
    res.json({
        categories: themes,
        total_keywords: Object.values(themes).reduce((acc, curr) => acc + curr.length, 0)
    });
});

// Story generation endpoint
app.post('/generate-story', async (req: Request<{}, {}, StoryRequest>, res: Response) => {
    try {
        const { keywords } = req.body;
        
        if (keywords) {
            const validation = validateKeywords(keywords);
            if (!validation.isValid) {
                const errorResponse: ErrorResponse = {
                    error: 'Invalid keywords provided',
                    invalidKeywords: validation.invalidKeywords,
                    message: 'Please use only keywords from the available list. Use GET /keywords to see all available options.'
                };
                return res.status(400).json(errorResponse);
            }
        }

        const selectedKeywords = keywords || generateRandomKeywords();
        const cacheKey = generateCacheKey(selectedKeywords);

        // Check cache first
        if (storyCache.has(cacheKey)) {
            const cachedStory = storyCache.get(cacheKey)!;
            return res.json({
                story: cachedStory,
                keywords_used: selectedKeywords,
                cached: true
            } as StoryResponse);
        }

        const prompt = `
            Write a short story using the following keywords: ${selectedKeywords.join(', ')}.
            The story should be between 150-200 words.
            Make it engaging and suitable for young readers.
            The story should have a clear beginning, middle, and end.
        `;

        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
        });

        const story = response.choices[0].text.trim();
        
        // Cache the story
        storyCache.set(cacheKey, story);

        res.json({
            story,
            keywords_used: selectedKeywords,
            cached: false
        } as StoryResponse);
    } catch (error) {
        console.error('Error generating story:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to generate story',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
        res.status(500).json(errorResponse);
    }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
        status: 'ok',
        cache_size: storyCache.size
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 