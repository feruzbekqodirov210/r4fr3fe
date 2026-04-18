class ListeningModule {
    constructor() {
        this.currentIndex = 0;
        this.scorePerQuestion = 15;
        this.isAnswered = false;
        this.synth = window.speechSynthesis;
    }

    init() {
        if (this.currentIndex === 0 && !this.isAnswered) {
            this.loadQuestion();
        }
    }

    loadQuestion() {
        this.isAnswered = false;
        const q = window.db.listening[this.currentIndex];
        
        document.getElementById('l-current').textContent = q.id;
        document.getElementById('l-points').textContent = this.scorePerQuestion;
        document.getElementById('l-questionText').textContent = q.question;
        
        const optionsGrid = document.getElementById('l-options');
        optionsGrid.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `<span>${opt}</span> <i class="fa-solid fa-circle-check hidden"></i>`;
            btn.onclick = () => this.checkAnswer(btn, opt, q.answer);
            optionsGrid.appendChild(btn);
        });

        document.getElementById('l-feedback').className = 'feedback-box hidden';
        document.getElementById('l-nextBtn').classList.add('hidden');
        document.getElementById('l-waveform').classList.add('hidden');
    }

    playAudio() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const q = window.db.listening[this.currentIndex];
        const utterance = new SpeechSynthesisUtterance(q.audioText);
        
        // Settings for clear English pronunciation
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const waveform = document.getElementById('l-waveform');
        
        utterance.onstart = () => {
            waveform.classList.remove('hidden');
        };

        utterance.onend = () => {
            waveform.classList.add('hidden');
        };

        this.synth.speak(utterance);
    }

    checkAnswer(btnElement, selectedOpt, correctOpt) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        
        this.synth.cancel(); // Stop speaking if they answered
        document.getElementById('l-waveform').classList.add('hidden');

        const optionsGrid = document.getElementById('l-options');
        const allBtns = optionsGrid.children;
        const feedback = document.getElementById('l-feedback');

        if (selectedOpt === correctOpt) {
            btnElement.classList.add('correct');
            btnElement.querySelector('i').classList.remove('hidden');
            feedback.textContent = 'Excellent listening skills!';
            feedback.className = 'feedback-box feedback-success';
            window.app.addScore(this.scorePerQuestion);
        } else {
            btnElement.classList.add('wrong');
            btnElement.querySelector('i').className = 'fa-solid fa-circle-xmark';
            btnElement.querySelector('i').classList.remove('hidden');
            
            // Highlight correct answer
            Array.from(allBtns).forEach(b => {
                if(b.textContent.trim() === correctOpt) {
                    b.classList.add('correct');
                }
            });
            
            feedback.textContent = `Incorrect.`;
            feedback.className = 'feedback-box feedback-error';
        }

        document.getElementById('l-nextBtn').classList.remove('hidden');
    }

    nextQuestion() {
        if (this.currentIndex < window.db.listening.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            document.getElementById('l-questionText').textContent = "You have completed all listening exercises!";
            document.getElementById('l-options').innerHTML = '';
            document.getElementById('l-nextBtn').classList.add('hidden');
            document.getElementById('l-feedback').classList.add('hidden');
            document.querySelector('.audio-player').classList.add('hidden');
        }
    }
}

window.listeningModule = new ListeningModule();
