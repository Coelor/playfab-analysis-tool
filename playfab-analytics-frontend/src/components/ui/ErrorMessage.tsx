import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  type = 'error' 
}) => {
  return (
    <div className={`error-message error-message--${type}`}>
      <div className="error-content">
        <div className="error-text">{message}</div>
        {onRetry && (
          <button onClick={onRetry} className="error-retry-button">
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;