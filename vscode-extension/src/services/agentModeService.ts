import * as vscode from 'vscode';
import { AgentMode } from './agentMode';
import { YawtAIService } from './yawtAIService';

export class AgentModeService {
    private agentMode: AgentMode;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, yawtAIService: YawtAIService) {
        this.context = context;
        this.agentMode = new AgentMode(context, yawtAIService);
    }

    async startAgentMode(prompt: string): Promise<void> {
        try {
            await this.agentMode.executeAgentPlan(prompt);
        } catch (error) {
            vscode.window.showErrorMessage(`Agent Mode failed: ${error}`);
        }
    }

    async toggleAgentMode(): Promise<void> {
        if (this.agentMode.isActive()) {
            this.agentMode.stop();
            vscode.window.showInformationMessage('Agent Mode stopped');
        } else {
            const prompt = await vscode.window.showInputBox({
                prompt: 'Enter your request for Agent Mode:',
                placeHolder: 'e.g., "Refactor the authentication system"',
                value: ''
            });

            if (prompt) {
                await this.startAgentMode(prompt);
            }
        }
    }

    isActive(): boolean {
        return this.agentMode.isActive();
    }

    getCurrentPlan(): any {
        return this.agentMode.getCurrentPlan();
    }

    dispose(): void {
        this.agentMode.dispose();
    }
}
