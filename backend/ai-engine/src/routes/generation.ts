const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { ContextAnalyzer } = require('../services/contextAnalyzer');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const contextAnalyzer = new ContextAnalyzer();

// Code completion endpoint
router.post('/completion', async (req, res) => {
    try {
        const { prompt, language, context, max_tokens = 100, temperature = 0.1, model = 'gpt-4' } = req.body;

        const systemPrompt = `You are an expert code completion AI. Generate concise, accurate code completions for ${language}.
        
        Guidelines:
        - Complete the code naturally without extra explanation
        - Follow existing code style and patterns
        - Only provide the completion, not full implementation
        - Use modern best practices for ${language}
        - Keep responses under ${max_tokens} tokens
        
        Context:
        ${context || 'No additional context provided'}

        Code to complete:
        ${prompt}`;

        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens,
            temperature,
            n: 3, // Generate 3 options
            stop: ['\n\n', '```', ';', '}'] // Stop at natural breakpoints
        });

        const completions = completion.choices.map(choice => choice.message.content?.trim()).filter(Boolean);

        res.json({
            completions,
            model,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Completion error:', error);
        res.status(500).json({ error: 'Failed to generate completion' });
    }
});

// Inline completion endpoint
router.post('/inline-completion', async (req, res) => {
    try {
        const { prompt, language, context } = req.body;

        const systemPrompt = `You are an expert code completion AI. Provide a single, concise inline completion for ${language}.
        
        Guidelines:
        - Complete the current line or expression
        - No extra explanations or comments
        - Match existing indentation and style
        - Maximum 50 tokens
        - Stop at natural completion points

        Context:
        ${context || ''}

        Code to complete:
        ${prompt}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 50,
            temperature: 0.1,
            n: 1,
            stop: ['\n', ';', ')', ']', '}']
        });

        const completion_text = completion.choices[0]?.message.content?.trim() || '';

        res.json({
            completion: completion_text
        });
    } catch (error) {
        console.error('Inline completion error:', error);
        res.status(500).json({ error: 'Failed to generate inline completion' });
    }
});

// Code analysis endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { code, language, action, context } = req.body;

        let systemPrompt = '';
        let userPrompt = '';

        switch (action) {
            case 'explain':
                systemPrompt = `You are an expert programmer. Explain the following ${language} code clearly and concisely.
                Focus on:
                - What the code does
                - How it works
                - Key concepts or patterns used
                - Any important details or edge cases`;
                userPrompt = `Explain this ${language} code:\n\n${code}\n\n${context ? `Additional context: ${context}` : ''}`;
                break;

            case 'fix':
                systemPrompt = `You are an expert debugging assistant. Analyze the following ${language} code and fix any issues.
                Provide:
                - The corrected code
                - Explanation of what was wrong
                - How the fix resolves the issue`;
                userPrompt = `Fix this ${language} code:\n\n${code}\n\n${context ? `Context: ${context}` : ''}`;
                break;

            case 'optimize':
                systemPrompt = `You are a performance optimization expert. Analyze and optimize the following ${language} code.
                Provide:
                - The optimized code
                - Explanation of improvements made
                - Performance benefits
                - Any trade-offs`;
                userPrompt = `Optimize this ${language} code:\n\n${code}\n\n${context ? `Context: ${context}` : ''}`;
                break;

            case 'test':
                systemPrompt = `You are a testing expert. Generate comprehensive tests for the following ${language} code.
                Include:
                - Unit tests
                - Edge cases
                - Error handling
                - Integration test suggestions
                Use appropriate testing framework for ${language}`;
                userPrompt = `Generate tests for this ${language} code:\n\n${code}\n\n${context ? `Context: ${context}` : ''}`;
                break;

            case 'document':
                systemPrompt = `You are a documentation expert. Generate comprehensive documentation for the following ${language} code.
                Include:
                - Function/method descriptions
                - Parameter documentation
                - Return value descriptions
                - Usage examples
                - Important notes or warnings`;
                userPrompt = `Document this ${language} code:\n\n${code}\n\n${context ? `Context: ${context}` : ''}`;
                break;

            case 'refactor':
                systemPrompt = `You are a code refactoring expert. Refactor the following ${language} code to improve:
                - Readability
                - Maintainability
                - Performance
                - Best practices
                Provide the refactored code and explain the changes made.`;
                userPrompt = `Refactor this ${language} code:\n\n${code}\n\n${context ? `Context: ${context}` : ''}`;
                break;

            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        const result = completion.choices[0]?.message.content || '';

        res.json({
            result,
            action,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze code' });
    }
});

// Multi-file context endpoint
router.post('/multi-file-context', async (req, res) => {
    try {
        const { files } = req.body;

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'Files array is required' });
        }

        // This would integrate with the context analyzer service
        // For now, provide a basic implementation
        const context = await contextAnalyzer.getMultiFileContext(files);

        res.json({
            context,
            filesProcessed: files.length
        });
    } catch (error) {
        console.error('Multi-file context error:', error);
        res.status(500).json({ error: 'Failed to process multi-file context' });
    }
});

// Advanced completion with large context
router.post('/advanced-completion', async (req, res) => {
    try {
        const { 
            prompt, 
            language, 
            context, 
            repositoryContext,
            max_tokens = 500,
            temperature = 0.2,
            model = 'gpt-4-turbo'
        } = req.body;

        const systemPrompt = `You are an advanced AI code assistant with deep understanding of software development.
        
        You have access to:
        - Current file context
        - Repository-wide context
        - Multi-file relationships
        - Best practices and patterns
        
        Generate high-quality, contextually aware code completions for ${language}.
        
        Repository Context:
        ${repositoryContext || 'No repository context available'}
        
        Current Context:
        ${context || 'No additional context'}`;

        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens,
            temperature,
            n: 1
        });

        const result = completion.choices[0]?.message.content || '';

        res.json({
            completion: result,
            model,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Advanced completion error:', error);
        res.status(500).json({ error: 'Failed to generate advanced completion' });
    }
});

// Code generation from natural language
router.post('/generate-from-prompt', async (req, res) => {
    try {
        const { prompt, language, context, framework } = req.body;

        const systemPrompt = `You are an expert software developer. Generate ${language} code from the following natural language description.
        
        Requirements:
        - Generate complete, working code
        - Follow ${language} best practices
        - Include error handling where appropriate
        - Add comments for complex logic
        - Use ${framework || 'standard'} framework conventions
        
        Context:
        ${context || 'No additional context provided'}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 3000,
            temperature: 0.3
        });

        const generatedCode = completion.choices[0]?.message.content || '';

        res.json({
            code: generatedCode,
            language,
            usage: completion.usage
        });
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

module.exports = router;
