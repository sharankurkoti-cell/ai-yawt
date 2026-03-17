const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Repository-wide search
router.post('/repository', async (req, res) => {
    try {
        const { 
            query, 
            repositoryPath, 
            fileTypes = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs'],
            maxResults = 50,
            includeContent = true,
            caseSensitive = false,
            regex = false
        } = req.body;

        if (!query || !repositoryPath) {
            return res.status(400).json({ error: 'Query and repository path are required' });
        }

        const searchResults = await searchRepository({
            query,
            repositoryPath,
            fileTypes,
            maxResults,
            includeContent,
            caseSensitive,
            regex
        });

        res.json({
            results: searchResults,
            query,
            repositoryPath,
            totalResults: searchResults.length,
            searchTime: Date.now()
        });
    } catch (error) {
        console.error('Repository search error:', error);
        res.status(500).json({ error: 'Failed to search repository' });
    }
});

// Semantic search using AI
router.post('/semantic', async (req, res) => {
    try {
        const { 
            query, 
            repositoryPath, 
            context = '',
            maxResults = 20,
            similarityThreshold = 0.7
        } = req.body;

        if (!query || !repositoryPath) {
            return res.status(400).json({ error: 'Query and repository path are required' });
        }

        // First, get all relevant files
        const allFiles = await getAllCodeFiles(repositoryPath);
        
        // Generate embeddings for the query and files
        const queryEmbedding = await generateEmbedding(query);
        const fileEmbeddings = await Promise.all(
            allFiles.map(async (file) => ({
                ...file,
                embedding: await generateEmbedding(file.content)
            }))
        );

        // Calculate similarities
        const similarities = fileEmbeddings.map(file => ({
            ...file,
            similarity: calculateCosineSimilarity(queryEmbedding, file.embedding)
        }));

        // Filter by threshold and sort
        const relevantFiles = similarities
            .filter(file => file.similarity >= similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);

        // Generate AI-powered explanations
        const explainedResults = await Promise.all(
            relevantFiles.map(async (file) => {
                const explanation = await generateSearchExplanation(query, file.content, context);
                return {
                    ...file,
                    explanation,
                    relevanceScore: file.similarity
                };
            })
        );

        res.json({
            results: explainedResults,
            query,
            repositoryPath,
            totalResults: explainedResults.length,
            searchType: 'semantic'
        });
    } catch (error) {
        console.error('Semantic search error:', error);
        res.status(500).json({ error: 'Failed to perform semantic search' });
    }
});

// Code pattern search
router.post('/patterns', async (req, res) => {
    try {
        const { 
            pattern, 
            repositoryPath, 
            language,
            includeTests = false,
            maxResults = 30
        } = req.body;

        if (!pattern || !repositoryPath) {
            return res.status(400).json({ error: 'Pattern and repository path are required' });
        }

        const patternResults = await searchCodePatterns({
            pattern,
            repositoryPath,
            language,
            includeTests,
            maxResults
        });

        res.json({
            results: patternResults,
            pattern,
            language,
            totalResults: patternResults.length
        });
    } catch (error) {
        console.error('Pattern search error:', error);
        res.status(500).json({ error: 'Failed to search code patterns' });
    }
});

// Symbol search (functions, classes, variables)
router.post('/symbols', async (req, res) => {
    try {
        const { 
            symbol, 
            repositoryPath, 
            symbolType = 'all', // 'function', 'class', 'variable', 'all'
            language,
            includeDefinitions = true,
            includeUsages = true
        } = req.body;

        if (!symbol || !repositoryPath) {
            return res.status(400).json({ error: 'Symbol and repository path are required' });
        }

        const symbolResults = await searchSymbols({
            symbol,
            repositoryPath,
            symbolType,
            language,
            includeDefinitions,
            includeUsages
        });

        res.json({
            results: symbolResults,
            symbol,
            symbolType,
            totalResults: symbolResults.length
        });
    } catch (error) {
        console.error('Symbol search error:', error);
        res.status(500).json({ error: 'Failed to search symbols' });
    }
});

// Dependency search
router.post('/dependencies', async (req, res) => {
    try {
        const { 
            repositoryPath, 
            dependencyType = 'all', // 'imports', 'exports', 'all'
            includeTransitive = false
        } = req.body;

        if (!repositoryPath) {
            return res.status(400).json({ error: 'Repository path is required' });
        }

        const dependencyResults = await analyzeDependencies({
            repositoryPath,
            dependencyType,
            includeTransitive
        });

        res.json({
            dependencies: dependencyResults,
            repositoryPath,
            totalDependencies: dependencyResults.length
        });
    } catch (error) {
        console.error('Dependency search error:', error);
        res.status(500).json({ error: 'Failed to analyze dependencies' });
    }
});

// Search suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { repositoryPath, query = '', limit = 10 } = req.query;

        if (!repositoryPath) {
            return res.status(400).json({ error: 'Repository path is required' });
        }

        const suggestions = await generateSearchSuggestions(repositoryPath, query, limit);

        res.json({
            suggestions,
            query
        });
    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({ error: 'Failed to generate search suggestions' });
    }
});

// Search history
router.get('/history', async (req, res) => {
    try {
        const { userId, limit = 20 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // In production, fetch from database
        const history = [
            {
                id: '1',
                query: 'React component',
                timestamp: new Date(),
                resultsCount: 15
            },
            {
                id: '2',
                query: 'API endpoint',
                timestamp: new Date(Date.now() - 3600000),
                resultsCount: 8
            }
        ];

        res.json({
            history: history.slice(0, limit)
        });
    } catch (error) {
        console.error('Search history error:', error);
        res.status(500).json({ error: 'Failed to get search history' });
    }
});

// Helper functions
async function searchRepository(options) {
    const { query, repositoryPath, fileTypes, maxResults, includeContent, caseSensitive, regex } = options;
    
    return new Promise((resolve, reject) => {
        const filePattern = fileTypes.map(ext => `**/*.${ext}`).join(' ');
        const grepCommand = regex 
            ? `grep -r -n -E --include="*.{${fileTypes.join(',')}}" "${query}" "${repositoryPath}"`
            : `grep -r -n -i --include="*.{${fileTypes.join(',')}}" "${query}" "${repositoryPath}"`;

        exec(grepCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error && !stdout) {
                resolve([]);
                return;
            }

            const results = stdout.split('\n')
                .filter(line => line.trim())
                .slice(0, maxResults)
                .map(line => {
                    const [filePath, lineNumber, ...contentParts] = line.split(':');
                    const content = contentParts.join(':');
                    
                    const result = {
                        filePath: path.relative(repositoryPath, filePath),
                        lineNumber: parseInt(lineNumber),
                        match: content.trim(),
                        context: includeContent ? getContextAroundLine(filePath, parseInt(lineNumber)) : null
                    };

                    return result;
                });

            resolve(results);
        });
    });
}

async function getAllCodeFiles(repositoryPath) {
    const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs'];
    const files = [];

    function scanDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            if (item.startsWith('.') || item === 'node_modules' || item === '.git') {
                continue;
            }

            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                scanDirectory(itemPath);
            } else if (supportedExtensions.includes(path.extname(item))) {
                try {
                    const content = fs.readFileSync(itemPath, 'utf8');
                    files.push({
                        filePath: path.relative(repositoryPath, itemPath),
                        content: content.substring(0, 5000), // Limit content size
                        size: stats.size,
                        lastModified: stats.mtime
                    });
                } catch (error) {
                    console.error(`Error reading file ${itemPath}:`, error);
                }
            }
        }
    }

    scanDirectory(repositoryPath);
    return files;
}

async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text.substring(0, 8000) // Limit input size
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Embedding generation error:', error);
        // Return random embedding as fallback
        return Array(1536).fill(0).map(() => Math.random() - 0.5);
    }
}

function calculateCosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateSearchExplanation(query, content, context) {
    try {
        const systemPrompt = `You are explaining why a code file is relevant to a search query.
        Provide a concise explanation of how the content relates to the query.
        Focus on the key aspects that make it relevant.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Query: ${query}\n\nContent preview: ${content.substring(0, 1000)}` }
            ],
            max_tokens: 200,
            temperature: 0.3
        });

        return completion.choices[0]?.message.content || 'Relevant code found';
    } catch (error) {
        console.error('Explanation generation error:', error);
        return 'Code matches search criteria';
    }
}

async function searchCodePatterns(options) {
    const { pattern, repositoryPath, language, includeTests, maxResults } = options;
    
    // This is a simplified implementation
    // In production, you'd use AST parsing for accurate pattern matching
    const allFiles = await getAllCodeFiles(repositoryPath);
    const results = [];

    for (const file of allFiles) {
        if (!includeTests && file.filePath.includes('test')) {
            continue;
        }

        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
                results.push({
                    filePath: file.filePath,
                    lineNumber: i + 1,
                    match: lines[i].trim(),
                    context: getContextAroundLine(file.filePath, i + 1)
                });

                if (results.length >= maxResults) {
                    return results;
                }
            }
        }
    }

    return results;
}

async function searchSymbols(options) {
    const { symbol, repositoryPath, symbolType, language, includeDefinitions, includeUsages } = options;
    
    // This is a simplified implementation
    // In production, you'd use language servers or AST parsers
    const allFiles = await getAllCodeFiles(repositoryPath);
    const results = [];

    for (const file of allFiles) {
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Simple pattern matching for symbols
            const patterns = {
                function: /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)/g,
                class: /class\s+(\w+)/g,
                variable: /(?:const|let|var)\s+(\w+)/g
            };

            const relevantPatterns = symbolType === 'all' ? Object.values(patterns) : [patterns[symbolType]];
            
            for (const pattern of relevantPatterns) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const symbolName = match[1] || match[2];
                    if (symbolName && symbolName.toLowerCase().includes(symbol.toLowerCase())) {
                        results.push({
                            filePath: file.filePath,
                            lineNumber: i + 1,
                            symbol: symbolName,
                            type: symbolType === 'all' ? 'unknown' : symbolType,
                            match: line.trim(),
                            context: getContextAroundLine(file.filePath, i + 1)
                        });
                    }
                }
            }
        }
    }

    return results;
}

async function analyzeDependencies(options) {
    const { repositoryPath, dependencyType, includeTransitive } = options;
    
    // This is a simplified implementation
    // In production, you'd use package managers and dependency analysis tools
    const allFiles = await getAllCodeFiles(repositoryPath);
    const dependencies = new Set();

    for (const file of allFiles) {
        const lines = file.content.split('\n');
        for (const line of lines) {
            // Simple import/require detection
            const importMatch = line.match(/(?:import|require)\s+.*?from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                dependencies.add({
                    from: file.filePath,
                    to: importMatch[1],
                    type: 'import'
                });
            }
        }
    }

    return Array.from(dependencies);
}

async function generateSearchSuggestions(repositoryPath, query, limit) {
    // This would typically use search analytics and ML
    const commonSuggestions = [
        'function',
        'class',
        'component',
        'api',
        'service',
        'utility',
        'helper',
        'config',
        'test',
        'mock'
    ];

    return commonSuggestions
        .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);
}

function getContextAroundLine(filePath, lineNumber, contextLines = 3) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const start = Math.max(0, lineNumber - contextLines - 1);
        const end = Math.min(lines.length, lineNumber + contextLines);
        
        return {
            before: lines.slice(start, lineNumber - 1),
            current: lines[lineNumber - 1],
            after: lines.slice(lineNumber, end)
        };
    } catch (error) {
        return null;
    }
}

module.exports = router;
