import * as vscode from 'vscode';
import { YawtAIService, CompletionRequest } from '../services/yawtAIService';
import { ContextAnalyzer } from '../services/contextAnalyzer';

export class YawtAICompletionProvider implements vscode.CompletionItemProvider, vscode.InlineCompletionItemProvider {
    private enabled: boolean = true;
    private debounceTimer: NodeJS.Timeout | undefined;
    private lastCompletionTime: number = 0;

    constructor(
        private context: vscode.ExtensionContext,
        private yawtAIService: YawtAIService,
        private contextAnalyzer: ContextAnalyzer
    ) {
        // Load initial state
        this.enabled = vscode.workspace.getConfiguration('yawtai').get('autoComplete') ?? true;

        // Listen to configuration changes
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('yawtai.autoComplete')) {
                this.enabled = vscode.workspace.getConfiguration('yawtai').get('autoComplete') ?? true;
            }
        });
    }

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[]> {
        if (!this.enabled || !this.yawtAIService.isConfigured()) {
            return [];
        }

        // Debounce rapid requests
        const now = Date.now();
        if (now - this.lastCompletionTime < 100) {
            return [];
        }

        try {
            const completionText = await this.getCompletionText(document, position);
            if (!completionText) {
                return [];
            }

            const suggestions = await this.yawtAIService.getCodeCompletion({
                prompt: completionText,
                language: this.getLanguageId(document),
                context: await this.contextAnalyzer.getContext(document, position),
                maxTokens: 100,
                temperature: 0.1
            });

            return this.createCompletionItems(suggestions, position);
        } catch (error) {
            console.error('Completion error:', error);
            return [];
        }
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionList> {
        if (!this.enabled || !this.yawtAIService.isConfigured()) {
            return { items: [] };
        }

        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(async () => {
                try {
                    const completionText = await this.getCompletionText(document, position);
                    if (!completionText) {
                        resolve({ items: [] });
                        return;
                    }

                    const completion = await this.yawtAIService.getInlineCompletion({
                        prompt: completionText,
                        language: this.getLanguageId(document),
                        context: await this.contextAnalyzer.getContext(document, position)
                    });

                    if (completion) {
                        const inlineItem = new vscode.InlineCompletionItem(completion, new vscode.Range(position, position));
                        resolve({ items: [inlineItem] });
                    } else {
                        resolve({ items: [] });
                    }
                } catch (error) {
                    console.error('Inline completion error:', error);
                    resolve({ items: [] });
                }
            }, vscode.workspace.getConfiguration('yawtai').get('autoCompleteDelay') ?? 500);
        });
    }

    private async getCompletionText(document: vscode.TextDocument, position: vscode.Position): Promise<string> {
        const line = document.lineAt(position.line);
        const textBeforeCursor = line.text.substring(0, position.character);
        const textAfterCursor = line.text.substring(position.character);

        // Get surrounding context
        const startLine = Math.max(0, position.line - 10);
        const endLine = Math.min(document.lineCount - 1, position.line + 10);
        const surroundingText = document.getText(new vscode.Range(startLine, 0, endLine, 0));

        return surroundingText;
    }

    private getLanguageId(document: vscode.TextDocument): string {
        return document.languageId;
    }

    private createCompletionItems(suggestions: string[], position: vscode.Position): vscode.CompletionItem[] {
        const maxSuggestions = vscode.workspace.getConfiguration('yawtai').get('maxSuggestions') ?? 5;
        
        return suggestions.slice(0, maxSuggestions).map((suggestion, index) => {
            const item = new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Text);
            item.insertText = suggestion;
            item.sortText = index.toString().padStart(3, '0');
            item.detail = 'YawtAI';
            item.documentation = new vscode.MarkdownString(`**AI Generated Suggestion**\n\n${suggestion}`);
            
            // Add command to accept suggestion
            item.command = {
                command: 'yawtai.acceptSuggestion',
                title: 'Accept Suggestion',
                arguments: [suggestion]
            };

            return item;
        });
    }

    toggle(): void {
        this.enabled = !this.enabled;
        const message = this.enabled ? 'YawtAI auto-completion enabled' : 'YawtAI auto-completion disabled';
        vscode.window.showInformationMessage(message);
        
        // Update configuration
        vscode.workspace.getConfiguration('yawtai').update('autoComplete', this.enabled, true);
    }

    async triggerCompletion(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Force trigger completion
        await vscode.commands.executeCommand('editor.action.triggerSuggest');
    }

    async acceptSuggestion(suggestion: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const position = editor.selection.active;
        await editor.edit((editBuilder) => {
            editBuilder.insert(position, suggestion);
        });

        // Track usage
        this.lastCompletionTime = Date.now();
    }

    async rejectSuggestion(): Promise<void> {
        // Track rejection for improving suggestions
        console.log('Suggestion rejected');
    }

    dispose(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}
