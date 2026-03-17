import * as vscode from 'vscode';
import { YawtAIService, ChatMessage } from '../services/yawtAIService';

export class YawtAIChatProvider {
    private panel: vscode.WebviewPanel | undefined;
    private messages: ChatMessage[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, private yawtAIService: YawtAIService) {
        this.context = context;
    }

    async show(): Promise<void> {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'yawtaiChat',
            'YawtAI Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.webview.html = await this.getWebviewContent();

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        await this.handleSendMessage(message.text);
                        break;
                    case 'clearChat':
                        this.clearChat();
                        break;
                    case 'exportChat':
                        this.exportChat();
                        break;
                    case 'voiceInput':
                        await this.handleVoiceInput();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Send initial messages
        this.updateWebview();
    }

    private async getWebviewContent(): Promise<string> {
        const nonce = getNonce();
        const styleUri = this.panel?.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'style.css'));
        const scriptUri = this.panel?.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'script.js'));

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${styleUri}; script-src 'nonce-${nonce}';">
    <title>YawtAI Chat</title>
    <link href="${styleUri}" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 YawtAI Chat</h1>
            <div class="header-actions">
                <button id="clearBtn" class="btn btn-secondary">Clear</button>
                <button id="exportBtn" class="btn btn-secondary">Export</button>
                <button id="voiceBtn" class="btn btn-secondary">🎤 Voice</button>
            </div>
        </div>
        
        <div class="chat-container">
            <div id="messages" class="messages"></div>
        </div>
        
        <div class="input-container">
            <textarea id="messageInput" placeholder="Ask YawtAI anything about your code..." rows="3"></textarea>
            <div class="input-actions">
                <button id="sendBtn" class="btn btn-primary">Send</button>
            </div>
        </div>
        
        <div class="status-bar">
            <span id="status">Ready</span>
            <span id="context-info"></span>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private async handleSendMessage(text: string): Promise<void> {
        if (!text.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        this.messages.push(userMessage);

        // Update UI to show user message
        this.updateWebview();
        this.setStatus('Thinking...');

        try {
            // Get current editor context
            const context = await this.getCurrentContext();
            
            // Add context to the message
            if (context) {
                const contextMessage: ChatMessage = {
                    role: 'system',
                    content: `Current context:\n${context}`,
                    timestamp: new Date()
                };
                this.messages.push(contextMessage);
            }

            // Send to AI service
            const response = await this.yawtAIService.sendChatMessage(this.messages);
            this.messages.push(response);

            this.updateWebview();
            this.setStatus('Ready');
        } catch (error) {
            console.error('Chat error:', error);
            this.setStatus('Error: Failed to get response');
            
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date()
            };
            this.messages.push(errorMessage);
            this.updateWebview();
        }
    }

    private async getCurrentContext(): Promise<string> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return '';

        const document = editor.document;
        const selection = editor.selection;
        
        let context = `File: ${document.fileName}\n`;
        context += `Language: ${document.languageId}\n`;
        
        if (selection && !selection.isEmpty) {
            const selectedText = document.getText(selection);
            context += `Selected Code:\n\`\`\`${document.languageId}\n${selectedText}\n\`\`\`\n\n`;
        }
        
        // Add surrounding lines
        const currentLine = selection.active.line;
        const startLine = Math.max(0, currentLine - 5);
        const endLine = Math.min(document.lineCount - 1, currentLine + 5);
        
        context += `Surrounding Code (lines ${startLine}-${endLine}):\n`;
        for (let i = startLine; i <= endLine; i++) {
            const line = document.lineAt(i);
            const prefix = i === currentLine ? '>>> ' : '    ';
            context += `${prefix}${line.text}\n`;
        }

        return context;
    }

    private async handleVoiceInput(): Promise<void> {
        try {
            this.setStatus('Listening...');
            
            // Request microphone access and record audio
            const audioBuffer = await this.recordAudio();
            
            if (audioBuffer) {
                this.setStatus('Processing voice...');
                const transcript = await this.yawtAIService.processVoiceInput(audioBuffer);
                
                if (transcript) {
                    // Send the transcribed text as a message
                    await this.handleSendMessage(transcript);
                }
            }
        } catch (error) {
            console.error('Voice input error:', error);
            this.setStatus('Voice input failed');
            vscode.window.showErrorMessage('Voice input failed: ' + (error as Error).message);
        }
    }

    private async recordAudio(): Promise<Buffer | null> {
        // This would need to be implemented using Web Audio API in the webview
        // For now, return a placeholder
        return null;
    }

    private clearChat(): void {
        this.messages = [];
        this.updateWebview();
        this.setStatus('Chat cleared');
    }

    private exportChat(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const exportPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'yawtai-chat-export.md');
        const content = this.formatChatForExport();
        
        vscode.workspace.fs.writeFile(exportPath, Buffer.from(content))
            .then(() => {
                vscode.window.showInformationMessage(`Chat exported to ${exportPath.fsPath}`);
            })
            .catch(error => {
                vscode.window.showErrorMessage(`Failed to export chat: ${error.message}`);
            });
    }

    private formatChatForExport(): string {
        let content = '# YawtAI Chat Export\n\n';
        content += `Exported: ${new Date().toISOString()}\n\n`;
        
        for (const message of this.messages) {
            const role = message.role === 'user' ? '👤 User' : '🤖 YawtAI';
            content += `## ${role}\n`;
            content += `${message.content}\n\n`;
            content += `*${message.timestamp.toLocaleString()}*\n\n`;
            content += '---\n\n';
        }
        
        return content;
    }

    private updateWebview(): void {
        if (!this.panel) return;

        const messagesHtml = this.messages.map(msg => {
            const isUser = msg.role === 'user';
            const className = isUser ? 'user-message' : 'assistant-message';
            const avatar = isUser ? '👤' : '🤖';
            const role = isUser ? 'You' : 'YawtAI';
            
            return `
                <div class="message ${className}">
                    <div class="message-header">
                        <span class="avatar">${avatar}</span>
                        <span class="role">${role}</span>
                        <span class="timestamp">${msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div class="message-content">${this.markdownToHtml(msg.content)}</div>
                </div>
            `;
        }).join('');

        this.panel.webview.postMessage({
            command: 'updateMessages',
            messages: messagesHtml
        });
    }

    private markdownToHtml(markdown: string): string {
        // Simple markdown to HTML conversion
        return markdown
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    private setStatus(status: string): void {
        if (!this.panel) return;
        
        this.panel.webview.postMessage({
            command: 'updateStatus',
            status: status
        });
    }

    private updateContextInfo(info: string): void {
        if (!this.panel) return;
        
        this.panel.webview.postMessage({
            command: 'updateContextInfo',
            info: info
        });
    }

    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
