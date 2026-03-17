import * as vscode from 'vscode';
import { YawtAIService, SecurityScanResult } from './yawtAIService';

export interface SecurityRule {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    patterns: RegExp[];
    language: string[];
    recommendation: string;
}

export class SecurityScanner {
    private rules: SecurityRule[] = [
        // SQL Injection
        {
            id: 'sql-injection',
            name: 'SQL Injection',
            description: 'Potential SQL injection vulnerability',
            severity: 'critical',
            patterns: [
                /execute\s*\(\s*['"`][^'"`]*\+.*['"`]/gi,
                /query\s*\(\s*['"`][^'"`]*\+.*['"`]/gi,
                /\$\{.*\}.*\b(SELECT|INSERT|UPDATE|DELETE)\b/gi
            ],
            language: ['javascript', 'typescript', 'php', 'python'],
            recommendation: 'Use parameterized queries or prepared statements to prevent SQL injection'
        },
        // XSS
        {
            id: 'xss',
            name: 'Cross-Site Scripting (XSS)',
            description: 'Potential XSS vulnerability',
            severity: 'high',
            patterns: [
                /innerHTML\s*=\s*.*\+/gi,
                /document\.write\s*\(\s*.*\+/gi,
                /dangerouslySetInnerHTML/gi
            ],
            language: ['javascript', 'typescript'],
            recommendation: 'Sanitize user input before rendering HTML'
        },
        // Hardcoded secrets
        {
            id: 'hardcoded-secrets',
            name: 'Hardcoded Secrets',
            description: 'Hardcoded passwords, API keys, or other secrets',
            severity: 'high',
            patterns: [
                /password\s*=\s*['"`][^'"`]{4,}['"`]/gi,
                /api[_-]?key\s*=\s*['"`][^'"`]{10,}['"`]/gi,
                /secret[_-]?key\s*=\s*['"`][^'"`]{10,}['"`]/gi,
                /token\s*=\s*['"`][^'"`]{10,}['"`]/gi
            ],
            language: ['javascript', 'typescript', 'python', 'java', 'go', 'rust'],
            recommendation: 'Use environment variables or secure secret management'
        },
        // Insecure crypto
        {
            id: 'insecure-crypto',
            name: 'Insecure Cryptographic Algorithm',
            description: 'Use of weak cryptographic algorithms',
            severity: 'medium',
            patterns: [
                /md5\s*\(/gi,
                /sha1\s*\(/gi,
                /DES\s*\(/gi,
                /RC4\s*\(/gi
            ],
            language: ['javascript', 'typescript', 'python', 'java'],
            recommendation: 'Use strong cryptographic algorithms like SHA-256 or bcrypt'
        },
        // Path traversal
        {
            id: 'path-traversal',
            name: 'Path Traversal',
            description: 'Potential path traversal vulnerability',
            severity: 'high',
            patterns: [
                /\.\.\/\//gi,
                /\.\.\\/gi,
                /readFile\s*\(\s*.*\+/gi,
                /open\s*\(\s*.*\+/gi
            ],
            language: ['javascript', 'typescript', 'python', 'php'],
            recommendation: 'Validate and sanitize file paths'
        },
        // Command injection
        {
            id: 'command-injection',
            name: 'Command Injection',
            description: 'Potential command injection vulnerability',
            severity: 'critical',
            patterns: [
                /exec\s*\(\s*.*\+/gi,
                /system\s*\(\s*.*\+/gi,
                /eval\s*\(\s*.*\+/gi,
                /spawn\s*\(\s*.*\+/gi
            ],
            language: ['javascript', 'typescript', 'python', 'php'],
            recommendation: 'Avoid executing user input directly. Use safe alternatives.'
        },
        // Insecure HTTP
        {
            id: 'insecure-http',
            name: 'Insecure HTTP Communication',
            description: 'Use of HTTP instead of HTTPS',
            severity: 'medium',
            patterns: [
                /http:\/\/[^localhost]/gi,
                /ws:\/\//gi
            ],
            language: ['javascript', 'typescript', 'python', 'java'],
            recommendation: 'Use HTTPS for all communication'
        },
        // Weak random
        {
            id: 'weak-random',
            name: 'Weak Random Number Generation',
            description: 'Use of weak random number generation',
            severity: 'medium',
            patterns: [
                /Math\.random\s*\(\s*\)/gi,
                /rand\s*\(\s*\)/gi
            ],
            language: ['javascript', 'typescript', 'python', 'c', 'cpp'],
            recommendation: 'Use cryptographically secure random number generators'
        }
    ];

    constructor(private yawtAIService?: YawtAIService) {}

    async scanDocument(document: vscode.TextDocument, diagnosticsCollection: vscode.DiagnosticCollection): Promise<void> {
        const text = document.getText();
        const language = document.languageId;
        const diagnostics: vscode.Diagnostic[] = [];

        // Static rule-based scanning
        for (const rule of this.rules) {
            if (!rule.language.includes(language)) continue;

            for (const pattern of rule.patterns) {
                let match;
                while ((match = pattern.exec(text)) !== null) {
                    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
                    const line = document.lineAt(lineIndex);
                    const startChar = match.index - text.substring(0, match.index).lastIndexOf('\n') - 1;
                    const endChar = startChar + match[0].length;

                    const range = new vscode.Range(
                        new vscode.Position(lineIndex, startChar),
                        new vscode.Position(lineIndex, endChar)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `${rule.name}: ${rule.description}`,
                        this.getSeverity(rule.severity)
                    );

                    diagnostic.source = 'YawtAI Security';
                    diagnostic.code = rule.id;
                    diagnostic.message = `${rule.description}\n\nRecommendation: ${rule.recommendation}`;

                    diagnostics.push(diagnostic);
                }
            }
        }

        // AI-powered security scanning if service is available
        if (this.yawtAIService && this.yawtAIService.isConfigured()) {
            try {
                const aiResult = await this.yawtAIService.scanSecurity(text, language);
                
                for (const vulnerability of aiResult.vulnerabilities) {
                    const line = document.lineAt(vulnerability.line);
                    const range = new vscode.Range(
                        new vscode.Position(vulnerability.line, 0),
                        new vscode.Position(vulnerability.line, line.text.length)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `AI Detected: ${vulnerability.type}`,
                        this.getSeverity(vulnerability.severity)
                    );

                    diagnostic.source = 'YawtAI AI Security';
                    diagnostic.message = `${vulnerability.description}\n\nRecommendation: ${vulnerability.recommendation}`;

                    diagnostics.push(diagnostic);
                }
            } catch (error) {
                console.error('AI security scan failed:', error);
            }
        }

        diagnosticsCollection.set(document.uri, diagnostics);
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical':
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }

    async scanWorkspace(): Promise<SecurityScanResult> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { vulnerabilities: [], score: 100 };
        }

        const allVulnerabilities: any[] = [];
        let totalScore = 100;

        for (const folder of workspaceFolders) {
            const files = await vscode.workspace.findFiles(
                new vscode.RelativePattern(folder, '**/*.{js,ts,jsx,tsx,py,java,go,rs,php}'),
                '**/node_modules/**'
            );

            for (const file of files) {
                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    const text = document.getText();
                    
                    if (this.yawtAIService && this.yawtAIService.isConfigured()) {
                        const result = await this.yawtAIService.scanSecurity(text, document.languageId);
                        allVulnerabilities.push(...result.vulnerabilities);
                        totalScore = Math.min(totalScore, result.score);
                    }
                } catch (error) {
                    console.error(`Failed to scan file ${file.fsPath}:`, error);
                }
            }
        }

        return {
            vulnerabilities: allVulnerabilities,
            score: totalScore
        };
    }

    async fixSecurityIssue(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): Promise<boolean> {
        const rule = this.rules.find(r => r.id === diagnostic.code);
        if (!rule) {
            return false;
        }

        const editor = await vscode.window.showTextDocument(document);
        const range = diagnostic.range;

        try {
            await editor.edit((editBuilder: any) => {
                switch (rule.id) {
                    case 'insecure-http':
                        // Replace http:// with https://
                        const text = document.getText(range);
                        const fixedText = text.replace('http://', 'https://');
                        editBuilder.replace(range, fixedText);
                        break;
                    
                    case 'hardcoded-secrets':
                        // Replace hardcoded secret with environment variable
                        const secretText = document.getText(range);
                        const varName = this.extractSecretVariableName(secretText);
                        const envVar = `process.env.${varName}`;
                        editBuilder.replace(range, envVar);
                        break;
                    
                    case 'weak-random':
                        // Replace Math.random with crypto.randomBytes
                        const weakRandom = document.getText(range);
                        const secureRandom = this.generateSecureRandom(document.languageId);
                        editBuilder.replace(range, secureRandom);
                        break;
                    
                    default:
                        vscode.window.showInformationMessage(
                            `Manual fix required for ${rule.name}. See recommendations.`
                        );
                        return false;
                }
            });

            vscode.window.showInformationMessage(`Security issue fixed: ${rule.name}`);
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fix security issue: ${error}`);
            return false;
        }
    }

    private extractSecretVariableName(text: string): string {
        const match = text.match(/(\w+)\s*=\s*['"`]/);
        return match ? match[1].toUpperCase() : 'SECRET';
    }

    private generateSecureRandom(language: string): string {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return 'crypto.randomBytes(32).toString(\'hex\')';
            case 'python':
                return 'secrets.token_hex(32)';
            case 'java':
                return 'SecureRandom.getInstanceStrong().nextLong()';
            default:
                return 'Math.random()'; // Fallback
        }
    }

    addCustomRule(rule: SecurityRule): void {
        this.rules.push(rule);
    }

    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }

    getRules(): SecurityRule[] {
        return [...this.rules];
    }

    dispose(): void {
        // Cleanup if needed
    }
}
