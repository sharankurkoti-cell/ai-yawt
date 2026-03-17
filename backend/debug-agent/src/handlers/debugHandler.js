const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class DebugHandler {
  async analyzeError(req, res) {
    try {
      const { errorMessage, stackTrace, code, language, context } = req.body;

      if (!errorMessage) {
        return res.status(400).json({ error: 'Error message is required' });
      }

      // Build comprehensive error analysis prompt
      const prompt = this.buildErrorAnalysisPrompt(errorMessage, stackTrace, code, language, context);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert debugging assistant with deep knowledge of programming languages, frameworks, and common software issues. 
            Analyze errors thoroughly and provide clear, actionable solutions. Consider performance, security, and best practices.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const analysis = completion.choices[0].message.content;

      res.json({
        analysis,
        timestamp: new Date().toISOString(),
        usage: completion.usage
      });

    } catch (error) {
      console.error('Debug analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze error',
        details: error.message 
      });
    }
  }

  async generateFix(req, res) {
    try {
      const { errorMessage, stackTrace, code, language, analysis } = req.body;

      if (!code || !errorMessage) {
        return res.status(400).json({ error: 'Code and error message are required' });
      }

      // Build fix generation prompt
      const prompt = this.buildFixPrompt(errorMessage, stackTrace, code, language, analysis);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert code fixer. Generate working code solutions that resolve the reported error.
            Maintain the existing code style and structure. Provide explanations for the changes made.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      const fix = completion.choices[0].message.content;

      res.json({
        fixedCode: fix,
        timestamp: new Date().toISOString(),
        usage: completion.usage
      });

    } catch (error) {
      console.error('Fix generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate fix',
        details: error.message 
      });
    }
  }

  async improveCode(req, res) {
    try {
      const { code, language, focusAreas } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      // Build code improvement prompt
      const prompt = this.buildImprovementPrompt(code, language, focusAreas);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a senior software engineer and code reviewer. Improve code quality, performance, security, and maintainability.
            Focus on best practices, design patterns, and modern language features.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2500,
      });

      const improvement = completion.choices[0].message.content;

      res.json({
        improvedCode: improvement,
        timestamp: new Date().toISOString(),
        usage: completion.usage
      });

    } catch (error) {
      console.error('Code improvement error:', error);
      res.status(500).json({ 
        error: 'Failed to improve code',
        details: error.message 
      });
    }
  }

  buildErrorAnalysisPrompt(errorMessage, stackTrace, code, language, context) {
    let prompt = `Analyze this error and provide a comprehensive diagnosis:\n\n`;
    
    prompt += `**Error Message:**\n${errorMessage}\n\n`;
    
    if (stackTrace) {
      prompt += `**Stack Trace:**\n\`\`\`\n${stackTrace}\n\`\`\`\n\n`;
    }
    
    if (code) {
      prompt += `**Code:**\n\`\`\`${language || 'text'}\n${code}\n\`\`\`\n\n`;
    }
    
    if (context) {
      prompt += `**Context:**\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    prompt += `Please provide:
1. **Root Cause Analysis** - What is causing this error?
2. **Error Type** - Classification of the error (syntax, runtime, logic, etc.)
3. **Severity Assessment** - How critical is this issue?
4. **Affected Components** - What parts of the system are impacted?
5. **Potential Solutions** - Multiple approaches to fix this
6. **Prevention Measures** - How to avoid similar issues in the future
7. **Related Issues** - Other problems that might be connected

Format your response in clear, structured markdown.`;

    return prompt;
  }

  buildFixPrompt(errorMessage, stackTrace, code, language, analysis) {
    let prompt = `Generate a fix for this error:\n\n`;
    
    prompt += `**Error Message:**\n${errorMessage}\n\n`;
    
    if (stackTrace) {
      prompt += `**Stack Trace:**\n\`\`\`\n${stackTrace}\n\`\`\`\n\n`;
    }
    
    prompt += `**Original Code:**\n\`\`\`${language || 'text'}\n${code}\n\`\`\`\n\n`;
    
    if (analysis) {
      prompt += `**Previous Analysis:**\n${analysis}\n\n`;
    }

    prompt += `Please provide:
1. **Fixed Code** - Complete working solution
2. **Changes Made** - Detailed explanation of modifications
3. **Why the Fix Works** - Technical reasoning
4. **Testing Recommendations** - How to verify the fix
5. **Edge Cases Considered** - Additional scenarios handled

Return only the fixed code in a code block, followed by the explanation.`;

    return prompt;
  }

  buildImprovementPrompt(code, language, focusAreas) {
    let prompt = `Improve this code:\n\n`;
    
    prompt += `**Code:**\n\`\`\`${language || 'text'}\n${code}\n\`\`\`\n\n`;
    
    if (focusAreas && focusAreas.length > 0) {
      prompt += `**Focus Areas:**\n${focusAreas.join(', ')}\n\n`;
    }

    prompt += `Please improve this code focusing on:
1. **Performance** - Optimize for speed and resource usage
2. **Readability** - Better variable names, comments, structure
3. **Security** - Identify and fix vulnerabilities
4. **Best Practices** - Follow language-specific conventions
5. **Maintainability** - Make it easier to modify and extend
6. **Error Handling** - Add proper error management
7. **Modern Features** - Use current language capabilities

Provide the improved code with explanations for each major change.`;

    return prompt;
  }
}

module.exports = new DebugHandler();
