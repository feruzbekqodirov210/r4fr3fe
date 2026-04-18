class SpeakingModule {
    constructor() {
        this.currentIndex = 0;
        this.scorePerQuestion = 25;
        this.isAnswered = false;
        this.isRecording = false;
        
        // Setup Speech Recognition
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
            this.recognition = new window.SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                document.getElementById('s-status').textContent = 'Listening... Speak now.';
                document.getElementById('s-micBtn').classList.add('recording');
                document.getElementById('s-ripple').classList.remove('hidden');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleSpeechResult(transcript);
            };
            
            this.recognition.onerror = (event) => {
                this.stopRecording();
                document.getElementById('s-status').textContent = 'Error occurred: ' + event.error + '. Try again.';
            };
            
            this.recognition.onend = () => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }

    init() {
        if (this.currentIndex === 0 && !this.isAnswered) {
            this.loadQuestion();
        }
    }

    loadQuestion() {
        this.isAnswered = false;
        const q = window.db.speaking[this.currentIndex];
        
        document.getElementById('s-current').textContent = q.id;
        document.getElementById('s-points').textContent = this.scorePerQuestion;
        document.getElementById('s-targetText').textContent = q.targetPhrase;
        
        document.getElementById('s-status').textContent = 'Click microphone to start';
        document.getElementById('s-resultBox').classList.add('hidden');
        document.getElementById('s-feedback').className = 'feedback-box hidden';
        document.getElementById('s-diff').className = 'diff-result hidden';
        document.getElementById('s-nextBtn').classList.add('hidden');
        
        if (!window.SpeechRecognition) {
            document.getElementById('s-status').textContent = 'Speech Recognition not supported in your browser (Try Chrome).';
        }
    }

    toggleRecording() {
        if (!window.SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Google Chrome.");
            return;
        }

        if (this.isAnswered) return;

        if (this.isRecording) {
            this.stopRecording();
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch(e) {
                console.error(e);
            }
        }
    }

    stopRecording() {
        this.isRecording = false;
        document.getElementById('s-micBtn').classList.remove('recording');
        document.getElementById('s-ripple').classList.add('hidden');
        document.getElementById('s-status').textContent = 'Processing speech...';
    }

    cleanString(str) {
        return str.toLowerCase().replace(/[.,!?]/g, '').trim();
    }

    handleSpeechResult(transcript) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const q = window.db.speaking[this.currentIndex];
        
        // Show what user said
        const resultBox = document.getElementById('s-resultBox');
        document.getElementById('s-transcript').textContent = `"${transcript}"`;
        resultBox.classList.remove('hidden');
        
        const feedback = document.getElementById('s-feedback');
        const diffBox = document.getElementById('s-diff');

        const cleanUser = this.cleanString(transcript);
        const cleanCorrect = this.cleanString(q.targetPhrase);

        if (cleanUser === cleanCorrect) {
            feedback.textContent = 'Excellent pronunciation!';
            feedback.className = 'feedback-box feedback-success';
            document.getElementById('s-status').textContent = 'Task completed.';
            window.app.addScore(this.scorePerQuestion);
        } else {
            feedback.textContent = 'You had some mispronunciations. Check the color-coded feedback below.';
            feedback.className = 'feedback-box feedback-error';
            document.getElementById('s-status').textContent = 'Needs improvement.';
            
            // Simple Word Diff for Speaking
            const userWords = cleanUser.split(' ');
            const correctWords = cleanCorrect.split(' ');
            
            let diffHTML = '<strong>Pronunciation Analysis:</strong><br><br>';
            correctWords.forEach((word, index) => {
                if (!userWords.includes(word)) {
                    diffHTML += `<span class="diff-error">${word}</span> `;
                } else {
                    diffHTML += `<span class="diff-correct">${word}</span> `;
                }
            });
            
            diffBox.innerHTML = diffHTML;
            diffBox.classList.remove('hidden');
        }

        document.getElementById('s-nextBtn').classList.remove('hidden');
    }

    nextQuestion() {
        if (this.currentIndex < window.db.speaking.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            document.getElementById('s-targetText').textContent = "You have completed all speaking exercises!";
            document.querySelector('.speaking-controls').classList.add('hidden');
            document.getElementById('s-resultBox').classList.add('hidden');
            document.getElementById('s-nextBtn').classList.add('hidden');
            document.getElementById('s-feedback').classList.add('hidden');
            document.getElementById('s-diff').classList.add('hidden');
        }
    }
}

window.speakingModule = new SpeakingModule();
