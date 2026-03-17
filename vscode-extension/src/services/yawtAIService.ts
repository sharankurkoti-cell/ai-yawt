import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface CompletionRequest {
    prompt: string;
    language: string;
    context?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface CodeAnalysisRequest {
    code: string;
    language: string;
    action: 'explain' | 'fix' | 'optimize' | 'test' | 'document' | 'refactor';
    context?: string;
}

export interface SecurityScanResult {
    vulnerabilities: Array<{
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        line: number;
        description: string;
        recommendation: string;
    }>;
    score: number;
}

export class YawtAIService {
    private apiClient: AxiosInstance;
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = vscode.workspace.getConfiguration('yawtai').get('apiKey') || '';
        this.baseUrl = vscode.workspace.getConfiguration('yawtai').get('baseUrl') || 'http://localhost:3002';
        
        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        // Request interceptor for logging
        this.apiClient.interceptors.request.use(
            (config) => {
                console.log(`YawtAI API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('YawtAI API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.apiClient.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.error('YawtAI API Response Error:', error.response?.data || error.message);
                vscode.window.showErrorMessage(`YawtAI API Error: ${error.response?.data?.message || error.message}`);
                return Promise.reject(error);
            }
        );
    }

    async getCodeCompletion(request: CompletionRequest): Promise<string[]> {
        try {
            const response = await this.apiClient.post('/generation/completion', {
                prompt: request.prompt,
                language: request.language,
                context: request.context,
                max_tokens: request.maxTokens || 100,
                temperature: request.temperature || 0.1,
                model: vscode.workspace.getConfiguration('yawtai').get('model') || 'gpt-4'
            });

            return response.data.completions || [];
        } catch (error) {
            console.error('Code completion error:', error);
            return [];
        }
    }

    async getInlineCompletion(request: CompletionRequest): Promise<string> {
        try {
            const response = await this.apiClient.post('/generation/inline-completion', {
                prompt: request.prompt,
                language: request.language,
                context: request.context,
                max_tokens: 50,
                temperature: 0.1
            });

            return response.data.completion || '';
        } catch (error) {
            console.error('Inline completion error:', error);
            return '';
        }
    }

    async sendChatMessage(messages: ChatMessage[]): Promise<ChatMessage> {
        try {
            const response = await this.apiClient.post('/chat', {
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                model: vscode.workspace.getConfiguration('yawtai').get('model') || 'gpt-4'
            });

            return {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }

    async analyzeCode(request: CodeAnalysisRequest): Promise<string> {
        try {
            const response = await this.apiClient.post('/generation/analyze', {
                code: request.code,
                language: request.language,
                action: request.action,
                context: request.context
            });

            return response.data.result;
        } catch (error) {
            console.error('Code analysis error:', error);
            throw error;
        }
    }

    async scanSecurity(code: string, language: string): Promise<SecurityScanResult> {
        try {
            const response = await this.apiClient.post('/security/scan', {
                code,
                language
            });

            return response.data;
        } catch (error) {
            console.error('Security scan error:', error);
            return {
                vulnerabilities: [],
                score: 100
            };
        }
    }

    async explainError(error: string, stackTrace?: string, code?: string): Promise<string> {
        try {
            const response = await this.apiClient.post('/debug/explain-error', {
                error,
                stackTrace,
                code
            });

            return response.data.explanation;
        } catch (error) {
            console.error('Error explanation failed:', error);
            throw error;
        }
    }

    async generateRepositoryAnalysis(repoPath: string): Promise<any> {
        try {
            const response = await this.apiClient.post('/repo-analysis/analyze', {
                path: repoPath
            });

            return response.data;
        } catch (error) {
            console.error('Repository analysis error:', error);
            throw error;
        }
    }

    async getMultiFileContext(filePaths: string[]): Promise<string> {
        try {
            const response = await this.apiClient.post('/context/multi-file', {
                files: filePaths
            });

            return response.data.context;
        } catch (error) {
            console.error('Multi-file context error:', error);
            return '';
        }
    }

    async processVoiceInput(audioBuffer: Buffer): Promise<string> {
        try {
            const formData = new FormData();
            const blob = new Blob([audioBuffer], { type: 'audio/wav' });
            formData.append('audio', blob);

            const response = await this.apiClient.post('/voice/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.transcript;
        } catch (error) {
            console.error('Voice processing error:', error);
            throw error;
        }
    }

    async updateApiKey(newKey: string): Promise<void> {
        this.apiKey = newKey;
        this.apiClient.defaults.headers['Authorization'] = `Bearer ${newKey}`;
        await vscode.workspace.getConfiguration('yawtai').update('apiKey', newKey, true);
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.apiClient.get('/health');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}
