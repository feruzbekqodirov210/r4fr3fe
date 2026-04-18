class ReadingModule {
    constructor() {
        this.currentIndex = 0;
        this.scorePerQuestion = 10;
        this.isAnswered = false;
    }

    init() {
        if (this.currentIndex === 0 && !this.isAnswered) {
            this.loadQuestion();
        }
    }

    loadQuestion() {
        this.isAnswered = false;
        const q = window.db.reading[this.currentIndex];
        
        document.getElementById('r-current').textContent = q.id;
        document.getElementById('r-points').textContent = this.scorePerQuestion;
        document.getElementById('r-passage').innerHTML = `"${q.passage}"`;
        document.getElementById('r-questionText').textContent = q.question;
        
        const optionsGrid = document.getElementById('r-options');
        optionsGrid.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            btn.innerHTML = `<span>${opt}</span> <i class="fa-solid fa-circle-check hidden"></i>`;
            btn.onclick = () => this.checkAnswer(btn, opt, q.answer);
            optionsGrid.appendChild(btn);
        });

        document.getElementById('r-feedback').className = 'feedback-box hidden';
        document.getElementById('r-nextBtn').classList.add('hidden');
    }

    checkAnswer(btnElement, selectedOpt, correctOpt) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const optionsGrid = document.getElementById('r-options');
        const allBtns = optionsGrid.children;
        const feedback = document.getElementById('r-feedback');

        if (selectedOpt === correctOpt) {
            btnElement.classList.add('correct');
            btnElement.querySelector('i').classList.remove('hidden');
            feedback.textContent = 'Excellent! That is the correct synonym.';
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
            
            feedback.textContent = `Incorrect. The correct answer is "${correctOpt}".`;
            feedback.className = 'feedback-box feedback-error';
        }

        document.getElementById('r-nextBtn').classList.remove('hidden');
    }

    nextQuestion() {
        if (this.currentIndex < window.db.reading.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            document.getElementById('r-questionText').textContent = "You have completed all reading exercises!";
            document.getElementById('r-options').innerHTML = '';
            document.getElementById('r-nextBtn').classList.add('hidden');
            document.getElementById('r-feedback').classList.add('hidden');
            document.getElementById('r-passage').classList.add('hidden');
        }
    }
}

window.readingModule = new ReadingModule();
