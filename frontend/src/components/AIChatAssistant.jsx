import React, { useState, useRef, useEffect } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import './AIChatAssistant.css';

const AIChatAssistant = () => {
  const { isDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI expense tracker assistant. I can help you with:\n\n📊 **Your Expenses**: Spending analysis, categories, trends\n💰 **Budgeting**: Creating budgets, saving tips\n🌐 **Website Help**: How to use features, navigation guide\n📁 **Organization**: Categories, expense management\n💡 **General**: Features, settings, data export\n\nTry asking:\n• \"What is this app?\"\n• \"How to add expense?\"\n• \"How much have I spent?\"\n• \"Navigation guide\"\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Get user's expenses for context
      const token = localStorage.getItem('token');
      let expenses = [];
      
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/expenses', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            expenses = data.data || [];
          }
        } catch (error) {
          console.warn('Could not fetch expenses for context:', error);
        }
      }

      // Calculate some basic stats
      const totalExpenses = expenses.length;
      const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const categories = {};
      expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categories[cat] = (categories[cat] || 0) + (parseFloat(exp.amount) || 0);
      });
      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

      // Generate AI response based on context
      const response = generateAIResponse(userMessage, {
        totalExpenses,
        totalAmount,
        categories,
        topCategory: topCategory ? topCategory[0] : null,
        expenses: expenses.slice(0, 10) // Last 10 expenses for context
      });

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (userMessage, context) => {
    const message = userMessage.toLowerCase();
    const { totalExpenses, totalAmount, categories, topCategory, expenses } = context;

    // Website/App Questions
    if (message.includes('what is') || message.includes('tell me about') || message.includes('about this') || message.includes('about the app') || message.includes('about the website')) {
      return `**Spendora** is your personal expense tracking application! 🎯\n\n**Key Features:**\n• 📊 Track and manage expenses\n• 💰 Create and manage budgets\n• 📈 View detailed reports and analytics\n• 📁 Organize expenses by categories\n• 🌍 Multi-currency support\n• 🌙 Dark mode\n• 📱 Mobile-responsive design\n\n**Main Sections:**\n• **Dashboard**: Overview of your spending\n• **Expenses**: Add, edit, and manage expenses\n• **Budget**: Set and track budgets\n• **Reports**: Detailed spending analysis\n• **Categories**: Manage expense categories\n• **Settings**: Customize your preferences\n\nHow can I help you use these features?`;
    }

    if (message.includes('how to') || message.includes('how do i') || message.includes('how can i')) {
      if (message.includes('add expense') || message.includes('create expense')) {
        return `**How to Add an Expense:**\n\n1. Click on **"Expenses"** in the sidebar\n2. Click the **"+ New Expense"** button\n3. Fill in the details:\n   • Description (what you bought)\n   • Amount (how much)\n   • Category (Food, Transportation, etc.)\n   • Date (when you spent it)\n   • Currency (USD, EUR, etc.)\n   • Notes (optional)\n4. Click **"Add Expense"**\n\nThat's it! Your expense will be saved and appear in your dashboard. 📝`;
      }
      
      if (message.includes('create budget') || message.includes('set budget')) {
        return `**How to Create a Budget:**\n\n1. Click on **"Budget"** in the sidebar\n2. Click **"Create Budget"** or **"New Budget"**\n3. Select a category\n4. Set the budget amount\n5. Choose the month\n6. Set alert threshold (default: 80%)\n7. Click **"Save"**\n\nYou'll get alerts when you reach 80% of your budget! 💰`;
      }
      
      if (message.includes('view report') || message.includes('see report') || message.includes('generate report')) {
        return `**How to View Reports:**\n\n1. Click on **"Reports"** in the sidebar\n2. Select a time range:\n   • Last Week\n   • Last Month\n   • Last Quarter\n   • Last Year\n   • Custom Range\n3. Optionally filter by category\n4. Choose chart type (Bar, Line, or Area)\n5. View your spending insights!\n\nYou can also click **"Print Report"** to save or print your report. 📊`;
      }
      
      if (message.includes('change currency') || message.includes('set currency')) {
        return `**How to Change Currency:**\n\n1. Go to **"Settings"** in the sidebar\n2. Find the **"Currency"** section\n3. Select your preferred currency from the dropdown\n4. Click **"Save Settings"**\n\nYour default currency will be used for new expenses. 💵`;
      }
      
      if (message.includes('export') || message.includes('download')) {
        return `**How to Export Your Data:**\n\n1. Go to **"Settings"**\n2. Scroll to **"Data Management"** section\n3. Click **"Export Data"** button\n4. Your data will download as a JSON file\n\nYou can also export reports as PDF from the Reports section! 💾`;
      }
      
      if (message.includes('dark mode') || message.includes('theme')) {
        return `**How to Toggle Dark Mode:**\n\n1. Click the **moon/sun icon** in the top right corner\n2. Or go to **"Settings"** → **"Appearance"** → Toggle **"Dark Mode"**\n\nDark mode reduces eye strain and saves battery on OLED screens! 🌙`;
      }
      
      return `Here's how to use Spendora:\n\n**Getting Started:**\n• Add your first expense from the Expenses section\n• Set up budgets for categories you want to track\n• View reports to understand your spending patterns\n\n**Navigation:**\n• Use the sidebar to switch between sections\n• Dashboard shows your overview\n• Expenses for managing transactions\n• Budget for setting limits\n• Reports for analysis\n• Settings for preferences\n\n**Need Help With:**\n• Adding expenses\n• Creating budgets\n• Viewing reports\n• Changing settings\n• Exporting data\n\nWhat would you like to know more about?`;
    }

    if (message.includes('feature') || message.includes('what can') || message.includes('capabilities')) {
      return `**Spendora Features:**\n\n📊 **Expense Management**\n• Add, edit, delete expenses\n• Categorize expenses\n• Multi-currency support\n• Search and filter\n• Bulk operations\n\n💰 **Budget Management**\n• Set monthly budgets\n• Budget templates\n• Budget alerts (80% threshold)\n• Track budget vs actual\n\n📈 **Analytics & Reports**\n• Spending overview (today/week/month/year)\n• Category breakdown\n• Monthly trends\n• Top expenses\n• Visual charts and graphs\n\n📁 **Organization**\n• Custom categories\n• Category merge/split\n• Expense templates\n• Recurring expenses\n\n⚙️ **Settings**\n• Dark mode\n• Currency preferences\n• Timezone settings\n• Data export\n\nWhat feature would you like to explore?`;
    }

    if (message.includes('navigation') || message.includes('menu') || message.includes('sidebar')) {
      return `**Navigation Guide:**\n\n**Sidebar Menu:**\n• 🏠 **Dashboard**: Overview and statistics\n• 💸 **Expenses**: Manage your expenses\n• 💰 **Budget**: Set and track budgets\n• 📊 **Reports**: Detailed spending analysis\n• 📁 **Categories**: Manage expense categories\n• ⚙️ **Settings**: App preferences\n\n**Top Bar:**\n• User profile dropdown\n• Dark mode toggle (moon icon)\n• Logout option\n\n**Quick Tips:**\n• Click any sidebar item to navigate\n• Use the search bar to find expenses\n• Click "+ New Expense" to add quickly\n• Reports can be printed or exported\n\nNeed help with a specific section?`;
    }

    if (message.includes('currency') && (message.includes('support') || message.includes('available') || message.includes('list'))) {
      return `**Supported Currencies:**\n\nSpendora supports 23 currencies:\n\n💵 **Major Currencies:**\n• USD ($) - US Dollar\n• EUR (€) - Euro\n• GBP (£) - British Pound\n• JPY (¥) - Japanese Yen\n• CAD (C$) - Canadian Dollar\n• AUD (A$) - Australian Dollar\n\n🌍 **Other Currencies:**\n• CHF, CNY, INR (₹), BRL (R$), MXN (Mex$), KRW (₩), RUB (₽), ZAR (R), SEK (kr), NOK (kr), DKK (kr), PLN (zł), TRY (₺), THB (฿), SGD (S$), HKD (HK$), NZD (NZ$)\n\n**How to Use:**\n• Set default currency in Settings\n• Each expense can have its own currency\n• Reports show amounts in their original currencies\n\nWant to change your default currency?`;
    }

    if (message.includes('category') && (message.includes('list') || message.includes('available') || message.includes('default'))) {
      return `**Default Categories:**\n\n1. 🍔 **Food & Dining**\n2. 🚗 **Transportation**\n3. 🛍️ **Shopping**\n4. 🎬 **Entertainment**\n5. 🏥 **Healthcare**\n6. 💡 **Utilities**\n7. 🏠 **Housing**\n8. 📚 **Education**\n9. ✈️ **Travel**\n10. 📦 **Other**\n\n**Tips:**\n• You can create custom categories\n• Use consistent category names for better insights\n• Categories help organize and analyze spending\n• Reports show spending by category\n\nNeed help categorizing an expense?`;
    }

    // Budgeting questions
    if (message.includes('budget') || message.includes('save money')) {
      if (totalAmount > 0) {
        return `Based on your current spending of $${totalAmount.toFixed(2)} across ${totalExpenses} expenses, here are some budgeting tips:\n\n1. **Track your spending**: You're already doing this! Keep it up.\n2. **Set monthly limits**: Consider setting a monthly budget for your top category (${topCategory || 'expenses'}).\n3. **Review regularly**: Check your spending weekly to stay on track.\n4. **Emergency fund**: Aim to save 3-6 months of expenses.\n\nWould you like help setting up a budget for a specific category?`;
      }
      return "Great question! To create an effective budget:\n\n1. **Calculate your income**: Know how much you earn monthly\n2. **Track expenses**: Record all spending (you're already doing this!)\n3. **Categorize**: Group expenses by category\n4. **Set limits**: Allocate amounts to each category\n5. **Review and adjust**: Check monthly and adjust as needed\n\nWould you like help setting up budgets for specific categories?";
    }

    // Spending analysis
    if (message.includes('spending') || message.includes('how much') || message.includes('total')) {
      if (totalExpenses === 0) {
        return "You haven't recorded any expenses yet. Start by adding your first expense to get insights about your spending patterns!";
      }
      
      const categoryBreakdown = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, amount]) => `• ${cat}: $${amount.toFixed(2)}`)
        .join('\n');

      return `Here's your spending summary:\n\n**Total Expenses**: ${totalExpenses} transactions\n**Total Amount**: $${totalAmount.toFixed(2)}\n**Average per expense**: $${(totalAmount / totalExpenses).toFixed(2)}\n\n**Top Categories**:\n${categoryBreakdown}\n\n${topCategory ? `Your biggest spending category is **${topCategory}**. Consider reviewing expenses in this category to find savings opportunities.` : ''}`;
    }

    // Category questions
    if (message.includes('category') || message.includes('categorize')) {
      const categoryList = Object.keys(categories).length > 0 
        ? Object.keys(categories).join(', ')
        : 'Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Housing, Education, Travel, Other';
      
      return `Here are the expense categories you can use:\n\n${categoryList}\n\n**Tips for categorizing**:\n• Be consistent with category names\n• Use specific categories for better insights\n• Review and merge similar categories if needed\n\nWould you like help categorizing a specific expense?`;
    }

    // Recent expenses
    if (message.includes('recent') || message.includes('last') || message.includes('latest')) {
      if (expenses.length === 0) {
        return "You don't have any expenses yet. Add your first expense to start tracking!";
      }
      
      const recent = expenses.slice(0, 5).map(exp => 
        `• ${exp.description || 'Expense'}: $${parseFloat(exp.amount || 0).toFixed(2)} (${exp.category || 'Other'})`
      ).join('\n');
      
      return `Here are your recent expenses:\n\n${recent}\n\nWould you like to analyze any of these expenses or get recommendations?`;
    }

    // Savings tips
    if (message.includes('save') || message.includes('reduce') || message.includes('cut')) {
      return `Here are some practical savings tips:\n\n1. **Review subscriptions**: Cancel unused subscriptions\n2. **Cook at home**: Reduce dining out expenses\n3. **Use cashback**: Take advantage of cashback offers\n4. **Compare prices**: Shop around before major purchases\n5. **Set spending limits**: Use the budget feature to set category limits\n6. **Track small expenses**: Small purchases add up quickly\n\nWould you like specific advice based on your spending patterns?`;
    }

    // Greeting
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return "Hello! 👋 I'm here to help you manage your expenses better. You can ask me about:\n\n• Your spending patterns\n• Budgeting advice\n• Category recommendations\n• Expense analysis\n• Savings tips\n\nWhat would you like to know?";
    }

    // Help
    if (message.includes('help') || message.includes('what can you') || message.includes('what do you')) {
      return "I can help you with:\n\n📊 **Your Expenses**:\n• \"How much have I spent?\"\n• \"What's my top spending category?\"\n• \"Show my recent expenses\"\n• \"Analyze my spending\"\n\n💰 **Budgeting**:\n• \"How do I create a budget?\"\n• \"Give me budgeting tips\"\n• \"Budget advice\"\n\n🌐 **Website/App Help**:\n• \"What is this app?\"\n• \"How to add expense\"\n• \"Navigation guide\"\n• \"What features are available?\"\n• \"How to export data\"\n• \"How to change currency\"\n• \"How to use dark mode\"\n\n📁 **Categories & Organization**:\n• \"What categories can I use?\"\n• \"Help me categorize expenses\"\n• \"Category list\"\n\n💡 **General**:\n• \"Features\" - See all app features\n• \"Supported currencies\" - List currencies\n• \"Savings tips\" - Get money-saving advice\n\nWhat would you like to know?";
    }

    // Website/App help
    if (message.includes('website') || message.includes('app') || message.includes('application')) {
      return `**About Spendora:**\n\nSpendora is a comprehensive expense tracking application that helps you:\n\n✅ Track all your expenses\n✅ Set and manage budgets\n✅ Analyze spending patterns\n✅ Generate detailed reports\n✅ Organize by categories\n✅ Support multiple currencies\n\n**Quick Links:**\n• Ask "How to add expense" for adding expenses\n• Ask "How to create budget" for budgeting\n• Ask "Navigation" for menu help\n• Ask "Features" to see all capabilities\n\nWhat would you like to know?`;
    }

    // Default response
    return `I understand you're asking about "${userMessage}". I can help with:\n\n**📊 Your Expenses:**\n• "How much have I spent?"\n• "Show my top categories"\n• "Recent expenses"\n\n**💰 Budgeting:**\n• "How do I create a budget?"\n• "Budgeting tips"\n\n**🌐 Website/App:**\n• "What is this app?"\n• "How to add expense"\n• "Navigation guide"\n• "What features are available?"\n• "Supported currencies"\n• "How to export data"\n\n**💡 General:**\n• "Help" - See all capabilities\n• "Features" - List all features\n\nTry asking one of these, or rephrase your question!`;
  };

  const quickQuestions = [
    "What is this app?",
    "How to add expense?",
    "How much have I spent?",
    "Navigation guide"
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          className={`ai-chat-button ${isDarkMode ? 'dark' : ''}`}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <svg className="ai-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="ai-chat-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`ai-chat-window ${isDarkMode ? 'dark' : ''}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-content">
              <div className="ai-chat-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div className="ai-chat-header-text">
                <h3>AI Assistant</h3>
                <p>Expense Tracker Helper</p>
              </div>
            </div>
            <button
              className="ai-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="ai-chat-avatar-small">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                )}
                <div className="ai-chat-bubble">
                  <p className="ai-chat-text">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="ai-chat-message assistant">
                <div className="ai-chat-avatar-small">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div className="ai-chat-bubble">
                  <div className="ai-chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="ai-chat-quick-questions">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="ai-chat-quick-button"
                  onClick={() => {
                    setInput(question);
                    handleSend({ preventDefault: () => {} });
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="ai-chat-input-container" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your expenses..."
              className="ai-chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="ai-chat-send-button"
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;

