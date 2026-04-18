// B2 Level English Vocabulary and Sentences
const words = [
    { word: "Accommodate", synonym: "Adjust", wrong: ["Refuse", "Ignore", "Complicate"] },
    { word: "Benevolent", synonym: "Kind", wrong: ["Cruel", "Selfish", "Angry"] },
    { word: "Candid", synonym: "Honest", wrong: ["Deceitful", "Hidden", "Fake"] },
    { word: "Diligent", synonym: "Hardworking", wrong: ["Lazy", "Careless", "Slow"] },
    { word: "Eloquent", synonym: "Articulate", wrong: ["Mumbled", "Silent", "Confused"] },
    { word: "Frugal", synonym: "Thrifty", wrong: ["Wasteful", "Expensive", "Generous"] },
    { word: "Gregarious", synonym: "Sociable", wrong: ["Shy", "Introverted", "Quiet"] },
    { word: "Hinder", synonym: "Obstruct", wrong: ["Help", "Allow", "Push"] },
    { word: "Inevitable", synonym: "Unavoidable", wrong: ["Unlikely", "Doubtful", "Avoidable"] },
    { word: "Lucid", synonym: "Clear", wrong: ["Confusing", "Dark", "Muddy"] }
];

const sentences = [
    "It is absolutely essential that you submit the assignment by tomorrow.",
    "Despite the heavy rain, they managed to complete the marathon.",
    "If I had known about the traffic, I would have taken a different route.",
    "She has been working at the company for over five years.",
    "The new regulations are expected to have a significant impact on the economy.",
    "I am writing to express my dissatisfaction with the service I received.",
    "He suggested that we should postpone the meeting until next week.",
    "By the time we arrived at the cinema, the film had already started.",
    "Not only did she pass the exam, but she also got the highest score.",
    "The project was highly successful, largely due to the team's dedication."
];

// 1. Generate 5000 Reading Questions (B2 Level)
const generateReadingQuestions = () => {
    let questions = [];
    for (let i = 0; i < 5000; i++) {
        const wordObj = words[i % words.length];
        questions.push({
            id: i + 1,
            passage: `(B2 Level Text) The word "${wordObj.word}" is commonly used in upper-intermediate English to express a specific idea. For example: "His ${wordObj.word.toLowerCase()} nature was highly appreciated by his colleagues in the corporate environment."`,
            question: `What is the closest synonym for the word "${wordObj.word}"?`,
            options: [wordObj.synonym, ...wordObj.wrong].sort(() => Math.random() - 0.5),
            answer: wordObj.synonym
        });
    }
    return questions;
};

// 2. Generate 5000 Listening Questions (B2 Level)
const generateListeningQuestions = () => {
    let questions = [];
    for (let i = 0; i < 5000; i++) {
        const sentence = sentences[i % sentences.length];
        // Create B2 level variations of the sentence to act as wrong options
        let wrong1 = sentence.replace("assignment", "project").replace("heavy", "light");
        let wrong2 = sentence.replace("impact", "effect").replace("dissatisfaction", "satisfaction");
        let wrong3 = sentence.replace("postpone", "cancel").replace("highest", "lowest");
        
        questions.push({
            id: i + 1,
            audioText: sentence, 
            question: `Listen carefully to the B2 level sentence. Which sentence did you exactly hear?`,
            options: [sentence, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5),
            answer: sentence
        });
    }
    return questions;
};

// 3. Generate 5000 Writing Questions (B2 Level)
const generateWritingQuestions = () => {
    let questions = [];
    for (let i = 0; i < 5000; i++) {
        const sentence = sentences[i % sentences.length];
        // Introduce common B2 level grammatical errors
        let errorSentence = sentence
            .replace("has been working", "is working")
            .replace("had known", "knew")
            .replace("had already started", "already started")
            .replace("Did she pass", "she passed");
            
        // Fallback if replace didn't change anything
        if (errorSentence === sentence) {
            errorSentence = sentence.replace("the", "a").replace("is", "are");
        }
        
        questions.push({
            id: i + 1,
            task: `Correct the grammatical errors in this B2 level sentence:`,
            content: errorSentence,
            answer: sentence
        });
    }
    return questions;
};

// 4. Generate 5000 Speaking Questions (B2 Level)
const generateSpeakingQuestions = () => {
    let questions = [];
    for (let i = 0; i < 5000; i++) {
        const sentence = sentences[i % sentences.length];
        questions.push({
            id: i + 1,
            targetPhrase: sentence
        });
    }
    return questions;
};

// Expose the database globally
window.db = {
    reading: generateReadingQuestions(),
    listening: generateListeningQuestions(),
    writing: generateWritingQuestions(),
    speaking: generateSpeakingQuestions()
};

console.log("B2 Level Database initialized with 20,000 questions (5000 per section).");
