// ===== ИГРА: ТУАЛЕТНЫЙ ЗАБЕГ (ТОЛЬКО ССЫЛКА НА GITHUB) =====

class ToiletRunnerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Размеры
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Игровые переменные
        this.score = 0;
        this.isRunning = false;
        this.gameOver = false;
        this.frameCount = 0;
        this.certificateUnlocked = false;
        
        // Физика
        this.gravity = 0.8;
        this.jumpPower = -15;
        
        // Игрок
        this.player = {
            x: 100,
            y: 0,
            width: 60,
            height: 60,
            velocityY: 0,
            onGround: false
        };
        
        // Земля
        this.groundY = this.canvas.height - 80;
        this.player.y = this.groundY - this.player.height;
        
        // Препятствия
        this.obstacles = [];
        this.obstacleFrequency = 120;
        this.minObstacleFrequency = 60;
        
        // Видео
        this.video = null;
        this.videoLoaded = false;
        
        // Препятствия
        this.obstacleTypes = [
            { emoji: '🚽', width: 40, height: 60 },
            { emoji: '🚻', width: 50, height: 70 },
            { emoji: '💩', width: 35, height: 40 },
            { emoji: '🧻', width: 30, height: 50 },
            { emoji: '💧', width: 45, height: 20 }
        ];
        
        // Загружаем видео
        this.loadVideo();
        this.setupControls();
    }
    
    loadVideo() {
        this.video = document.createElement('video');
        
        // ⬇️⬇️⬇️ ЕДИНСТВЕННАЯ ССЫЛКА НА ВИДЕО ⬇️⬇️⬇️
        const videoUrl = 'https://vkvideo.ru/clip-236002705_456239017'
        // ⬆️⬆️⬆️ БОЛЬШЕ НИГДЕ НЕТ ССЫЛОК ⬆️⬆️⬆️
        
        this.video.src = videoUrl;
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.crossOrigin = 'anonymous';
        
        this.video.addEventListener('loadeddata', () => {
            this.videoLoaded = true;
            console.log('✅ Видео загружено');
        });
        
        this.video.addEventListener('error', () => {
            console.log('❌ Ошибка загрузки видео');
            this.videoLoaded = false;
        });
        
        this.video.load();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isRunning && !this.gameOver) {
                e.preventDefault();
                this.jump();
            }
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.isRunning && !this.gameOver) this.jump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isRunning && !this.gameOver) this.jump();
        });
    }
    
    jump() {
        if (this.player.onGround) {
            this.player.velocityY = this.jumpPower;
            this.player.onGround = false;
        }
    }
    
    start() {
        this.score = 0;
        this.isRunning = true;
        this.gameOver = false;
        this.obstacles = [];
        this.frameCount = 0;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.certificateUnlocked = false;
        
        if (this.videoLoaded) {
            this.video.play().catch(() => {});
        }
        
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.video) this.video.pause();
    }
    
    reset() {
        this.stop();
        this.start();
    }
    
    update() {
        if (!this.isRunning || this.gameOver) return;
        
        this.frameCount++;
        this.score = Math.floor(this.frameCount / 10);
        document.getElementById('gameScore').textContent = this.score;
        
        if (this.score >= 500 && !this.certificateUnlocked) {
            this.certificateUnlocked = true;
            this.unlockCertificate();
        }
        
        // Физика
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Препятствия
        const freq = Math.max(this.minObstacleFrequency, this.obstacleFrequency - Math.floor(this.score / 100) * 10);
        if (this.frameCount % freq === 0) this.createObstacle();
        
        const speed = 5 + Math.floor(this.score / 100);
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= speed;
            
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            if (this.checkCollision(this.player, obs)) this.endGame();
        }
    }
    
    createObstacle() {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        this.obstacles.push({
            x: this.canvas.width,
            y: this.groundY - type.height,
            width: type.width,
            height: type.height,
            emoji: type.emoji
        });
    }
    
    checkCollision(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Небо
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(1, '#e0f6ff');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Земля
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        // Игрок
        if (this.videoLoaded && this.video.readyState >= 2) {
            try {
                this.ctx.drawImage(this.video, this.player.x, this.player.y, this.player.width, this.player.height);
            } catch {
                this.drawPlaceholder();
            }
        } else {
            this.drawPlaceholder();
        }
        
        // Препятствия
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.font = `${obs.height-10}px Arial`;
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(obs.emoji, obs.x + obs.width/2, obs.y + obs.height/2);
        });
        
        if (this.gameOver) this.drawGameOver();
    }
    
    drawPlaceholder() {
        this.ctx.fillStyle = '#667eea';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 20, this.player.y + 20, 5, 0, Math.PI*2);
        this.ctx.arc(this.player.x + 40, this.player.y + 20, 5, 0, Math.PI*2);
        this.ctx.fill();
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 50);
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`Счёт: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 20);
        
        const high = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
        if (this.score > high) {
            this.ctx.fillStyle = '#f4a261';
            this.ctx.fillText('🎉 НОВЫЙ РЕКОРД!', this.canvas.width/2, this.canvas.height/2 + 70);
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        if (this.video) this.video.pause();
        saveHighScore(this.score);
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'inline-block';
    }
    
    unlockCertificate() {
        this.stop();
        setTimeout(() => {
            alert('🎉 500 очков! Сертификат разблокирован!');
            closeGame();
            openCertificate();
        }, 500);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Запуск
let gameInstance = null;

function initGame() {
    if (!gameInstance) {
        gameInstance = new ToiletRunnerGame('gameCanvas');
        window.gameInstance = gameInstance;
    }
    document.getElementById('startButton').onclick = () => {
        gameInstance.start();
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';
    };
    document.getElementById('restartButton').onclick = () => {
        gameInstance.reset();
        document.getElementById('restartButton').style.display = 'none';
    };
}
