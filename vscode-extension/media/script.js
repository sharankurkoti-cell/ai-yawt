(function() {
    const vscode = acquireVsCodeApi();
    let isRecording = false;

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        initializeEventListeners();
        focusInput();
    });

    function initializeEventListeners() {
        // Send button
        document.getElementById('sendBtn').addEventListener('click', sendMessage);
        
        // Input field
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', clearChat);
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', exportChat);
        
        // Voice button
        document.getElementById('voiceBtn').addEventListener('click', toggleVoiceRecording);
    }

    function focusInput() {
        document.getElementById('messageInput').focus();
    }

    function sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Send message to extension
        vscode.postMessage({
            command: 'sendMessage',
            text: message
        });

        focusInput();
    }

    function clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            vscode.postMessage({
                command: 'clearChat'
            });
        }
    }

    function exportChat() {
        vscode.postMessage({
            command: 'exportChat'
        });
    }

    function toggleVoiceRecording() {
        const voiceBtn = document.getElementById('voiceBtn');
        
        if (!isRecording) {
            isRecording = true;
            voiceBtn.textContent = '🔴 Stop';
            voiceBtn.classList.add('recording');
            updateStatus('🎤 Recording...');
            
            vscode.postMessage({
                command: 'voiceInput'
            });
        } else {
            isRecording = false;
            voiceBtn.textContent = '🎤 Voice';
            voiceBtn.classList.remove('recording');
            updateStatus('Processing voice...');
        }
    }

    // Handle messages from extension
    window.addEventListener('message', function(event) {
        const message = event.data;
        
        switch (message.command) {
            case 'updateMessages':
                document.getElementById('messages').innerHTML = message.messages;
                scrollToBottom();
                break;
                
            case 'updateStatus':
                updateStatus(message.status);
                break;
                
            case 'updateContextInfo':
                updateContextInfo(message.info);
                break;
        }
    });

    function updateStatus(status) {
        document.getElementById('status').textContent = status;
    }

    function updateContextInfo(info) {
        document.getElementById('context-info').textContent = info;
    }

    function scrollToBottom() {
        const messagesContainer = document.querySelector('.chat-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Auto-resize textarea
    document.getElementById('messageInput').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to clear chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearChat();
        }
        
        // Ctrl/Cmd + E to export chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportChat();
        }
        
        // Ctrl/Cmd + Shift + V for voice
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            toggleVoiceRecording();
        }
    });

    // Add copy functionality for code blocks
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'CODE' && e.target.parentElement.tagName === 'PRE') {
            const codeText = e.target.textContent;
            navigator.clipboard.writeText(codeText).then(() => {
                // Show copied indicator
                const originalText = e.target.textContent;
                e.target.textContent = 'Copied!';
                setTimeout(() => {
                    e.target.textContent = originalText;
                }, 1000);
            });
        }
    });

    // Add message formatting
    function formatMessage(content) {
        // Convert markdown-style formatting to HTML
        return content
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

    // Add typing indicator
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-header">
                <span class="avatar">🤖</span>
                <span class="role">YawtAI</span>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content">
                <div class="loading"></div> Thinking...
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Add message reactions
    function addMessageReactions(messageElement) {
        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'message-reactions';
        reactionsDiv.innerHTML = `
            <button class="reaction-btn" data-reaction="👍">👍</button>
            <button class="reaction-btn" data-reaction="👎">👎</button>
            <button class="reaction-btn" data-reaction="🔄">🔄</button>
            <button class="reaction-btn" data-reaction="📋">📋</button>
        `;
        
        reactionsDiv.addEventListener('click', function(e) {
            if (e.target.classList.contains('reaction-btn')) {
                const reaction = e.target.dataset.reaction;
                handleReaction(reaction, messageElement);
            }
        });
        
        messageElement.appendChild(reactionsDiv);
    }

    function handleReaction(reaction, messageElement) {
        switch (reaction) {
            case '👍':
            case '👎':
                // Send feedback to extension
                vscode.postMessage({
                    command: 'feedback',
                    type: reaction === '👍' ? 'positive' : 'negative',
                    messageId: messageElement.dataset.messageId
                });
                break;
                
            case '🔄':
                // Regenerate response
                vscode.postMessage({
                    command: 'regenerate',
                    messageId: messageElement.dataset.messageId
                });
                break;
                
            case '📋':
                // Copy message content
                const content = messageElement.querySelector('.message-content').textContent;
                navigator.clipboard.writeText(content);
                break;
        }
    }

    // Add search functionality
    function addSearch() {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'search-container';
        searchDiv.innerHTML = `
            <input type="text" id="searchInput" placeholder="Search messages..." />
            <button id="searchBtn">🔍</button>
        `;
        
        document.querySelector('.header').appendChild(searchDiv);
        
        document.getElementById('searchBtn').addEventListener('click', performSearch);
        document.getElementById('searchInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (!searchTerm) return;

        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const content = message.querySelector('.message-content').textContent.toLowerCase();
            if (content.includes(searchTerm)) {
                message.classList.add('search-highlight');
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                message.classList.remove('search-highlight');
            }
        });
    }

    // Initialize additional features
    setTimeout(() => {
        addSearch();
        updateStatus('Ready');
    }, 100);
})();
