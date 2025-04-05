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

// Story generation endpoint
app.post('/generate-story', async (req, res) => {
    try {
        const { keywords } = req.body;
        const selectedKeywords = keywords || generateRandomKeywords();

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

        res.json({
            story: response.choices[0].message.content.trim(),
            keywords_used: selectedKeywords
        });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 