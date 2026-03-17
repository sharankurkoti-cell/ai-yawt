import * as vscode from 'vscode';
import { YawtAIService } from './yawtAIService';
import { ContextAnalyzer } from './contextAnalyzer';

export interface AgentTask {
    id: string;
    type: 'edit' | 'create' | 'delete' | 'refactor' | 'test' | 'debug' | 'search' | 'explain';
    status: 'pending' | 'running' | 'completed' | 'failed';
    description: string;
    files: string[];
    plan?: string[];
    progress?: number;
    result?: any;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

export interface AgentPlan {
    id: string;
    description: string;
    tasks: AgentTask[];
    estimatedTime: number;
    status: 'planning' | 'executing' | 'completed' | 'failed';
}

export class AgentMode {
    private activePlan: AgentPlan | null = null;
    private taskQueue: AgentTask[] = [];
    private isRunning: boolean = false;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;

    constructor(
        private context: vscode.ExtensionContext,
        private yawtAIService: YawtAIService,
        private contextAnalyzer: ContextAnalyzer
    ) {
        this.outputChannel = vscode.window.createOutputChannel('YawtAI Agent Mode');
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.text = '$(robot) Agent Mode';
        this.statusBarItem.tooltip = 'YawtAI Agent Mode';
        this.statusBarItem.command = 'yawtai.toggleAgentMode';
        this.statusBarItem.show();
    }

    async executeAgentPlan(prompt: string): Promise<AgentPlan> {
        try {
            this.outputChannel.show();
            this.outputChannel.appendLine('🤖 Starting Agent Mode execution...');
            this.outputChannel.appendLine(`📝 Prompt: ${prompt}`);

            // Create plan using AI
            const plan = await this.createPlan(prompt);
            this.activePlan = plan;
            this.isRunning = true;
            this.updateStatus('Planning');

            // Display plan to user
            await this.displayPlan(plan);

            // Execute tasks
            this.updateStatus('Executing');
            for (const task of plan.tasks) {
                await this.executeTask(task);
            }

            // Complete plan
            plan.status = 'completed';
            plan.completedAt = new Date();
            this.isRunning = false;
            this.updateStatus('Completed');

            // Show summary
            await this.displayPlanSummary(plan);

            return plan;
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error: ${error}`);
            this.isRunning = false;
            this.updateStatus('Error');
            throw error;
        }
    }

    private async createPlan(prompt: string): Promise<AgentPlan> {
        const context = await this.contextAnalyzer.getProjectContext();
        
        const systemPrompt = `You are an expert AI software engineer with deep understanding of complex codebases.
        
        Your task is to break down the following request into specific, actionable steps:
        
        Request: ${prompt}
        
        Current Context:
        ${context}
        
        Guidelines:
        - Break down complex tasks into smaller, manageable steps
        - Each step should be specific and actionable
        - Include file paths and line numbers where relevant
        - Consider dependencies and potential side effects
        - Provide estimated time for each step
        - Identify potential risks or challenges
        
        Format your response as JSON with this structure:
        {
            "description": "Brief description of the overall plan",
            "tasks": [
                {
                    "id": "task_1",
                    "type": "edit|create|delete|refactor|test|debug|search|explain",
                    "description": "What to do",
                    "files": ["file1.js", "file2.ts"],
                    "plan": ["step 1", "step 2"],
                    "estimatedTime": 5
                }
            ],
            "estimatedTime": 30
        }`;

        const response = await this.yawtAIService.sendChatMessage([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]);

        try {
            const planData = JSON.parse(response.content);
            return {
                id: this.generateId(),
                description: planData.description || 'Agent execution plan',
                tasks: planData.tasks || [],
                estimatedTime: planData.estimatedTime || 30,
                status: 'planning'
            };
        } catch (error) {
            // Fallback plan
            return {
                id: this.generateId(),
                description: 'Execute complex task with AI assistance',
                tasks: [
                    {
                        id: 'task_1',
                        type: 'edit',
                        description: prompt,
                        files: [],
                        plan: ['Analyze request', 'Execute task'],
                        estimatedTime: 10
                    }
                ],
                estimatedTime: 10,
                status: 'planning'
            };
        }
    }

    private async executeTask(task: AgentTask): Promise<void> {
        task.status = 'running';
        task.startedAt = new Date();
        
        this.outputChannel.appendLine(`\n🔄 Executing: ${task.description}`);
        this.outputChannel.appendLine(`📁 Files: ${task.files.join(', ') || 'None'}`);

        try {
            switch (task.type) {
                case 'edit':
                    await this.executeEditTask(task);
                    break;
                case 'create':
                    await this.executeCreateTask(task);
                    break;
                case 'delete':
                    await this.executeDeleteTask(task);
                    break;
                case 'refactor':
                    await this.executeRefactorTask(task);
                    break;
                case 'test':
                    await this.executeTestTask(task);
                    break;
                case 'debug':
                    await this.executeDebugTask(task);
                    break;
                case 'search':
                    await this.executeSearchTask(task);
                    break;
                case 'explain':
                    await this.executeExplainTask(task);
                    break;
            }

            task.status = 'completed';
            task.completedAt = new Date();
            this.outputChannel.appendLine(`✅ Completed: ${task.description}`);
        } catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Failed: ${task.error}`);
        }
    }

    private async executeEditTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const document = await vscode.workspace.openTextDocument(filePath);
            const editor = await vscode.window.showTextDocument(document);
            
            // Generate edit using AI
            const edit = await this.yawtAIService.analyzeCode({
                code: document.getText(),
                language: document.languageId,
                action: 'refactor',
                context: task.description
            });

            // Apply edit
            await editor.edit((editBuilder) => {
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.lineCount - 1)
                );
                editBuilder.replace(fullRange, edit);
            });
        }
    }

    private async executeCreateTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const content = await this.yawtAIService.generateCodeFromPrompt({
                prompt: task.description,
                language: this.getLanguageFromPath(filePath),
                context: await this.contextAnalyzer.getContext(
                    await vscode.workspace.openTextDocument(filePath)
                )
            });

            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.writeFile(uri, content);
            this.outputChannel.appendLine(`📝 Created: ${filePath}`);
        }
    }

    private async executeDeleteTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            try {
                await vscode.workspace.fs.delete(vscode.Uri.file(filePath));
                this.outputChannel.appendLine(`🗑️ Deleted: ${filePath}`);
            } catch (error) {
                this.outputChannel.appendLine(`❌ Failed to delete ${filePath}: ${error}`);
            }
        }
    }

    private async executeRefactorTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const document = await vscode.workspace.openTextDocument(filePath);
            const refactorCode = await this.yawtAIService.analyzeCode({
                code: document.getText(),
                language: document.languageId,
                action: 'refactor',
                context: task.description
            });

            const editor = await vscode.window.showTextDocument(document);
            await editor.edit((editBuilder) => {
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.lineCount - 1)
                );
                editBuilder.replace(fullRange, refactorCode);
            });
        }
    }

    private async executeTestTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const document = await vscode.workspace.openTextDocument(filePath);
            const testCode = await this.yawtAIService.analyzeCode({
                code: document.getText(),
                language: document.languageId,
                action: 'test',
                context: task.description
            });

            const testFileName = filePath.replace(/\.[^.]+$/, '.test.$&1');
            const testUri = vscode.Uri.file(testFileName);
            await vscode.workspace.fs.writeFile(testUri, testCode);
            this.outputChannel.appendLine(`🧪 Created test: ${testFileName}`);
        }
    }

    private async executeDebugTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const document = await vscode.workspace.openTextDocument(filePath);
            const debugAnalysis = await this.yawtAIService.explainError(
                'Debug analysis needed',
                document.getText(),
                document.getText()
            );

            this.outputChannel.appendLine(`🐛 Debug Analysis for ${filePath}:`);
            this.outputChannel.appendLine(debugAnalysis);
        }
    }

    private async executeSearchTask(task: AgentTask): Promise<void> {
        const searchResults = await this.yawtAIService.searchRepository({
            query: task.description,
            repositoryPath: vscode.workspace.rootPath || '',
            maxResults: 10
        });

        this.outputChannel.appendLine(`🔍 Search Results for "${task.description}":`);
        for (const result of searchResults) {
            this.outputChannel.appendLine(`  📄 ${result.filePath}:${result.lineNumber} - ${result.match}`);
        }
    }

    private async executeExplainTask(task: AgentTask): Promise<void> {
        for (const filePath of task.files) {
            const document = await vscode.workspace.openTextDocument(filePath);
            const explanation = await this.yawtAIService.analyzeCode({
                code: document.getText(),
                language: document.languageId,
                action: 'explain',
                context: task.description
            });

            this.outputChannel.appendLine(`💡 Explanation for ${filePath}:`);
            this.outputChannel.appendLine(explanation);
        }
    }

    private async displayPlan(plan: AgentPlan): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'agentPlan',
            'Agent Execution Plan',
            vscode.ViewColumn.One,
            {},
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = await this.getPlanWebviewContent(plan);
        panel.onDidDispose(() => {
            this.outputChannel.appendLine('Plan panel closed');
        });
    }

    private async getPlanWebviewContent(plan: AgentPlan): Promise<string> {
        const tasksHtml = plan.tasks.map(task => `
            <div class="task ${task.status}">
                <div class="task-header">
                    <span class="task-type">${task.type}</span>
                    <span class="task-description">${task.description}</span>
                    <span class="task-status">${task.status}</span>
                </div>
                <div class="task-details">
                    <div class="task-files">📁 ${task.files.join(', ') || 'No files'}</div>
                    <div class="task-plan">📋 ${task.plan?.join(' → ') || 'No plan'}</div>
                    <div class="task-time">⏱️ ${task.estimatedTime}min</div>
                </div>
            </div>
        `).join('');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: var(--vscode-font-family); margin: 0; padding: 20px; background: var(--vscode-editor-background); }
                .plan-container { max-width: 800px; margin: 0 auto; }
                .plan-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: var(--vscode-editor-foreground); }
                .plan-description { margin-bottom: 10px; color: var(--vscode-descriptionForeground); }
                .tasks { background: var(--vscode-editor-background); border-radius: 8px; padding: 15px; }
                .task { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 10px; margin-bottom: 10px; }
                .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .task-type { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 8px; border-radius: 3px; font-size: 12px; }
                .task-status { padding: 2px 8px; border-radius: 3px; font-size: 12px; }
                .task-completed { background: #28a745; color: white; }
                .task-running { background: #007acc; color: white; }
                .task-failed { background: #f14c4c; color: white; }
                .task-pending { background: #ffc107; color: black; }
                .task-description { font-weight: 500; margin-bottom: 5px; }
                .task-details { font-size: 12px; opacity: 0.8; }
                .task-time { color: var(--vscode-descriptionForeground); }
                .plan-summary { margin-top: 20px; padding: 15px; background: var(--vscode-input-background); border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="plan-container">
                <div class="plan-header">
                    🤖 Agent Execution Plan
                </div>
                <div class="plan-description">
                    ${plan.description}
                </div>
                <div class="tasks">
                    ${tasksHtml}
                </div>
                <div class="plan-summary">
                    <strong>Estimated Time:</strong> ${plan.estimatedTime} minutes<br>
                    <strong>Status:</strong> ${plan.status}
                </div>
            </div>
        </body>
        </html>`;
    }

    private async displayPlanSummary(plan: AgentPlan): Promise<void> {
        const completedTasks = plan.tasks.filter(t => t.status === 'completed');
        const failedTasks = plan.tasks.filter(t => t.status === 'failed');
        
        let summary = `🎯 Plan Execution Summary\n`;
        summary += `✅ Completed: ${completedTasks.length}\n`;
        summary += `❌ Failed: ${failedTasks.length}\n`;
        summary += `⏱️ Total Time: ${Date.now() - (plan.startedAt?.getTime() || Date.now())}ms\n`;
        
        if (failedTasks.length > 0) {
            summary += `\n🚨 Failed Tasks:\n`;
            failedTasks.forEach(task => {
                summary += `  - ${task.description}: ${task.error}\n`;
            });
        }

        this.outputChannel.appendLine(summary);
        
        // Show notification
        vscode.window.showInformationMessage(
            `Agent plan completed: ${completedTasks.length}/${plan.tasks.length} tasks successful`
        );
    }

    private updateStatus(status: string): void {
        this.statusBarItem.text = `$(robot) Agent: ${status}`;
        this.statusBarItem.tooltip = `YawtAI Agent Mode - ${status}`;
        this.statusBarItem.backgroundColor = this.getStatusColor(status);
    }

    private getStatusColor(status: string): string {
        switch (status) {
            case 'Planning': return '#ffa500';
            case 'Executing': return '#007acc';
            case 'Completed': return '#28a745';
            case 'Error': return '#f14c4c';
            default: return undefined;
        }
    }

    private getLanguageFromPath(filePath: string): string {
        const ext = filePath.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'ts': 'typescript',
            'jsx': 'javascript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'h': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'rb': 'ruby',
            'swift': 'swift',
            'kt': 'kotlin'
        };
        return languageMap[ext || ''] || 'text';
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    isActive(): boolean {
        return this.isRunning;
    }

    getCurrentPlan(): AgentPlan | null {
        return this.activePlan;
    }

    stop(): void {
        if (this.isRunning) {
            this.isRunning = false;
            this.updateStatus('Stopped');
            this.outputChannel.appendLine('⏹️ Agent execution stopped');
        }
    }

    dispose(): void {
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
    }
}
