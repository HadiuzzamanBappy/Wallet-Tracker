import { useState, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { parseTransaction, formatTransactionMessage, getCategoryEmoji } from '../../utils/transactionParser';
import { addTransaction, getUserProfile } from '../../services/transactionService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, userProfile, setUserProfile } = useAuth();

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hi ${userProfile?.displayName || 'there'}! 👋\n\nI'm your smart financial assistant with enhanced NLP! I can understand natural language and automatically detect income vs expenses.\n\n💸 Expense Examples:\n• "I bought groceries for 500 taka"\n• "Paid electricity bill 2000 BDT"\n• "Spent 350 on movie tickets"\n• "Ordered food delivery for 800"\n\n💰 Income Examples:\n• "Received monthly salary 50000"\n• "Got paid 3000 for freelance work"\n• "Earned bonus 5000 from company"\n• "Sold old laptop for 25000"\n\nJust type naturally - I'll understand! 🤖`
        }
      ]);
    }
  }, [isOpen, messages.length, userProfile]);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Parse the transaction
    const parseResult = parseTransaction(message);
    
    let botResponse;
    
    if (parseResult.success) {
      // Try to add transaction to Firebase
      const addResult = await addTransaction(user.uid, parseResult.data);
      
      if (addResult.success) {
        // Refresh user profile from Firebase to get updated balance
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }

        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: formatTransactionMessage(parseResult.data) + `\n\n💳 New Balance: ${profileResult.success ? profileResult.data.balance : 'Loading...'} BDT`,
          transaction: parseResult.data
        };
      } else {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: `❌ Failed to save transaction: ${addResult.error}\n\nPlease try again.`
        };
      }
    } else {
      botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: `❌ ${parseResult.error}\n\n💡 Try these natural language examples:\n\n💸 For Expenses:\n• "I bought groceries for 500 taka"\n• "Paid the rent 15000 today"\n• "Spent 200 on transportation"\n\n💰 For Income:\n• "Received my salary 45000"\n• "Got freelance payment 3000"\n• "Earned from tutoring 2000"\n\nJust describe it naturally - I'll figure out the details! 😊`
      };
    }

    setMessages(prev => [...prev, botResponse]);
    setMessage('');
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 sm:w-96 h-80 sm:h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50 max-w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-semibold text-sm sm:text-base truncate">Wallet Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200 transition-colors p-1 flex-shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs p-2 sm:p-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-1 sm:gap-2">
                {msg.type === 'bot' && <Bot className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />}
                {msg.type === 'user' && <User className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />}
                <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
              </div>
              {msg.transaction && (
                <div className="mt-1 sm:mt-2 text-xs opacity-80">
                  {getCategoryEmoji(msg.transaction.category)} {msg.transaction.category}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <div className="text-sm">Processing...</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your transaction..."
            className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;