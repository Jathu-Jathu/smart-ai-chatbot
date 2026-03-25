import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, onCopy, onLike, onDislike }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-bubble ${message.is_user ? 'user' : 'ai'}`}
    >
      <div className={`message-avatar ${message.is_user ? 'user' : 'ai'}`}>
        {message.is_user ? '👤' : '🤖'}
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
        <motion.div 
          className="message-text"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {message.content}
        </motion.div>
        <div className="message-actions">
          <motion.button 
            className="action-btn"
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </motion.button>
          {!message.is_user && (
            <>
              <motion.button 
                className="action-btn"
                onClick={onLike}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👍 Like
              </motion.button>
              <motion.button 
                className="action-btn"
                onClick={onDislike}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                👎 Dislike
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;


