import nlp from 'compromise';

// Enhanced category keywords with better detection
const categoryKeywords = {
  food: {
    keywords: ['food', 'restaurant', 'grocery', 'groceries', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'ate', 'eat', 'pizza', 'burger', 'rice', 'chicken', 'vegetable', 'fruit', 'apple', 'banana', 'coffee', 'tea', 'cake', 'bread', 'milk', 'fish', 'meat', 'cooking', 'kitchen', 'recipe', 'dish', 'cuisine', 'menu', 'cafe', 'bistro', 'dine', 'feed'],
    verbs: ['ate', 'eat', 'dine', 'feed', 'cook', 'order']
  },
  transport: {
    keywords: ['transport', 'uber', 'taxi', 'bus', 'train', 'rickshaw', 'fuel', 'petrol', 'gas', 'parking', 'toll', 'ride', 'car', 'bike', 'motorcycle', 'aviation', 'flight', 'airline', 'metro', 'subway', 'ferry', 'boat', 'ship'],
    verbs: ['drive', 'ride', 'travel', 'commute', 'fly']
  },
  entertainment: {
    keywords: ['movie', 'cinema', 'game', 'gaming', 'concert', 'show', 'netflix', 'spotify', 'entertainment', 'fun', 'party', 'music', 'tv', 'theater', 'sports', 'club', 'bar', 'pub', 'disco', 'festival', 'event'],
    verbs: ['watch', 'play', 'enjoy', 'attend', 'celebrate']
  },
  shopping: {
    keywords: ['shopping', 'clothes', 'shirt', 'shoes', 'dress', 'mall', 'online', 'amazon', 'flipkart', 'fashion', 'buy', 'bought', 'store', 'shop', 'market', 'purchase', 'retail', 'brand', 'item', 'product'],
    verbs: ['buy', 'bought', 'purchase', 'shop', 'order']
  },
  bills: {
    keywords: ['bill', 'electricity', 'water', 'internet', 'wifi', 'phone', 'mobile', 'rent', 'utility', 'subscription', 'insurance', 'loan', 'mortgage', 'tax', 'fine', 'penalty', 'fee', 'charge'],
    verbs: ['pay', 'paid', 'owe', 'charge']
  },
  health: {
    keywords: ['doctor', 'medicine', 'hospital', 'pharmacy', 'medical', 'health', 'clinic', 'checkup', 'treatment', 'surgery', 'therapy', 'dentist', 'nurse', 'patient', 'diagnosis', 'prescription'],
    verbs: ['visit', 'consult', 'treat', 'heal', 'cure']
  },
  education: {
    keywords: ['book', 'course', 'class', 'tuition', 'school', 'college', 'university', 'education', 'study', 'learning', 'lesson', 'teacher', 'student', 'exam', 'degree', 'certification'],
    verbs: ['study', 'learn', 'teach', 'enroll', 'graduate']
  },
  salary: {
    keywords: ['salary', 'wage', 'paycheck', 'income', 'payment', 'bonus', 'overtime', 'commission', 'allowance', 'stipend'],
    verbs: ['earned', 'receive', 'got', 'paid']
  },
  freelance: {
    keywords: ['freelance', 'project', 'client', 'gig', 'contract', 'consulting', 'service', 'work', 'job', 'task', 'assignment'],
    verbs: ['work', 'complete', 'deliver', 'provide']
  },
  investment: {
    keywords: ['investment', 'stock', 'share', 'mutual', 'fund', 'bond', 'dividend', 'profit', 'capital', 'trading', 'portfolio'],
    verbs: ['invest', 'trade', 'buy', 'sell']
  }
};

// Enhanced expense detection patterns
const expensePatterns = [
  // Direct expense verbs
  /\b(bought|buy|purchased|purchase|paid|pay|spent|spend|cost|gave|give|ordered|order)\b/i,
  // Expense contexts
  /\b(for|at|from|in|to)\s+[\w\s]+\s+\d+/i,
  // Bill patterns
  /\b(bill|invoice|charge|fee|fine|penalty)\b/i,
  // Shopping patterns
  /\b(shopping|store|mall|market|shop)\b/i
];

// Enhanced income detection patterns
const incomePatterns = [
  // Direct income verbs
  /\b(earned|earn|received|receive|got|get|made|make|sold|sell)\b/i,
  // Income contexts
  /\b(salary|wage|paycheck|income|bonus|profit|revenue|commission|dividend|refund|cashback)\b/i,
  // Work contexts
  /\b(from\s+(work|job|client|company|freelance|project|gig))\b/i
];

// Currency patterns
const currencyPattern = /(taka|tk|bdt|৳|dollar|usd|\$|euro|€|rupee|rs|inr)/gi;

/**
 * Parse natural language transaction message
 * @param {string} message - User's natural language input
 * @returns {Object} Parsed transaction data
 */
export const parseTransaction = (message) => {
  try {
    // Use NLP for enhanced parsing
    const doc = nlp(message.toLowerCase());
    
    // Extract amount with better patterns
    const amounts = message.match(/\d+(?:,\d{3})*(?:\.\d{2})?/g);
    const amount = amounts ? parseFloat(amounts[0].replace(/,/g, '')) : null;
    
    if (!amount) {
      return {
        success: false,
        error: "Could not find amount in your message. Please include a number."
      };
    }
    
    // Remove currency from message for better parsing
    const cleanMessage = message.replace(currencyPattern, '').toLowerCase();
    
    // Enhanced transaction type detection using NLP and patterns
    let type = 'expense'; // default
    let confidence = 'medium';
    
    // Check for income patterns first (more specific)
    const hasIncomePattern = incomePatterns.some(pattern => pattern.test(cleanMessage));
    const hasExpensePattern = expensePatterns.some(pattern => pattern.test(cleanMessage));
    
    // Use NLP to identify verbs and their context
    const verbs = doc.verbs().out('array');
    const nouns = doc.nouns().out('array');
    
    // Income detection logic
    if (hasIncomePattern) {
      type = 'income';
      confidence = 'high';
    } else if (hasExpensePattern) {
      type = 'expense';
      confidence = 'high';
    } else {
      // Fallback to verb analysis
      const incomeVerbs = ['earned', 'received', 'got', 'made', 'sold'];
      const expenseVerbs = ['bought', 'paid', 'spent', 'purchased', 'ordered'];
      
      if (verbs.some(verb => incomeVerbs.includes(verb))) {
        type = 'income';
        confidence = 'medium';
      } else if (verbs.some(verb => expenseVerbs.includes(verb))) {
        type = 'expense';
        confidence = 'medium';
      }
    }
    
    // Enhanced category detection
    let category = 'other';
    let maxScore = 0;
    
    for (const [cat, catData] of Object.entries(categoryKeywords)) {
      let score = 0;
      
      // Check keywords
      catData.keywords.forEach(keyword => {
        if (cleanMessage.includes(keyword)) {
          score += 2; // Higher weight for exact keyword match
        }
      });
      
      // Check verbs in context
      if (catData.verbs) {
        catData.verbs.forEach(verb => {
          if (verbs.includes(verb)) {
            score += 3; // Even higher weight for verb context
          }
        });
      }
      
      // Check nouns in context
      nouns.forEach(noun => {
        if (catData.keywords.includes(noun)) {
          score += 1; // Lower weight for noun matches
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        category = cat;
      }
    }
    
    // Override category for income types
    if (type === 'income') {
      if (cleanMessage.includes('salary') || cleanMessage.includes('wage') || cleanMessage.includes('paycheck')) {
        category = 'salary';
      } else if (cleanMessage.includes('freelance') || cleanMessage.includes('project') || cleanMessage.includes('gig')) {
        category = 'freelance';
      } else if (cleanMessage.includes('investment') || cleanMessage.includes('dividend') || cleanMessage.includes('stock')) {
        category = 'investment';
      } else if (maxScore === 0) {
        category = 'other_income';
      }
    }
    
    // Enhanced description extraction
    let description = message
      .replace(currencyPattern, '') // Remove currency
      .replace(/\d+(?:,\d{3})*(?:\.\d{2})?/g, '') // Remove amounts
      .replace(/^\s*(bought|buy|purchased|purchase|paid|pay|spent|spend|earned|earn|received|receive|got|get)\s*/i, '') // Remove leading action verbs
      .trim();
    
    // Clean up extra spaces and punctuation
    description = description.replace(/\s+/g, ' ').replace(/^[,\-\s]+/, '').trim();
    
    // If description is too short, create a meaningful one
    if (description.length < 3) {
      description = `${type === 'income' ? 'Income' : 'Expense'} - ${category}`;
    }
    
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Get current date
    const date = new Date().toISOString().split('T')[0];
    
    return {
      success: true,
      data: {
        type,
        amount,
        category,
        description,
        date,
        confidence: maxScore > 3 ? 'high' : confidence,
        nlpAnalysis: {
          verbs,
          nouns: nouns.slice(0, 3), // Limit to first 3 nouns
          detectedPatterns: {
            income: hasIncomePattern,
            expense: hasExpensePattern
          }
        }
      }
    };
    
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return {
      success: false,
      error: "Failed to parse your message. Please try again."
    };
  }
};

/**
 * Format transaction for display
 * @param {Object} transaction - Transaction object
 * @returns {string} Formatted string
 */
export const formatTransactionMessage = (transaction) => {
  const { type, amount, category, description } = transaction;
  const emoji = type === 'income' ? '💰' : '💸';
  const typeText = type === 'income' ? 'Income' : 'Expense';
  
  return `${emoji} ${typeText} Added!\n💵 Amount: ${amount} BDT\n📝 ${description}\n🏷️ Category: ${category}`;
};

/**
 * Get category emoji
 * @param {string} category - Category name
 * @returns {string} Emoji
 */
export const getCategoryEmoji = (category) => {
  const emojiMap = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    shopping: '🛍️',
    bills: '📄',
    health: '🏥',
    education: '📚',
    salary: '💼',
    freelance: '💻',
    investment: '📈',
    other: '📦',
    other_income: '💰'
  };
  
  return emojiMap[category] || '📦';
};

// Add helper function to get category color
export const getCategoryColor = (category) => {
  const colorMap = {
    food: 'bg-orange-100 text-orange-800',
    transport: 'bg-blue-100 text-blue-800',
    entertainment: 'bg-purple-100 text-purple-800',
    shopping: 'bg-pink-100 text-pink-800',
    bills: 'bg-red-100 text-red-800',
    health: 'bg-green-100 text-green-800',
    education: 'bg-indigo-100 text-indigo-800',
    salary: 'bg-emerald-100 text-emerald-800',
    freelance: 'bg-cyan-100 text-cyan-800',
    investment: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
    other_income: 'bg-lime-100 text-lime-800'
  };
  
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};