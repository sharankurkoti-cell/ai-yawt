import * as vscode from 'vscode';
import { YawtAIProvider } from './providers/yawtAIProvider';
import { YawtAIChatProvider } from './providers/yawtAIChatProvider';
import { YawtAICompletionProvider } from './providers/yawtAICompletionProvider';
import { YawtAIService } from './services/yawtAIService';
import { ContextAnalyzer } from './services/contextAnalyzer';
import { SecurityScanner } from './services/securityScanner';
import { VoiceInputHandler } from './services/voiceInputHandler';
import { AgentModeService } from './services/agentModeService';

let yawtAIProvider: YawtAIProvider;
let chatProvider: YawtAIChatProvider;
let completionProvider: YawtAICompletionProvider;
let yawtAIService: YawtAIService;
let contextAnalyzer: ContextAnalyzer;
let securityScanner: SecurityScanner;
let voiceInputHandler: VoiceInputHandler;
let agentModeService: AgentModeService;

export function activate(context: vscode.ExtensionContext) {
    console.log('YawtAI extension is now active!');

    // Initialize services
    yawtAIService = new YawtAIService();
    contextAnalyzer = new ContextAnalyzer();
    securityScanner = new SecurityScanner();
    voiceInputHandler = new VoiceInputHandler();
    agentModeService = new AgentModeService(context, yawtAIService);

    // Register providers
    yawtAIProvider = new YawtAIProvider(context, yawtAIService);
    chatProvider = new YawtAIChatProvider(context, yawtAIService);
    completionProvider = new YawtAICompletionProvider(context, yawtAIService, contextAnalyzer);

    // Register completion provider
    const completionDisposable = vscode.languages.registerCompletionItemProvider(
        { pattern: '**' },
        completionProvider,
        '.', ' ', '(', '[', '{', '"', "'"
    );

    // Register inline completion provider
    const inlineCompletionDisposable = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        completionProvider
    );

    // Register code actions provider
    const codeActionDisposable = vscode.languages.registerCodeActionsProvider(
        { pattern: '**' },
        yawtAIProvider
    );

    // Register hover provider
    const hoverDisposable = vscode.languages.registerHoverProvider(
        { pattern: '**' },
        yawtAIProvider
    );

    // Register commands
    const commands = [
        vscode.commands.registerCommand('yawtai.explainCode', () => yawtAIProvider.explainCode()),
        vscode.commands.registerCommand('yawtai.fixCode', () => yawtAIProvider.fixCode()),
        vscode.commands.registerCommand('yawtai.optimizeCode', () => yawtAIProvider.optimizeCode()),
        vscode.commands.registerCommand('yawtai.generateTests', () => yawtAIProvider.generateTests()),
        vscode.commands.registerCommand('yawtai.documentCode', () => yawtAIProvider.documentCode()),
        vscode.commands.registerCommand('yawtai.refactorCode', () => yawtAIProvider.refactorCode()),
        vscode.commands.registerCommand('yawtai.openChat', () => chatProvider.show()),
        vscode.commands.registerCommand('yawtai.clearChat', () => chatProvider.clearChat()),
        vscode.commands.registerCommand('yawtai.exportChat', () => chatProvider.exportChat()),
        vscode.commands.registerCommand('yawtai.startVoiceInput', () => voiceInputHandler.startRecording()),
        vscode.commands.registerCommand('yawtai.stopVoiceInput', () => voiceInputHandler.stopRecording()),
        vscode.commands.registerCommand('yawtai.toggleAutoCompletion', () => completionProvider.toggleAutoCompletion()),
        vscode.commands.registerCommand('yawtai.triggerCompletion', () => completionProvider.triggerCompletion()),
        vscode.commands.registerCommand('yawtai.scanSecurity', () => securityScanner.scanCurrentFile()),
        vscode.commands.registerCommand('yawtai.startAgentMode', () => agentModeService.startAgentMode('')),
        vscode.commands.registerCommand('yawtai.toggleAgentMode', () => agentModeService.toggleAgentMode()),
        vscode.commands.registerCommand('yawtai.explainError', () => yawtAIProvider.explainError()),
        vscode.commands.registerCommand('yawtai.openYawtAISettings', () => vscode.env.openExternal(vscode.Uri.parse('https://example.com/yawtai-settings')))
    ];

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(robot) YawtAI';
    statusBarItem.tooltip = 'YawtAI - Your AI Software Engineer';
    statusBarItem.command = 'yawtai.openChat';
    statusBarItem.show();

    // Register diagnostics collection for security issues
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('yawtai-security');

    // Set up event listeners
    const changeDocumentDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (vscode.workspace.getConfiguration('yawtai').get('enableSecurityScan')) {
            await securityScanner.scanDocument(event.document, diagnosticsCollection);
        }
        
        // Update context for completion provider
        await contextAnalyzer.updateContext(event.document);
    });

    const openDocumentDisposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
        await contextAnalyzer.updateContext(document);
    });

    const saveDocumentDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (vscode.workspace.getConfiguration('yawtai').get('enableSecurityScan')) {
            await securityScanner.scanDocument(document, diagnosticsCollection);
        }
    });

    // Add all disposables to context
    context.subscriptions.push(...commands, completionDisposable, hoverDisposable, statusBarItem, diagnosticsCollection);
    
    // Dispose services on deactivation
    context.subscriptions.push({
        dispose: () => {
            yawtAIProvider.dispose();
            chatProvider.dispose();
            completionProvider.dispose();
            yawtAIService.dispose();
            contextAnalyzer.dispose();
            securityScanner.dispose();
            voiceInputHandler.dispose();
            agentModeService.dispose();
        }
    });

    // Initialize chat view
    vscode.commands.executeCommand('setContext', 'yawtai.chatVisible', true);
}

export function deactivate() {
    console.log('YawtAI extension deactivated');
}
