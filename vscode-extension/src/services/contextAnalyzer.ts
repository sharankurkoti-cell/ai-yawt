import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface FileContext {
    filePath: string;
    content: string;
    language: string;
    lastModified: Date;
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
    variables: string[];
}

export interface ProjectContext {
    rootPath: string;
    files: Map<string, FileContext>;
    dependencies: Map<string, string[]>;
    structure: any;
    gitInfo?: any;
}

export class ContextAnalyzer {
    private projectContext: ProjectContext | null = null;
    private contextCache: Map<string, string> = new Map();
    private maxContextSize: number = 50000; // 50KB max context

    constructor() {
        this.initializeProjectContext();
    }

    private async initializeProjectContext(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        this.projectContext = {
            rootPath,
            files: new Map(),
            dependencies: new Map(),
            structure: await this.analyzeProjectStructure(rootPath)
        };

        await this.scanProjectFiles(rootPath);
    }

    private async analyzeProjectStructure(rootPath: string): Promise<any> {
        const structure = {
            type: 'project',
            name: path.basename(rootPath),
            children: []
        };

        try {
            const scanDirectory = (dir: string, parentNode: any): void => {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    if (item.startsWith('.')) continue; // Skip hidden files
                    
                    const itemPath = path.join(dir, item);
                    const stats = fs.statSync(itemPath);
                    
                    const node: any = {
                        name: item,
                        path: itemPath,
                        type: stats.isDirectory() ? 'directory' : 'file'
                    };

                    if (stats.isDirectory()) {
                        node.children = [];
                        scanDirectory(itemPath, node);
                    } else {
                        node.extension = path.extname(item);
                        node.size = stats.size;
                        node.lastModified = stats.mtime;
                    }

                    parentNode.children.push(node);
                }
            };

            scanDirectory(rootPath, structure);
        } catch (error) {
            console.error('Error analyzing project structure:', error);
        }

        return structure;
    }

    private async scanProjectFiles(rootPath: string): Promise<void> {
        if (!this.projectContext) return;

        const supportedExtensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt'];
        
        const scanDirectory = async (dir: string): Promise<void> => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                if (item.startsWith('.') || item === 'node_modules' || item === '.git') continue;
                
                const itemPath = path.join(dir, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    await scanDirectory(itemPath);
                } else if (supportedExtensions.includes(path.extname(item))) {
                    await this.analyzeFile(itemPath);
                }
            }
        };

        await scanDirectory(rootPath);
    }

    private async analyzeFile(filePath: string): Promise<void> {
        if (!this.projectContext) return;

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const language = this.getLanguageFromPath(filePath);
            const stats = fs.statSync(filePath);

            const fileContext: FileContext = {
                filePath,
                content,
                language,
                lastModified: stats.mtime,
                imports: this.extractImports(content, language),
                exports: this.extractExports(content, language),
                functions: this.extractFunctions(content, language),
                classes: this.extractClasses(content, language),
                variables: this.extractVariables(content, language)
            };

            this.projectContext.files.set(filePath, fileContext);
            this.updateDependencies(filePath, fileContext);
        } catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error);
        }
    }

    private getLanguageFromPath(filePath: string): string {
        const ext = path.extname(filePath);
        const languageMap: { [key: string]: string } = {
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.kt': 'kotlin'
        };

        return languageMap[ext] || 'text';
    }

    private extractImports(content: string, language: string): string[] {
        const imports: string[] = [];
        
        switch (language) {
            case 'typescript':
            case 'javascript':
                const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    imports.push(match[1]);
                }
                break;
            case 'python':
                const pythonImportRegex = /(?:from\s+(\S+)\s+)?import\s+(.+)/g;
                while ((match = pythonImportRegex.exec(content)) !== null) {
                    if (match[1]) imports.push(match[1]);
                    else imports.push(match[2]);
                }
                break;
            // Add more language patterns as needed
        }

        return imports;
    }

    private extractExports(content: string, language: string): string[] {
        const exports: string[] = [];
        
        switch (language) {
            case 'typescript':
            case 'javascript':
                const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
                let match;
                while ((match = exportRegex.exec(content)) !== null) {
                    exports.push(match[1]);
                }
                break;
        }

        return exports;
    }

    private extractFunctions(content: string, language: string): string[] {
        const functions: string[] = [];
        
        switch (language) {
            case 'typescript':
            case 'javascript':
                const functionRegex = /(?:function\s+(\w+)|(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;
                let match;
                while ((match = functionRegex.exec(content)) !== null) {
                    functions.push(match[1] || match[2]);
                }
                break;
            case 'python':
                const pythonFunctionRegex = /def\s+(\w+)\s*\(/g;
                while ((match = pythonFunctionRegex.exec(content)) !== null) {
                    functions.push(match[1]);
                }
                break;
        }

        return functions;
    }

    private extractClasses(content: string, language: string): string[] {
        const classes: string[] = [];
        
        switch (language) {
            case 'typescript':
            case 'javascript':
            case 'python':
            case 'java':
            case 'csharp':
                const classRegex = /class\s+(\w+)/g;
                let match;
                while ((match = classRegex.exec(content)) !== null) {
                    classes.push(match[1]);
                }
                break;
        }

        return classes;
    }

    private extractVariables(content: string, language: string): string[] {
        const variables: string[] = [];
        
        switch (language) {
            case 'typescript':
            case 'javascript':
                const varRegex = /(?:const|let|var)\s+(\w+)/g;
                let match;
                while ((match = varRegex.exec(content)) !== null) {
                    variables.push(match[1]);
                }
                break;
            case 'python':
                const pythonVarRegex = /(\w+)\s*=/g;
                while ((match = pythonVarRegex.exec(content)) !== null) {
                    if (!['def', 'class', 'import', 'from'].includes(match[1])) {
                        variables.push(match[1]);
                    }
                }
                break;
        }

        return variables;
    }

    private updateDependencies(filePath: string, fileContext: FileContext): void {
        if (!this.projectContext) return;

        const dependencies = fileContext.imports.map(imp => {
            // Convert relative imports to absolute paths
            if (imp.startsWith('./') || imp.startsWith('../')) {
                const absolutePath = path.resolve(path.dirname(filePath), imp);
                return absolutePath;
            }
            return imp;
        });

        this.projectContext.dependencies.set(filePath, dependencies);
    }

    async getContext(document: vscode.TextDocument, position?: vscode.Position): Promise<string> {
        const filePath = document.uri.fsPath;
        const cacheKey = `${filePath}:${position?.line || 0}`;

        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey)!;
        }

        let context = '';

        // Add current file context
        const fileContext = this.projectContext?.files.get(filePath);
        if (fileContext) {
            context += `Current File: ${filePath}\n`;
            context += `Language: ${fileContext.language}\n`;
            context += `Imports: ${fileContext.imports.join(', ')}\n`;
            context += `Functions: ${fileContext.functions.join(', ')}\n`;
            context += `Classes: ${fileContext.classes.join(', ')}\n\n`;
        }

        // Add surrounding code context
        if (position) {
            const lines = document.getText().split('\n');
            const startLine = Math.max(0, position.line - 10);
            const endLine = Math.min(lines.length - 1, position.line + 10);
            context += `Surrounding Code (lines ${startLine}-${endLine}):\n`;
            context += lines.slice(startLine, endLine + 1).join('\n') + '\n\n';
        }

        // Add related files context
        if (fileContext) {
            const relatedFiles = this.getRelatedFiles(filePath);
            if (relatedFiles.length > 0) {
                context += `Related Files:\n`;
                for (const relatedFile of relatedFiles.slice(0, 3)) {
                    const relatedContext = this.projectContext?.files.get(relatedFile);
                    if (relatedContext) {
                        context += `- ${relatedFile}: ${relatedContext.functions.slice(0, 5).join(', ')}\n`;
                    }
                }
            }
        }

        // Add project structure context
        if (this.projectContext) {
            context += `\nProject Structure:\n`;
            context += `Root: ${this.projectContext.rootPath}\n`;
            context += `Total Files: ${this.projectContext.files.size}\n`;
        }

        // Limit context size
        if (context.length > this.maxContextSize) {
            context = context.substring(0, this.maxContextSize) + '\n...[truncated]';
        }

        this.contextCache.set(cacheKey, context);
        return context;
    }

    private getRelatedFiles(filePath: string): string[] {
        if (!this.projectContext) return [];

        const dependencies = this.projectContext.dependencies.get(filePath) || [];
        const relatedFiles: string[] = [];

        // Find files that import this file
        for (const [file, deps] of this.projectContext.dependencies) {
            if (deps.includes(filePath)) {
                relatedFiles.push(file);
            }
        }

        // Add dependency files
        relatedFiles.push(...dependencies.filter(dep => this.projectContext!.files.has(dep)));

        return relatedFiles;
    }

    async updateContext(document: vscode.TextDocument): Promise<void> {
        const filePath = document.uri.fsPath;
        
        // Update file context
        await this.analyzeFile(filePath);
        
        // Clear cache for this file
        const keysToDelete = Array.from(this.contextCache.keys()).filter(key => key.startsWith(filePath));
        keysToDelete.forEach(key => this.contextCache.delete(key));
    }

    getProjectContext(): ProjectContext | null {
        return this.projectContext;
    }

    clearCache(): void {
        this.contextCache.clear();
    }

    dispose(): void {
        this.clearCache();
        this.projectContext = null;
    }
}
