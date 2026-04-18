// B2 Level Base Data for Procedural Generation
const b2Words = [
    { word: "Accommodate", synonym: "Adjust", wrong: ["Refuse", "Ignore", "Complicate"] },
    { word: "Benevolent", synonym: "Kind", wrong: ["Cruel", "Selfish", "Angry"] },
    { word: "Candid", synonym: "Honest", wrong: ["Deceitful", "Hidden", "Fake"] },
    { word: "Diligent", synonym: "Hardworking", wrong: ["Lazy", "Careless", "Slow"] },
    { word: "Eloquent", synonym: "Articulate", wrong: ["Mumbled", "Silent", "Confused"] }
];

const b2Sentences = [
    "It is absolutely essential that you submit the assignment by tomorrow.",
    "Despite the heavy rain, they managed to complete the marathon.",
    "If I had known about the traffic, I would have taken a different route.",
    "She has been working at the company for over five years.",
    "The new regulations are expected to have a significant impact on the economy."
];

// Generate 80 B2 Questions (20 per skill)
function generateCabinetQuestions() {
    let reading = [];
    let listening = [];
    let writing = [];
    let speaking = [];

    for (let i = 0; i < 20; i++) {
        // Reading
        let wObj = b2Words[i % b2Words.length];
        reading.push({
            type: 'reading',
            q: `Reading (B2): What is the closest synonym for "${wObj.word}" in a formal context?`,
            options: [wObj.synonym, ...wObj.wrong].sort(() => Math.random() - 0.5),
            answer: wObj.synonym
        });

        // Listening
        let s = b2Sentences[i % b2Sentences.length];
        listening.push({
            type: 'listening',
            audio: s,
            q: `Listening (B2): Which exact sentence did you hear?`,
            options: [
                s, 
                s.replace("assignment", "project").replace("heavy", "light"),
                s.replace("impact", "effect").replace("known", "heard"),
                s.replace("marathon", "race").replace("five", "six")
            ].sort(() => Math.random() - 0.5),
            answer: s
        });

        // Writing
        let errS = s.replace("has been working", "is working").replace("had known", "knew").replace("managed to complete", "manage to complete");
        if(errS === s) errS = s.replace("the", "a");
        writing.push({
            type: 'writing',
            q: `Writing (B2): Correct the grammatical errors in this sentence:\n"${errS}"`,
            answer: s
        });

        // Speaking
        speaking.push({
            type: 'speaking',
            q: "Speaking (B2): Read this complex sentence out loud with proper intonation:",
            text: s
        });
    }

    return [
        { title: "Kabinet 1: Reading", data: reading },
        { title: "Kabinet 2: Listening", data: listening },
        { title: "Kabinet 3: Writing", data: writing },
        { title: "Kabinet 4: Speaking", data: speaking }
    ];
}

class PlacementModule {
    constructor() {
        this.cabinets = generateCabinetQuestions();
        this.currentCabinetIndex = 0;
        this.currentQuestionIndex = 0;
        this.totalScore = 0;
        this.isAnswered = false;
        
        // Setup Synth for Listening
        this.synth = window.speechSynthesis;
        this.voices = [];
        const loadVoices = () => { this.voices = this.synth.getVoices(); };
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) { this.synth.onvoiceschanged = loadVoices; }
        
        // Setup Recognition for Speaking
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
            this.recognition = new window.SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.onstart = () => {
                document.getElementById('p-speechStatus').textContent = 'Listening... Speak now.';
                document.getElementById('p-micBtn').classList.add('recording');
            };
            this.recognition.onresult = (e) => this.handleSpeech(e.results[0][0].transcript);
            this.recognition.onerror = () => this.stopRecording();
            this.recognition.onend = () => this.stopRecording();
        }
    }

    init() {
        this.currentCabinetIndex = 0;
        this.currentQuestionIndex = 0;
        this.totalScore = 0;
        
        document.getElementById('p-resultArea').classList.add('hidden');
        document.getElementById('p-questionArea').classList.remove('hidden');
        this.loadQuestion();
    }

    loadQuestion() {
        this.isAnswered = false;
        const cabinet = this.cabinets[this.currentCabinetIndex];
        const q = cabinet.data[this.currentQuestionIndex];
        
        // Update Headers
        document.getElementById('p-cabinetTitle').textContent = cabinet.title;
        document.getElementById('p-current').textContent = this.currentQuestionIndex + 1;
        
        // Calculate total progress (80 questions total)
        let totalCompleted = (this.currentCabinetIndex * 20) + this.currentQuestionIndex;
        document.getElementById('p-totalProgress').textContent = `${totalCompleted}/80`;

        document.getElementById('p-questionText').textContent = q.q;
        
        // Reset UI
        document.getElementById('p-options').classList.add('hidden');
        document.getElementById('p-options').innerHTML = '';
        document.getElementById('p-writingArea').classList.add('hidden');
        document.getElementById('p-input').value = '';
        document.getElementById('p-audioControls').classList.add('hidden');
        document.getElementById('p-speakingControls').classList.add('hidden');
        document.getElementById('p-feedback').classList.add('hidden');
        document.getElementById('p-nextBtn').classList.add('hidden');
        document.getElementById('p-input').disabled = false;
        document.getElementById('p-submitBtn').classList.remove('hidden');
        
        // Skill Badge
        const badge = document.getElementById('p-skillBadge');
        badge.textContent = q.type.toUpperCase() + " SKILL";

        // Setup based on type
        if (q.type === 'reading') {
            badge.style.color = '#60a5fa'; badge.style.background = 'rgba(59, 130, 246, 0.2)';
            this.setupOptions(q);
        } else if (q.type === 'listening') {
            badge.style.color = '#a78bfa'; badge.style.background = 'rgba(139, 92, 246, 0.2)';
            document.getElementById('p-audioControls').classList.remove('hidden');
            this.setupOptions(q);
        } else if (q.type === 'writing') {
            badge.style.color = '#fb923c'; badge.style.background = 'rgba(249, 115, 22, 0.2)';
            document.getElementById('p-writingArea').classList.remove('hidden');
        } else if (q.type === 'speaking') {
            badge.style.color = '#34d399'; badge.style.background = 'rgba(16, 185, 129, 0.2)';
            document.getElementById('p-speakingControls').classList.remove('hidden');
            document.getElementById('p-questionText').textContent = `Speaking (B2): Read this out loud:\n"${q.text}"`;
        }
    }

    setupOptions(q) {
        const optionsGrid = document.getElementById('p-options');
        optionsGrid.classList.remove('hidden');
        opts = [...q.options];
        opts.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `<span>${opt}</span> <i class="fa-solid fa-circle-check hidden"></i>`;
            btn.onclick = () => this.checkOptionAnswer(btn, opt, q.answer);
            optionsGrid.appendChild(btn);
        });
    }

    playAudio() {
        if (this.synth.speaking) this.synth.cancel();
        const q = this.cabinets[this.currentCabinetIndex].data[this.currentQuestionIndex];
        const utterance = new SpeechSynthesisUtterance(q.audio);
        utterance.lang = 'en-US'; utterance.rate = 0.85; utterance.pitch = 1.05;
        let voicesList = this.voices.length > 0 ? this.voices : this.synth.getVoices();
        let bestVoice = voicesList.find(v => v.name.includes('Google US English') || v.name.includes('Zira'));
        if (bestVoice) utterance.voice = bestVoice;
        this.synth.speak(utterance);
    }

    toggleRecording() {
        if (!window.SpeechRecognition) return alert("Browser does not support Speech Recognition.");
        if (this.isAnswered) return;
        try { this.recognition.start(); } catch(e) {}
    }

    stopRecording() {
        document.getElementById('p-micBtn').classList.remove('recording');
        document.getElementById('p-speechStatus').textContent = 'Processing...';
    }

    cleanStr(str) {
        return str.toLowerCase().replace(/[.,!?]/g, '').trim();
    }

    checkOptionAnswer(btnElement, selectedOpt, correctOpt) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        if(this.synth.speaking) this.synth.cancel();

        const allBtns = document.getElementById('p-options').children;
        if (selectedOpt === correctOpt) {
            btnElement.classList.add('correct');
            btnElement.querySelector('i').classList.remove('hidden');
            this.totalScore++;
            this.showFeedback(true, "To'g'ri!");
        } else {
            btnElement.classList.add('wrong');
            btnElement.querySelector('i').className = 'fa-solid fa-circle-xmark';
            btnElement.querySelector('i').classList.remove('hidden');
            Array.from(allBtns).forEach(b => { if(b.textContent.trim() === correctOpt) b.classList.add('correct'); });
            this.showFeedback(false, "Noto'g'ri.");
        }
        document.getElementById('p-nextBtn').classList.remove('hidden');
    }

    checkManualAnswer() {
        if (this.isAnswered) return;
        const input = document.getElementById('p-input');
        if (!input.value.trim()) return alert("Iltimos, yozing.");
        
        this.isAnswered = true;
        input.disabled = true;
        document.getElementById('p-submitBtn').classList.add('hidden');
        
        const q = this.cabinets[this.currentCabinetIndex].data[this.currentQuestionIndex];
        if (this.cleanStr(input.value) === this.cleanStr(q.answer)) {
            this.totalScore++;
            this.showFeedback(true, "To'g'ri yozdingiz!");
        } else {
            this.showFeedback(false, `Noto'g'ri. To'g'ri javob: "${q.answer}"`);
        }
        document.getElementById('p-nextBtn').classList.remove('hidden');
    }

    handleSpeech(transcript) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        
        const q = this.cabinets[this.currentCabinetIndex].data[this.currentQuestionIndex];
        if (this.cleanStr(transcript) === this.cleanStr(q.text)) {
            this.totalScore++;
            this.showFeedback(true, `Ajoyib talaffuz! Siz dedingiz: "${transcript}"`);
        } else {
            this.showFeedback(false, `Xato talaffuz. Siz dedingiz: "${transcript}"`);
        }
        document.getElementById('p-nextBtn').classList.remove('hidden');
    }

    showFeedback(isCorrect, msg) {
        const feedback = document.getElementById('p-feedback');
        feedback.textContent = msg;
        feedback.className = isCorrect ? 'feedback-box feedback-success' : 'feedback-box feedback-error';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Check if finished current cabinet
        if (this.currentQuestionIndex >= 20) {
            this.currentCabinetIndex++;
            this.currentQuestionIndex = 0;
            
            // Check if finished all cabinets
            if (this.currentCabinetIndex >= 4) {
                this.showResults();
                return;
            } else {
                alert(`${this.cabinets[this.currentCabinetIndex-1].title} yakunlandi! Endi ${this.cabinets[this.currentCabinetIndex].title} ga o'tasiz.`);
            }
        }
        this.loadQuestion();
    }

    showResults() {
        document.getElementById('p-questionArea').classList.add('hidden');
        document.getElementById('p-cabinetTitle').textContent = "Test Yakunlandi";
        document.getElementById('p-totalProgress').textContent = "80/80";
        
        const resultArea = document.getElementById('p-resultArea');
        resultArea.classList.remove('hidden');

        // Logic for B2 placement (max 80 points)
        let level = "B1 (Pastroq)";
        if (this.totalScore >= 40 && this.totalScore <= 59) level = "B2 (Yaxshi)";
        else if (this.totalScore >= 60) level = "C1 (A'lo)";

        document.getElementById('p-scoreVal').textContent = `${this.totalScore} / 80`;
        document.getElementById('p-levelVal').textContent = level;
    }
}

window.placementModule = new PlacementModule();
