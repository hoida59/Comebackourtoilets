// ===== ИГРА: ТУАЛЕТНЫЙ ЗАБЕГ (ЧЕРЕЗ JSDELIVR) =====

// Элементы
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameScoreEl = document.getElementById('gameScore');
const gameHighScoreEl = document.getElementById('gameHighScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let gameInstance = null;

class ToiletRunnerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        this.score = 0;
        this.isRunning = false;
        this.gameOver = false;
        this.frameCount = 0;
        this.certificateUnlocked = false;
        
        this.gravity = 0.5;
        this.jumpPower = -10;
        
        this.player = {
            x: 100,
            y: 0,
            width: 60,
            height: 60,
            velocityY: 0,
            onGround: false,
            ducking: false
        };
        
        this.groundY = this.canvas.height - 80;
        this.player.y = this.groundY - this.player.height;
        
        this.obstacles = [];
        this.obstacleFrequency = 120;
        this.minObstacleFrequency = 60;
        
        // ⬇️⬇️⬇️ ВИДЕО ЧЕРЕЗ JSDELIVR ⬇️⬇️⬇️
        this.video = document.createElement('video');
        this.video.src = 'https://cdn.jsdelivr.net/gh/hoida59/Comebackourtoilets@main/video.mp4';
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';
        this.video.crossOrigin = 'anonymous';
        
        this.videoLoaded = false;
        
        this.video.addEventListener('loadeddata', () => {
            this.videoLoaded = true;
            console.log('✅ Видео успешно загружено через jsDelivr');
        });
        
        this.video.addEventListener('error', (e) => {
            console.log('❌ Ошибка загрузки видео');
            console.log('Код ошибки:', this.video.error ? this.video.error.code : 'неизвестно');
            console.log('Сообщение:', this.video.error ? this.video.error.message : 'нет данных');
            console.log('Проверь ссылку: https://cdn.jsdelivr.net/gh/hoida59/Comebackourtoilets@main/video.mp4');
            this.videoLoaded = false;
        });
        
        this.video.load();
        // ⬆️⬆️⬆️ ВИДЕО ⬆️⬆️⬆️
        
        this.obstacleTypes = [
            { emoji: '🚽', width: 40, height: 60 },
            { emoji: '🚻', width: 50, height: 70 },
            { emoji: '💩', width: 35, height: 40 },
            { emoji: '🧻', width: 30, height: 50 },
            { emoji: '💧', width: 45, height: 20 }
        ];
        
        this.clouds = [];
        for (let i = 0; i < 3; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 150,
                width: 50 + Math.random() * 50,
                speed: 0.2 + Math.random() * 0.3
            });
        }
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isRunning && !this.gameOver) {
                e.preventDefault();
                this.jump();
            }
            if (e.code === 'ArrowDown' && this.isRunning && !this.gameOver) {
                this.duck(true);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.duck(false);
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
            this.player.ducking = false;
        }
    }
    
    duck(start) {
        if (this.isRunning && !this.gameOver && !this.player.jumping) {
            this.player.ducking = start;
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
        this.player.ducking = false;
        this.certificateUnlocked = false;
        
        if (this.videoLoaded) {
            this.video.currentTime = 0;
            this.video.play().catch(e => console.log('Не удалось запустить видео:', e));
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
        gameScoreEl.textContent = this.score;
        
        if (this.score >= 500 && !this.certificateUnlocked) {
            this.certificateUnlocked = true;
            this.unlockCertificate();
        }
        
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        } else {
            this.player.onGround = false;
        }
        
        if (this.player.ducking && this.player.onGround) {
            this.player.height = 40;
            this.player.y = this.groundY - this.player.height;
        } else {
            this.player.height = 60;
            this.player.y = this.groundY - this.player.height;
        }
        
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
        
        for (let cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 150;
            }
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
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#e0f6ff');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let cloud of this.clouds) {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 25, cloud.y - 5, 30, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        for (let obs of this.obstacles) {
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.strokeStyle = '#333';
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.font = `${obs.height-10}px Arial`;
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(obs.emoji, obs.x + obs.width/2, obs.y + obs.height/2);
        }
        
        if (this.videoLoaded && this.video.readyState >= 2) {
            try {
                this.ctx.drawImage(this.video, this.player.x, this.player.y, this.player.width, this.player.height);
            } catch (e) {
                this.drawPlaceholder();
            }
        } else {
            this.drawPlaceholder();
        }
        
        if (this.gameOver) {
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
    }
    
    drawPlaceholder() {
        this.ctx.fillStyle = '#667eea';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 20, this.player.y + 20, 5, 0, Math.PI*2);
        this.ctx.arc(this.player.x + 40, this.player.y + 20, 5, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('видео не грузится', this.player.x, this.player.y - 5);
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        this.video.pause();
        
        const highScore = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
        if (this.score > highScore) {
            localStorage.setItem('toiletGameHighScore', this.score);
            gameHighScoreEl.textContent = this.score;
            document.getElementById('highScore').textContent = this.score;
        }
        
        startButton.style.display = 'none';
        restartButton.style.display = 'inline-block';
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

function initGame() {
    if (!gameInstance) {
        gameInstance = new ToiletRunnerGame('gameCanvas');
        window.gameInstance = gameInstance;
    }
    
    startButton.onclick = () => {
        gameInstance.start();
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
    };
    
    restartButton.onclick = () => {
        gameInstance.reset();
        restartButton.style.display = 'none';
    };
}
