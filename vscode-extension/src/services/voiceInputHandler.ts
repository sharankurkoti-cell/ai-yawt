import * as vscode from 'vscode';

export class VoiceInputHandler {
    private mediaRecorder: MediaRecorder | undefined;
    private audioChunks: Blob[] = [];
    private isRecording: boolean = false;

    constructor() {}

    async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioBuffer = await this.blobToArrayBuffer(audioBlob);
                
                // Send to voice processing service
                const transcript = await this.processVoiceInput(audioBuffer);
                if (transcript) {
                    vscode.window.showInformationMessage(`Voice input: ${transcript}`);
                    // Insert transcribed text into active editor
                    await this.insertText(transcript);
                }
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            vscode.window.showInformationMessage('🎤 Recording... Press again to stop');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start recording: ${error}`);
        }
    }

    async stopRecording(): Promise<void> {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            vscode.window.showInformationMessage('🔇 Processing voice input...');
        }
    }

    toggleRecording(): void {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    private async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    private async processVoiceInput(audioBuffer: ArrayBuffer): Promise<string> {
        // This would integrate with a speech-to-text service
        // For now, return a placeholder
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Voice input transcribed text');
            }, 1000);
        });
    }

    private async insertText(text: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        await editor.edit((editBuilder: any) => {
            const position = editor.selection.active;
            editBuilder.insert(position, text);
        });
    }

    dispose(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    }
}
