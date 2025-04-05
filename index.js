import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Theme categories for random keyword generation
const themes = {
    games: ['Minecraft', 'Roblox', 'Fortnite', 'Among Us'],
    characters: ['boy', 'girl', 'wizard', 'warrior', 'explorer'],
    elements: ['magic', 'adventure', 'mystery', 'friendship'],
    settings: ['castle', 'forest', 'space', 'underwater']
};

// Create a flattened list of all keywords for validation
const allKeywords = Object.values(themes).flat();

// In-memory cache for stories
const storyCache = new Map();

// Get all available keywords endpoint
app.get('/keywords', (req, res) => {
    res.json({
        categories: themes,
        total_keywords: Object.values(themes).reduce((acc, curr) => acc + curr.length, 0)
    });
});

// Utility function to validate keywords
const validateKeywords = (keywords) => {
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
const generateRandomKeywords = (numKeywords = 3) => {
    const categories = Object.keys(themes);
    const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
    const selected = [];

    for (let i = 0; i < numKeywords; i++) {
        const category = shuffledCategories[i];
        const options = themes[category];
        selected.push(options[Math.floor(Math.random() * options.length)]);
    }

    return selected;
};

// Utility function to generate cache key
const generateCacheKey = (keywords) => {
    return keywords.map(k => k.toLowerCase()).sort().join('|');
};

// Story generation endpoint
app.post('/generate-story', async (req, res) => {
    try {
        const { keywords } = req.body;
        
        // If keywords are provided, validate them
        if (keywords) {
            const validation = validateKeywords(keywords);
            if (!validation.isValid) {
                return res.status(400).json({
                    error: 'Invalid keywords provided',
                    invalidKeywords: validation.invalidKeywords,
                    message: 'Please use only keywords from the available list. Use GET /keywords to see all available options.'
                });
            }
        }

        const selectedKeywords = keywords || generateRandomKeywords();
        const cacheKey = generateCacheKey(selectedKeywords);

        // Check cache first
        if (storyCache.has(cacheKey)) {
            const cachedStory = storyCache.get(cacheKey);
            return res.json({
                story: cachedStory,
                keywords_used: selectedKeywords,
                cached: true
            });
        }

        const prompt = `
            Write a short story using the following keywords: ${selectedKeywords.join(', ')}.
            The story should be between 150-200 words.
            Make it engaging and suitable for young readers.
            The story should have a clear beginning, middle, and end.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a creative children's story writer." },
                { role: "user", content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const story = response.choices[0].message.content.trim();
        
        // Cache the story
        storyCache.set(cacheKey, story);

        res.json({
            story,
            keywords_used: selectedKeywords,
            cached: false
        });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        cache_size: storyCache.size
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 