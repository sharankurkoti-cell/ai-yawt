const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AIController {
  async chat(req, res) {
    try {
      const { message, context, conversationId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Forward to AI Engine
      const response = await axios.post(`${process.env.AI_ENGINE_URL}/chat`, {
        message,
        context,
        conversationId: conversationId || uuidv4(),
        userId: req.user.id
      });

      res.json(response.data);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error.message 
      });
    }
  }

  async debug(req, res) {
    try {
      const { stackTrace, errorMessage, code, language } = req.body;
      
      if (!errorMessage) {
        return res.status(400).json({ error: 'Error message is required' });
      }

      // Forward to Debug Agent
      const response = await axios.post(`${process.env.DEBUG_AGENT_URL}/analyze`, {
        stackTrace,
        errorMessage,
        code,
        language,
        userId: req.user.id
      });

      res.json(response.data);
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze error',
        details: error.message 
      });
    }
  }

  async generateProject(req, res) {
    try {
      const { prompt, techStack, features } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Project prompt is required' });
      }

      // Forward to Project Generator
      const response = await axios.post(`${process.env.PROJECT_GENERATOR_URL}/generate`, {
        prompt,
        techStack,
        features,
        userId: req.user.id
      });

      res.json(response.data);
    } catch (error) {
      console.error('Project generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate project',
        details: error.message 
      });
    }
  }

  async repoAnalysis(req, res) {
    try {
      const { repoUrl, analysisType } = req.body;
      
      if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
      }

      // Forward to Repository Analysis Service
      const response = await axios.post(`${process.env.REPO_ANALYSIS_URL}/analyze`, {
        repoUrl,
        analysisType: analysisType || 'comprehensive',
        userId: req.user.id
      });

      res.json(response.data);
    } catch (error) {
      console.error('Repository analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze repository',
        details: error.message 
      });
    }
  }
}

module.exports = new AIController();
