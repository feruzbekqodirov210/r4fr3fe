class WritingModule {
    constructor() {
        this.currentIndex = 0;
        this.scorePerQuestion = 20;
        this.isAnswered = false;
    }

    init() {
        if (this.currentIndex === 0 && !this.isAnswered) {
            this.loadQuestion();
        }
    }

    loadQuestion() {
        this.isAnswered = false;
        const q = window.db.writing[this.currentIndex];
        
        document.getElementById('w-current').textContent = q.id;
        document.getElementById('w-points').textContent = this.scorePerQuestion;
        document.getElementById('w-questionText').textContent = q.content;
        
        const inputField = document.getElementById('w-input');
        inputField.value = '';
        inputField.disabled = false;
        
        document.querySelector('.w-submit-btn').classList.remove('hidden');
        document.getElementById('w-feedback').className = 'feedback-box hidden';
        document.getElementById('w-diff').className = 'diff-result hidden';
        document.getElementById('w-nextBtn').classList.add('hidden');
    }

    cleanString(str) {
        return str.toLowerCase().replace(/[.,!?]/g, '').trim();
    }

    checkAnswer() {
        if (this.isAnswered) return;
        
        const inputField = document.getElementById('w-input');
        const userAnswer = inputField.value.trim();
        
        if (!userAnswer) {
            alert('Please type an answer before submitting.');
            return;
        }

        this.isAnswered = true;
        inputField.disabled = true;
        document.querySelector('.w-submit-btn').classList.add('hidden');

        const q = window.db.writing[this.currentIndex];
        const feedback = document.getElementById('w-feedback');
        const diffBox = document.getElementById('w-diff');

        const cleanUser = this.cleanString(userAnswer);
        const cleanCorrect = this.cleanString(q.answer);

        if (cleanUser === cleanCorrect) {
            feedback.textContent = 'Perfect! Your grammar is correct.';
            feedback.className = 'feedback-box feedback-success';
            window.app.addScore(this.scorePerQuestion);
        } else {
            feedback.textContent = 'There are some mistakes in your sentence. See the correction below.';
            feedback.className = 'feedback-box feedback-error';
            
            // Simple Word Diff
            const userWords = cleanUser.split(' ');
            const correctWords = cleanCorrect.split(' ');
            
            let diffHTML = '<strong>Correction:</strong><br>';
            correctWords.forEach((word, index) => {
                if (userWords[index] !== word) {
                    diffHTML += `<span class="diff-correct">${word}</span> `;
                } else {
                    diffHTML += `${word} `;
                }
            });
            
            diffBox.innerHTML = diffHTML;
            diffBox.classList.remove('hidden');
        }

        document.getElementById('w-nextBtn').classList.remove('hidden');
    }

    nextQuestion() {
        if (this.currentIndex < window.db.writing.length - 1) {
            this.currentIndex++;
            this.loadQuestion();
        } else {
            document.getElementById('w-questionText').textContent = "You have completed all writing exercises!";
            document.querySelector('.writing-area').classList.add('hidden');
            document.getElementById('w-nextBtn').classList.add('hidden');
            document.getElementById('w-feedback').classList.add('hidden');
            document.getElementById('w-diff').classList.add('hidden');
        }
    }
}

window.writingModule = new WritingModule();
