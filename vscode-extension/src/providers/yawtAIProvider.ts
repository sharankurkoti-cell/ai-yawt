import * as vscode from 'vscode';
import { YawtAIService, CodeAnalysisRequest } from '../services/yawtAIService';

export class YawtAIProvider implements vscode.CodeActionProvider, vscode.HoverProvider {
    constructor(
        private context: vscode.ExtensionContext,
        private yawtAIService: YawtAIService
    ) {}

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];

        if (!this.yawtAIService.isConfigured()) {
            const setupAction = new vscode.CodeAction(
                'Configure YawtAI API Key',
                vscode.CodeActionKind.QuickFix
            );
            setupAction.command = {
                command: 'yawtai.settings',
                title: 'Configure YawtAI'
            };
            actions.push(setupAction);
            return actions;
        }

        // Add code analysis actions
        const explainAction = new vscode.CodeAction(
            '🤖 Explain with YawtAI',
            vscode.CodeActionKind.QuickFix
        );
        explainAction.command = {
            command: 'yawtai.explainCode',
            title: 'Explain Code'
        };
        actions.push(explainAction);

        const fixAction = new vscode.CodeAction(
            '🔧 Fix with YawtAI',
            vscode.CodeActionKind.QuickFix
        );
        fixAction.command = {
            command: 'yawtai.fixCode',
            title: 'Fix Code'
        };
        actions.push(fixAction);

        const optimizeAction = new vscode.CodeAction(
            '⚡ Optimize with YawtAI',
            vscode.CodeActionKind.QuickFix
        );
        optimizeAction.command = {
            command: 'yawtai.optimizeCode',
            title: 'Optimize Code'
        };
        actions.push(optimizeAction);

        const testAction = new vscode.CodeAction(
            '🧪 Generate Tests with YawtAI',
            vscode.CodeActionKind.QuickFix
        );
        testAction.command = {
            command: 'yawtai.generateTests',
            title: 'Generate Tests'
        };
        actions.push(testAction);

        const documentAction = new vscode.CodeAction(
            '📝 Generate Documentation with YawtAI',
            vscode.CodeActionKind.QuickFix
        );
        documentAction.command = {
            command: 'yawtai.documentCode',
            title: 'Generate Documentation'
        };
        actions.push(documentAction);

        const refactorAction = new vscode.CodeAction(
            '🔄 Refactor with YawtAI',
            vscode.CodeActionKind.Refactor
        );
        refactorAction.command = {
            command: 'yawtai.refactorCode',
            title: 'Refactor Code'
        };
        actions.push(refactorAction);

        return actions;
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        if (!this.yawtAIService.isConfigured()) {
            return undefined;
        }

        const word = document.getText(document.getWordRangeAtPosition(position));
        if (!word) {
            return undefined;
        }

        try {
            // Get context around the word
            const line = document.lineAt(position.line);
            const contextText = line.text;

            // Quick hover explanation
            const explanation = await this.yawtAIService.analyzeCode({
                code: contextText,
                language: document.languageId,
                action: 'explain',
                context: `Word: ${word}`
            });

            const markdown = new vscode.MarkdownString();
            markdown.appendMarkdown(`**YawtAI Explanation for \`${word}\`**\n\n`);
            markdown.appendMarkdown(explanation);
            markdown.appendMarkdown('\n\n---\n*Powered by YawtAI*');

            return new vscode.Hover(markdown);
        } catch (error) {
            console.error('Hover error:', error);
            return undefined;
        }
    }

    async explainCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText(editor.document.getWordRangeAtPosition(selection.active))
            : editor.document.getText(selection);

        if (!code) {
            vscode.window.showWarningMessage('Please select some code to explain');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing code...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Sending to YawtAI...' });

                const explanation = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'explain',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                // Show explanation in a new tab
                this.showResult('Code Explanation', explanation);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to explain code: ${error}`);
            }
        });
    }

    async fixCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText()
            : editor.document.getText(selection);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Fixing code...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Analyzing issues...' });

                const fixedCode = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'fix',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                // Show fixed code in diff view
                this.showDiff('Fixed Code', code, fixedCode);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to fix code: ${error}`);
            }
        });
    }

    async optimizeCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText()
            : editor.document.getText(selection);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Optimizing code...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Analyzing performance...' });

                const optimizedCode = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'optimize',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                this.showDiff('Optimized Code', code, optimizedCode);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to optimize code: ${error}`);
            }
        });
    }

    async generateTests(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText()
            : editor.document.getText(selection);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating tests...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Analyzing code structure...' });

                const testCode = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'test',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                this.showResult('Generated Tests', testCode);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to generate tests: ${error}`);
            }
        });
    }

    async documentCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText()
            : editor.document.getText(selection);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating documentation...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Analyzing code...' });

                const documentation = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'document',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                this.showResult('Generated Documentation', documentation);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to generate documentation: ${error}`);
            }
        });
    }

    async refactorCode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const code = selection.isEmpty 
            ? editor.document.getText()
            : editor.document.getText(selection);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Refactoring code...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Analyzing refactoring opportunities...' });

                const refactoredCode = await this.yawtAIService.analyzeCode({
                    code,
                    language: editor.document.languageId,
                    action: 'refactor',
                    context: this.getContext(editor)
                });

                progress.report({ increment: 100, message: 'Complete!' });

                this.showDiff('Refactored Code', code, refactoredCode);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to refactor code: ${error}`);
            }
        });
    }

    async explainError(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        // Try to get error from output panel or diagnostics
        const error = await this.getErrorFromContext();
        if (!error) {
            vscode.window.showWarningMessage('No error found. Please select error text or check output panel.');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing error...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: 'Sending error to YawtAI...' });

                const explanation = await this.yawtAIService.explainError(
                    error.message,
                    error.stackTrace,
                    error.code
                );

                progress.report({ increment: 100, message: 'Complete!' });

                this.showResult('Error Explanation', explanation);
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to explain error: ${err}`);
            }
        });
    }

    async openSettings(): Promise<void> {
        const config = vscode.workspace.getConfiguration('yawtai');
        
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your YawtAI API Key',
            password: true,
            value: config.get('apiKey') as string || ''
        });

        if (apiKey !== undefined) {
            await config.update('apiKey', apiKey, true);
            await this.yawtAIService.updateApiKey(apiKey);
            vscode.window.showInformationMessage('YawtAI API key updated successfully!');
        }
    }

    private getContext(editor: vscode.TextEditor): string {
        const document = editor.document;
        const selection = editor.selection;
        
        let context = `File: ${document.fileName}\n`;
        context += `Language: ${document.languageId}\n`;
        
        if (!selection.isEmpty) {
            context += `Selected lines: ${selection.start.line + 1}-${selection.end.line + 1}\n`;
        }
        
        // Add surrounding context
        const startLine = Math.max(0, selection.start.line - 5);
        const endLine = Math.min(document.lineCount - 1, selection.end.line + 5);
        
        context += '\nSurrounding code:\n';
        for (let i = startLine; i <= endLine; i++) {
            const line = document.lineAt(i);
            const prefix = i >= selection.start.line && i <= selection.end.line ? '>>> ' : '    ';
            context += `${prefix}${line.text}\n`;
        }
        
        return context;
    }

    private async getErrorFromContext(): Promise<{ message: string; stackTrace?: string; code?: string } | null> {
        // Try to get error from active editor selection
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (!selection.isEmpty) {
                const selectedText = editor.document.getText(selection);
                if (this.looksLikeError(selectedText)) {
                    return { message: selectedText };
                }
            }
        }

        // Try to get from output channels
        const outputChannels = vscode.window.outputChannels;
        for (const channel of outputChannels) {
            if (channel.name.includes('Error') || channel.name.includes('Debug')) {
                // This is a simplified approach - in reality, you'd need to capture output
                return null;
            }
        }

        return null;
    }

    private looksLikeError(text: string): boolean {
        const errorPatterns = [
            /Error:/i,
            /Exception:/i,
            /TypeError:/i,
            /ReferenceError:/i,
            /SyntaxError:/i,
            /Cannot read property/,
            /undefined is not/,
            /null is not/
        ];

        return errorPatterns.some(pattern => pattern.test(text));
    }

    private async showResult(title: string, content: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });

        await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
    }

    private async showDiff(title: string, original: string, modified: string): Promise<void> {
        const originalDocument = await vscode.workspace.openTextDocument({
            content: original,
            language: 'text'
        });

        const modifiedDocument = await vscode.workspace.openTextDocument({
            content: modified,
            language: 'text'
        });

        await vscode.commands.executeCommand(
            'vscode.diff',
            originalDocument.uri,
            modifiedDocument.uri,
            title
        );
    }
}
