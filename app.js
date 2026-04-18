class App {
    constructor() {
        this.score = parseInt(localStorage.getItem('elevate_score')) || 0;
        this.currentView = 'dashboard';
        
        this.init();
    }

    init() {
        // Setup Navigation
        document.querySelectorAll('.nav-links li').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.navigate(target);
            });
        });

        // Update Score Display
        this.updateScoreDisplay();
        
        // Update Dashboard Progress Bars
        this.updateProgressBars();
    }

    navigate(viewId) {
        if (this.currentView === viewId) return;

        // Stop any playing audio if leaving listening
        if (this.currentView === 'listening' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            document.getElementById('l-waveform').classList.add('hidden');
        }

        // Hide current view
        document.getElementById(this.currentView).classList.remove('active');
        setTimeout(() => {
            document.getElementById(this.currentView).classList.add('hidden');
            
            // Show new view
            const newView = document.getElementById(viewId);
            newView.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                newView.classList.add('active');
            }, 50);
            
            this.currentView = viewId;
            
            // Update Page Title
            const titles = {
                'dashboard': 'Dashboard',
                'reading': 'Reading Mastery',
                'listening': 'Listening Skills',
                'writing': 'Writing Practice',
                'speaking': 'Speaking AI',
                'placement': 'Darajani Aniqlash'
            };
            document.getElementById('page-title').textContent = titles[viewId];
            
            // Update Navigation Highlighting
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            const navLink = document.querySelector(`.nav-links li[data-target="${viewId}"]`);
            if (navLink) navLink.classList.add('active');

            // Initialize module if needed
            if(viewId === 'reading' && window.readingModule) readingModule.init();
            if(viewId === 'listening' && window.listeningModule) listeningModule.init();
            if(viewId === 'writing' && window.writingModule) writingModule.init();
            if(viewId === 'speaking' && window.speakingModule) speakingModule.init();
            if(viewId === 'placement' && window.placementModule) placementModule.init();

        }, 400); // Wait for fade out
    }

    addScore(points) {
        this.score += points;
        localStorage.setItem('elevate_score', this.score);
        this.updateScoreDisplay();
        
        // Add a visual pop effect to the score
        const scoreEl = document.getElementById('global-score');
        scoreEl.style.transform = 'scale(1.5)';
        scoreEl.style.color = '#10b981';
        setTimeout(() => {
            scoreEl.style.transform = 'scale(1)';
            scoreEl.style.color = 'var(--accent-warning)';
        }, 300);
        
        this.updateProgressBars();
    }

    updateScoreDisplay() {
        document.getElementById('global-score').textContent = this.score;
    }

    updateProgressBars() {
        // Simple mock progress calculation based on score
        // In a real app, this would be based on actual questions answered per module
        let baseProgress = Math.min((this.score / 20000) * 100, 100);
        
        // Randomize slightly for visual effect per module if score > 0
        if (this.score > 0) {
            document.getElementById('reading-progress').style.width = `${Math.min(baseProgress * 1.2, 100)}%`;
            document.getElementById('listening-progress').style.width = `${Math.min(baseProgress * 0.9, 100)}%`;
            document.getElementById('writing-progress').style.width = `${Math.min(baseProgress * 1.5, 100)}%`;
            document.getElementById('speaking-progress').style.width = `${Math.min(baseProgress * 0.8, 100)}%`;
        }
    }
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
