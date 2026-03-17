const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ChatHandler {
  async handleChat(req, res) {
    try {
      const { message, context, conversationId, userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Build system prompt for YawtAI
      const systemPrompt = this.buildSystemPrompt(context);

      // Create conversation messages
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      // Add context messages if provided
      if (context && context.previousMessages) {
        messages.splice(1, 0, ...context.previousMessages);
      }

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      });

      const response = completion.choices[0].message.content;

      res.json({
        conversationId: conversationId || uuidv4(),
        response,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat handler error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat message',
        details: error.message 
      });
    }
  }

  buildSystemPrompt(context) {
    let prompt = `You are YawtAI, an advanced AI software engineer and development assistant. 

Your capabilities include:
- Writing high-quality code in multiple programming languages
- Debugging and fixing errors
- Architecting software solutions
- Explaining complex technical concepts
- Reviewing and optimizing code
- Generating project structures and boilerplate

Key guidelines:
- Provide clear, well-commented code
- Explain your reasoning when appropriate
- Follow best practices and design patterns
- Consider security, performance, and maintainability
- Ask clarifying questions if the request is ambiguous
- Be helpful, professional, and thorough`;

    if (context) {
      if (context.projectInfo) {
        prompt += `\n\nCurrent Project Context:\n${JSON.stringify(context.projectInfo, null, 2)}`;
      }
      
      if (context.currentFile) {
        prompt += `\n\nCurrent File:\n\`\`\`${context.currentFile.language}\n${context.currentFile.content}\n\`\`\``;
      }
      
      if (context.techStack) {
        prompt += `\n\nTech Stack: ${context.techStack.join(', ')}`;
      }
    }

    return prompt;
  }
}

module.exports = new ChatHandler();
