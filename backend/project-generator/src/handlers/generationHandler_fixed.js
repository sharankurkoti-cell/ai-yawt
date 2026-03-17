const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class GenerationHandler {
  async generateProject(req, res) {
    try {
      const { prompt, techStack, features, projectType } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Project prompt is required' });
      }

      // Build comprehensive project generation prompt
      const generationPrompt = this.buildGenerationPrompt(prompt, techStack, features, projectType);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert full-stack developer and architect. Generate complete, production-ready project structures.
            Create all necessary files with proper code, configuration, and documentation.
            Follow best practices and modern development patterns.`
          },
          {
            role: 'user',
            content: generationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const projectStructure = completion.choices[0].message.content;
      
      // Parse and organize the generated project
      const projectId = uuidv4();
      const projectPath = path.join(__dirname, '../../temp', projectId);
      
      await fs.ensureDir(projectPath);
      
      // Create project files from AI response
      await this.createProjectFiles(projectStructure, projectPath);
      
      // Create project metadata
      const metadata = {
        id: projectId,
        prompt,
        techStack: techStack || [],
        features: features || [],
        projectType: projectType || 'full-stack',
        createdAt: new Date().toISOString(),
        files: await this.getProjectFiles(projectPath)
      };

      res.json({
        projectId,
        metadata,
        structure: projectStructure,
        timestamp: new Date().toISOString(),
        usage: completion.usage
      });

    } catch (error) {
      console.error('Project generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate project',
        details: error.message 
      });
    }
  }

  async getTemplates(req, res) {
    try {
      const templates = [
        {
          id: 'react-node-mongo',
          name: 'React + Node.js + MongoDB',
          description: 'Full-stack MERN application with authentication',
          techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
          features: ['Authentication', 'REST API', 'CRUD Operations']
        },
        {
          id: 'react-python-postgres',
          name: 'React + Python + PostgreSQL',
          description: 'Full-stack application with Python backend',
          techStack: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'],
          features: ['Authentication', 'API Documentation', 'Database Migrations']
        },
        {
          id: 'vue-go-postgres',
          name: 'Vue.js + Go + PostgreSQL',
          description: 'Modern full-stack with Go backend',
          techStack: ['Vue.js', 'Go', 'Gin', 'PostgreSQL', 'GORM'],
          features: ['Authentication', 'Middleware', 'Database Pooling']
        },
        {
          id: 'angular-java-spring',
          name: 'Angular + Java Spring Boot',
          description: 'Enterprise-grade Java application',
          techStack: ['Angular', 'Java', 'Spring Boot', 'PostgreSQL', 'Maven'],
          features: ['Authentication', 'Dependency Injection', 'Unit Tests']
        },
        {
          id: 'nextjs-typescript-prisma',
          name: 'Next.js + TypeScript + Prisma',
          description: 'Modern full-stack with type safety',
          techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'TailwindCSS'],
          features: ['Type Safety', 'API Routes', 'Database Client']
        }
      ];

      res.json({ templates });

    } catch (error) {
      console.error('Templates error:', error);
      res.status(500).json({ 
        error: 'Failed to get templates',
        details: error.message 
      });
    }
  }

  async downloadProject(req, res) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const projectPath = path.join(__dirname, '../../temp', projectId);
      
      if (!await fs.pathExists(projectPath)) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.attachment(`project-${projectId}.zip`);
      archive.pipe(res);

      archive.directory(projectPath, false);
      archive.finalize();

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ 
        error: 'Failed to download project',
        details: error.message 
      });
    }
  }

  buildGenerationPrompt(prompt, techStack, features, projectType) {
    let generationPrompt = `Generate a complete full-stack project based on this request:\n\n`;
    
    generationPrompt += `**Project Description:**\n${prompt}\n\n`;
    
    if (techStack && techStack.length > 0) {
      generationPrompt += `**Tech Stack:**\n${techStack.join(', ')}\n\n`;
    }
    
    if (features && features.length > 0) {
      generationPrompt += `**Required Features:**\n${features.join(', ')}\n\n`;
    }
    
    if (projectType) {
      generationPrompt += `**Project Type:**\n${projectType}\n\n`;
    }

    generationPrompt += `Please generate a complete project structure with:

1. **Frontend** - Complete UI application with:
   - Modern framework setup
   - Component structure
   - Routing and navigation
   - State management
   - API integration
   - Styling and responsive design
   - Error handling and loading states

2. **Backend** - Complete server application with:
   - RESTful API endpoints
   - Database integration
   - Authentication and authorization
   - Input validation and sanitization
   - Error handling middleware
   - API documentation
   - Environment configuration

3. **Database** - Database setup with:
   - Schema/migrations
   - Seed data (if applicable)
   - Models/ORM setup
   - Database configuration

4. **Configuration** - All necessary config files:
   - Package.json files
   - Environment files (.env.example)
   - Build scripts
   - Docker configuration
   - README.md with setup instructions

5. **Additional Files**:
   - .gitignore
   - ESLint/Prettier configuration
   - Testing setup
   - CI/CD configuration

Format your response as a complete project structure with file paths and their contents. Use markdown code blocks for each file with appropriate language syntax.

Example format:
\`\`\`text
project-name/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.js
│   │   └── ...
│   └── ...
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js
│   │   └── ...
│   └── ...
└── README.md

File: frontend/package.json
\`\`\`json
{
  "name": "project-frontend",
  "version": "1.0.0",
  ...
}
\`\`\`

File: backend/server.js
\`\`\`javascript
const express = require('express');
...
\`\`\`

Continue with all necessary files...\`;

    return generationPrompt;
  }

  async createProjectFiles(projectStructure, projectPath) {
    // Parse the AI response and create files
    // This is a simplified version - in production, you'd want more sophisticated parsing
    const lines = projectStructure.split('\n');
    let currentFile = null;
    let currentContent = [];
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith('File: ')) {
        // Save previous file if exists
        if (currentFile && currentContent.length > 0) {
          await this.saveFile(currentFile, currentContent.join('\n'), projectPath);
        }
        
        // Start new file
        currentFile = line.replace('File: ', '').trim();
        currentContent = [];
        inCodeBlock = false;
      } else if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && currentFile) {
          await this.saveFile(currentFile, currentContent.join('\n'), projectPath);
          currentFile = null;
          currentContent = [];
        }
      } else if (inCodeBlock && currentFile) {
        currentContent.push(line);
      }
    }

    // Save last file if exists
    if (currentFile && currentContent.length > 0) {
      await this.saveFile(currentFile, currentContent.join('\n'), projectPath);
    }
  }

  async saveFile(filePath, content, projectPath) {
    const fullPath = path.join(projectPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
  }

  async getProjectFiles(projectPath) {
    const files = [];
    
    async function scanDirectory(dir, relativePath = '') {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await scanDirectory(fullPath, itemRelativePath);
        } else {
          files.push({
            path: itemRelativePath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
    }
    
    await scanDirectory(projectPath);
    return files;
  }
}

module.exports = new GenerationHandler();
