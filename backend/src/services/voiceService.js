const transcribeAudio = async (filePath) => {
    console.log(`🎤 Transcribing: ${filePath}`);
    await new Promise(r => setTimeout(r, 1000));
    return "Coffee 5.50 dollars";
};

const parseCommand = (text) => {
    return { amount: 5.5, category: 'Food & Dining', description: text };
};

module.exports = { transcribeAudio, parseCommand };
