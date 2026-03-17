const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Agent Mode endpoint for autonomous multi-file editing
router.post('/execute', async (req, res) => {
    try {
        const { prompt, context, files, action } = req.body;
        
        const systemPrompt = `You are an expert AI software engineer with deep understanding of complex codebases.
        
        Your task is to execute the following action:
        Action: ${action}
        Prompt: ${prompt}
        
        Context:
        ${context}
        
        Files to modify:
        ${files?.map(f => `  - ${f}`).join('\n') || 'No files specified'}
        
        Guidelines:
        - Execute the requested action precisely
        - Consider all provided context
        - Make minimal, targeted changes
        - Explain your reasoning
        - Handle edge cases and potential side effects
        
        Format your response as JSON with this structure:
        {
            "success": true,
            "result": "Description of what was done",
            "changes": [
                {
                    "file": "path/to/file",
                    "type": "edit|create|delete",
                    "description": "What was changed",
                    "before": "code before change",
                    "after": "code after change"
                }
            ],
            "reasoning": "Step-by-step explanation",
            "sideEffects": "Potential side effects to consider"
        }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });

        const result = completion.choices[0]?.message.content || '{}';
        
        try {
            const parsedResult = JSON.parse(result);
            res.json(parsedResult);
        } catch (parseError) {
            res.json({
                success: false,
                result: 'Failed to parse AI response',
                error: parseError.message
            });
        }
    } catch (error) {
        console.error('Agent Mode execution error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to execute agent task',
            details: error.message 
        });
    }
});

// Plan creation endpoint
router.post('/plan', async (req, res) => {
    try {
        const { prompt, context } = req.body;
        
        const systemPrompt = `You are an expert software architect.
        
        Create a detailed execution plan for the following request:
        ${prompt}
        
        Context:
        ${context}
        
        Break down the task into specific, actionable steps.
        Consider dependencies, file relationships, and potential challenges.
        Provide time estimates for each step.
        
        Format your response as JSON:
        {
            "plan": "Overall description",
            "steps": [
                {
                    "id": "step_1",
                    "description": "What to do",
                    "files": ["file1", "file2"],
                    "estimatedTime": 5,
                    "dependencies": ["step_0"],
                    "risks": ["potential issues"]
                }
            ],
            "totalEstimatedTime": 30
        }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.3
        });

        const result = completion.choices[0]?.message.content || '{}';
        
        try {
            const parsedResult = JSON.parse(result);
            res.json(parsedResult);
        } catch (parseError) {
            res.json({
                success: false,
                error: 'Failed to parse plan response',
                details: parseError.message
            });
        }
    } catch (error) {
        console.error('Plan creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create execution plan',
            details: error.message 
        });
    }
});

// Multi-file task execution
router.post('/multi-file-task', async (req, res) => {
    try {
        const { tasks, context } = req.body;
        
        const systemPrompt = `You are an expert software engineer.
        
        Execute multiple related tasks across different files:
        ${JSON.stringify(tasks, null, 2)}
        
        Context:
        ${context}
        
        Execute all tasks efficiently, considering dependencies between them.
        Provide consolidated results for all changes.
        
        Format response as JSON:
        {
            "success": true,
            "results": [
                {
                    "taskId": "task_id",
                    "success": true,
                    "file": "path/to/file",
                    "changes": "description of changes",
                    "error": null
                }
            ]
        }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(tasks) }
            ],
            max_tokens: 3000,
            temperature: 0.2
        });

        const result = completion.choices[0]?.message.content || '{}';
        
        try {
            const parsedResult = JSON.parse(result);
            res.json(parsedResult);
        } catch (parseError) {
            res.json({
                success: false,
                error: 'Failed to parse multi-file task response',
                details: parseError.message
            });
        }
    } catch (error) {
        console.error('Multi-file task execution error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to execute multi-file task',
            details: error.message 
        });
    }
});

// Autonomous task execution with verification
router.post('/autonomous-task', async (req, res) => {
    try {
        const { goal, constraints, context } = req.body;
        
        const systemPrompt = `You are an autonomous AI software engineer.
        
        Goal: ${goal}
        Constraints: ${constraints || 'None'}
        Context: ${context}
        
        Execute this task autonomously:
        1. Analyze the current codebase
        2. Identify necessary files and dependencies
        3. Make appropriate changes
        4. Verify the changes work correctly
        5. Test if possible
        6. Provide a summary of what was done
        
        Be thorough but efficient. Ask for clarification if the goal is ambiguous.
        
        Format your response as JSON:
        {
            "success": true,
            "goal": "Restatement of the goal",
            "analysis": "What you discovered about the codebase",
            "actions": [
                {
                    "type": "create|edit|delete",
                    "file": "path/to/file",
                    "description": "What was done",
                    "reasoning": "Why this action was needed"
                }
            ],
            "verification": "How you verified the changes",
            "summary": "Overall summary of what was accomplished"
        }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: goal }
            ],
            max_tokens: 4000,
            temperature: 0.1
        });

        const result = completion.choices[0]?.message.content || '{}';
        
        try {
            const parsedResult = JSON.parse(result);
            res.json(parsedResult);
        } catch (parseError) {
            res.json({
                success: false,
                error: 'Failed to parse autonomous task response',
                details: parseError.message
            });
        }
    } catch (error) {
        console.error('Autonomous task execution error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to execute autonomous task',
            details: error.message 
        });
    }
});

module.exports = router;
