import { describe, expect, test, beforeEach } from 'bun:test';
import request from 'supertest';
import { app, openai } from '../index';

// Mock OpenAI client
const mockOpenAI = {
  completions: {
    create: async () => ({
      choices: [{
        text: 'Once upon a time, there was a brave warrior who lived in a magical castle...'
      }]
    })
  }
};

// Replace the real OpenAI client with our mock
Object.defineProperty(global, 'openai', {
  value: mockOpenAI,
  writable: true
});

// Clear the story cache before each test
beforeEach(() => {
  // @ts-ignore - storyCache is not exported, but we need to clear it
  app.locals.storyCache?.clear();
});

describe('POST /generate-story', () => {
  test('should generate a story with valid keywords', async () => {
    const response = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic']
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('story');
    expect(response.body).toHaveProperty('keywords_used');
    expect(response.body).toHaveProperty('cached');
    expect(response.body.keywords_used).toEqual(['Minecraft', 'magic']);
  });

  test('should generate a story with name and age', async () => {
    const response = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic'],
        name: 'Alex',
        age: 10
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('story');
    expect(response.body.keywords_used).toEqual(['Minecraft', 'magic']);
  });

  test('should reject invalid keywords', async () => {
    const response = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['InvalidKeyword1', 'InvalidKeyword2']
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('invalidKeywords');
  });

  test('should reject invalid age', async () => {
    const response = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic'],
        age: 17
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid age');
  });

  test('should reject invalid name', async () => {
    const response = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic'],
        name: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid name');
  });

  test('should use cached story for same keywords', async () => {
    // First request
    const firstResponse = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic']
      });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.cached).toBe(false);

    // Second request with same keywords
    const secondResponse = await request(app)
      .post('/generate-story')
      .send({
        keywords: ['Minecraft', 'magic']
      });

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.cached).toBe(true);
    expect(secondResponse.body.story).toBe(firstResponse.body.story);
  });
}); 