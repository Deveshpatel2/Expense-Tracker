// Services/voiceService.js

/**
 * Simulates transcribing audio to text.
 * In a real app, this would call OpenAI Whisper or Google Speech-to-Text.
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
const transcribeAudio = async (filePath) => {
    console.log(`🎤 Simulating transcription for file: ${filePath}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response for testing
    // You can change this to test different scenarios
    return "Coffee 5.50 dollars for breakfast";
};

/**
 * Parses natural language text into expense data.
 * @param {string} text - The transcribed text
 * @returns {Object} - Parsed expense object { amount, description, category }
 */
const parseCommand = (text) => {
    console.log(`🧠 Parsing command: "${text}"`);

    const lowerText = text.toLowerCase();
    let amount = null;
    let category = 'Other';
    let description = text;

    // 1. Extract Amount
    // Matches: "50", "50.5", "50 dollars", "$50"
    const amountRegex = /(\d+(\.\d{1,2})?)/;
    const amountMatch = text.match(amountRegex);

    if (amountMatch) {
        amount = parseFloat(amountMatch[0]);
    }

    // 2. Extract Category (Basic Keyword Matching)
    const categories = {
        'food': ['coffee', 'dinner', 'lunch', 'breakfast', 'restaurant', 'burger', 'pizza', 'groceries'],
        'transport': ['taxi', 'uber', 'bus', 'train', 'gas', 'fuel'],
        'shopping': ['clothes', 'shoes', 'amazon', 'gift'],
        'entertainment': ['movie', 'netflix', 'game'],
        'utilities': ['electric', 'water', 'bill', 'internet'],
        'housing': ['rent'],
    };

    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            // Map to the actual category names in your DB
            switch (cat) {
                case 'food': category = 'Food & Dining'; break;
                case 'transport': category = 'Transportation'; break;
                case 'shopping': category = 'Shopping'; break;
                case 'entertainment': category = 'Entertainment'; break;
                case 'utilities': category = 'Utilities'; break;
                case 'housing': category = 'Housing'; break;
                default: category = 'Other';
            }
            break;
        }
    }

    // 3. Clean up description
    // Remove the amount and currency words to make the description cleaner?
    // For now, keying the full text as description is often safer so the user sees what was heard.
    // Or we can simple capitalize it.
    description = text.charAt(0).toUpperCase() + text.slice(1);

    return {
        amount,
        category,
        description,
        originalText: text
    };
};

module.exports = {
    transcribeAudio,
    parseCommand
};
