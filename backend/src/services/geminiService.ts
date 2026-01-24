import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new GoogleGenerativeAI(apiKey);
};

const getModel = () => {
    const genAI = getGenAI();
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

export interface FlashcardData {
    question: string;
    answer: string;
}

export interface QuizQuestionData {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

// Chat with document context
export const chatWithDocument = async (
    documentText: string,
    userMessage: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> => {
    try {
        const model = getModel();

        // Build conversation context
        const historyContext = chatHistory
            .slice(-6) // Keep last 6 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        const prompt = `You are an AI learning assistant. You have access to the following document content:

---DOCUMENT START---
${documentText.slice(0, 30000)}
---DOCUMENT END---

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}

User's question: ${userMessage}

Please answer the user's question based on the document content. If the answer is not in the document, say so and provide general knowledge if applicable. Be helpful, clear, and educational.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error in chatWithDocument:', error);
        throw new Error('Failed to generate AI response');
    }
};

// Generate document summary
export const generateSummary = async (documentText: string): Promise<string> => {
    try {
        const model = getModel();

        const prompt = `You are an expert summarizer. Please provide a comprehensive yet concise summary of the following document. 

The summary should:
1. Capture the main topics and key points
2. Be organized with clear structure
3. Highlight important concepts, definitions, and conclusions
4. Be suitable for study and review purposes

Document content:
${documentText.slice(0, 50000)}

Please provide the summary:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error in generateSummary:', error);
        throw new Error('Failed to generate summary');
    }
};

// Explain a concept from the document
export const explainConcept = async (
    documentText: string,
    concept: string
): Promise<string> => {
    try {
        const model = getModel();

        const prompt = `You are an expert educator. Based on the following document content, provide a detailed explanation of the concept: "${concept}"

Your explanation should:
1. Define the concept clearly
2. Explain how it relates to the document content
3. Provide examples if applicable
4. Use simple language suitable for learning
5. Include any relevant context from the document

Document content:
${documentText.slice(0, 30000)}

Please explain the concept "${concept}":`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error in explainConcept:', error);
        throw new Error('Failed to explain concept');
    }
};

// Generate flashcards from document
export const generateFlashcards = async (
    documentText: string,
    count: number = 10
): Promise<FlashcardData[]> => {
    try {
        const model = getModel();

        const prompt = `You are an expert educator creating study flashcards. Based on the following document, create ${count} flashcards that help students learn and memorize the key concepts.

Each flashcard should:
1. Have a clear, specific question
2. Have a concise but complete answer
3. Focus on important concepts, definitions, facts, or relationships
4. Be useful for study and review

Document content:
${documentText.slice(0, 40000)}

Please generate ${count} flashcards in the following JSON format ONLY (no other text):
[
  {
    "question": "What is...?",
    "answer": "The answer is..."
  }
]

JSON output:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse flashcards JSON');
        }

        const flashcards: FlashcardData[] = JSON.parse(jsonMatch[0]);
        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Error in generateFlashcards:', error);
        throw new Error('Failed to generate flashcards');
    }
};

// Generate quiz questions from document
export const generateQuiz = async (
    documentText: string,
    questionCount: number = 5
): Promise<QuizQuestionData[]> => {
    try {
        const model = getModel();

        const prompt = `You are an expert educator creating a multiple-choice quiz. Based on the following document, create ${questionCount} multiple-choice questions that test understanding of the key concepts.

Each question should:
1. Have a clear question
2. Have exactly 4 options (A, B, C, D)
3. Have only ONE correct answer
4. Include an explanation of why the correct answer is right
5. Cover important concepts from the document

Document content:
${documentText.slice(0, 40000)}

Please generate ${questionCount} quiz questions in the following JSON format ONLY (no other text):
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "The correct answer is A because..."
  }
]

Note: correctAnswer is the index (0-3) of the correct option.

JSON output:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse quiz JSON');
        }

        const questions: QuizQuestionData[] = JSON.parse(jsonMatch[0]);
        return questions.slice(0, questionCount);
    } catch (error) {
        console.error('Error in generateQuiz:', error);
        throw new Error('Failed to generate quiz');
    }
};
