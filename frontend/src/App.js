import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { FiUser, FiSend, FiCopy, FiThumbsUp, FiThumbsDown, FiTrash2, FiSettings } from 'react-icons/fi';
import { IoIosChatbubbles } from 'react-icons/io';
import { RiRobot2Line } from 'react-icons/ri';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const examplePrompts = [
    "Explain quantum computing in simple terms",
    "Write a Python function to reverse a string",
    "Plan a 7-day trip to Japan",
    "Create a business plan for a coffee shop",
    "Help me debug this React component",
    "Write a poem about artificial intelligence",
  ];

  // Sample chat history
  const [chatHistory] = useState([
    { id: 1, title: 'Quantum Computing Basics', date: 'Today', icon: '🔬' },
    { id: 2, title: 'Japan Travel Itinerary', date: 'Yesterday', icon: '✈️' },
    { id: 3, title: 'Coffee Shop Business Plan', date: 'Jan 15', icon: '☕' },
    { id: 4, title: 'React Debugging Session', date: 'Jan 14', icon: '⚛️' },
    { id: 5, title: 'AI Poetry Collection', date: 'Jan 13', icon: '📝' },
  ]);

  // Load chat history on start
  const loadChatHistory = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/history/${sessionId}`);
      if (response.data.history) {
        setMessages(response.data.history);
      }
    } catch (error) {
      console.log('Starting new chat session');
    }
  }, [sessionId]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: input,
      is_user: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        session_id: sessionId
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);

      if (response.data && response.data.response) {
        const aiMessage = {
          id: Date.now() + 1,
          content: response.data.response,
          is_user: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      
      let errorText = "Hello! I'm your AI assistant powered by Groq. Let's chat!";
      
      if (error.code === 'ECONNABORTED') {
        errorText = "The request timed out. Please try again with a shorter message.";
      } else if (error.response && error.response.data && error.response.data.response) {
        errorText = error.response.data.response;
      } else if (error.message.includes('Network Error')) {
        errorText = "Cannot connect to the backend server. Make sure it's running on port 5000.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        content: errorText,
        is_user: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt) => {
    setInput(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear all messages?')) {
      try {
        await axios.post(`http://localhost:5000/api/clear/${sessionId}`);
        setMessages([]);
      } catch (error) {
        setMessages([]);
      }
    }
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <IoIosChatbubbles /> New Chat
        </button>
        
        <div className="conversations">
          <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Today
          </div>
          {chatHistory.map(chat => (
            <div key={chat.id} className="conversation-item">
              <span className="conversation-icon">{chat.icon}</span>
              <div className="conversation-content">
                <div className="conversation-title">{chat.title}</div>
                <div className="conversation-date">{chat.date}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div className="conversation-item">
            <span className="conversation-icon"><FiUser /></span>
            <div className="conversation-content">
              <div className="conversation-title">Guest User</div>
              <div className="conversation-date">Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="chat-title">
              <div className="title-icon">
                <RiRobot2Line />
              </div>
              <div className="title-text">
                <h2>AI Assistant</h2>
                <p>Powered by Groq (Llama 3.1 70B)</p>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="icon-button" onClick={handleClearChat} title="Clear chat">
              <FiTrash2 />
            </button>
            <button className="icon-button" title="Settings">
              <FiSettings />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <RiRobot2Line size={64} />
              </div>
              <h1 className="welcome-title">Hello! I'm your AI Assistant</h1>
              <p className="welcome-subtitle">
                Powered by Groq's Llama 3.1 70B model<br />
                Ask me anything - I'm here to help!
              </p>
              
              <div className="examples-grid">
                {examplePrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="example-card"
                    onClick={() => handleExampleClick(prompt)}
                  >
                    <div className="example-icon">
                      {['💡', '💻', '✈️', '📊', '🐛', '📝'][index]}
                    </div>
                    <p className="example-text">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.is_user ? 'user' : 'ai'}`}
              >
                <div className="message-avatar">
                  {message.is_user ? <FiUser /> : <RiRobot2Line />}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.is_user ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-text">
                    {message.content}
                  </div>
                  <div className="message-actions">
                    <button
                      className="action-button"
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <FiCopy /> Copy
                    </button>
                    {!message.is_user && (
                      <>
                        <button className="action-button">
                          <FiThumbsUp /> Like
                        </button>
                        <button className="action-button">
                          <FiThumbsDown /> Dislike
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="typing-indicator">
              <div className="message-avatar">
                <RiRobot2Line />
              </div>
              <div className="message-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-wrapper">
            <textarea
              className="chat-input"
              placeholder="Message AI Assistant..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows="1"
            />
            <div className="input-actions">
              <button
                className="send-button"
                type="submit"
                disabled={!input.trim() || isLoading}
                title="Send message"
              >
                <FiSend />
              </button>
            </div>
          </form>
          <div className="input-info">
            <div className="model-badge">
              Llama 3.1 70B • Groq Cloud
            </div>
            <div>
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="chat-footer">
          AI Assistant v2.0 • Powered by Groq Cloud • Responses may include inaccuracies
        </div>
      </div>
    </div>
  );
}

export default App;