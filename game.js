// ===== ИГРА: ТУАЛЕТНЫЙ ЗАБЕГ (VK ВИДЕО) =====

class ToiletRunnerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Размеры canvas
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
        
        // Игрок (позиция для отрисовки, но видео будет в iframe)
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
        
        // VK Video Player
        this.vkIframe = null;
        this.videoLoaded = false;
        
        // Типы препятствий
        this.obstacleTypes = [
            { emoji: '🚽', width: 40, height: 60 },
            { emoji: '🚻', width: 50, height: 70 },
            { emoji: '💩', width: 35, height: 40 },
            { emoji: '🧻', width: 30, height: 50 },
            { emoji: '💧', width: 45, height: 20 }
        ];
        
        // Загружаем VK видео
        this.loadVideo();
        this.setupControls();
    }
    
    loadVideo() {
        // ⬇️⬇️⬇️ ТВОЯ ССЫЛКА НА VK ВИДЕО ⬇️⬇️⬇️
        const vkVideoUrl = 'https://vkvideo.ru/clip-236002705_456239017';
        // ⬆️⬆️⬆️ ЭТА ССЫЛКА БУДЕТ ИСПОЛЬЗОВАТЬСЯ ⬆️⬆️⬆️
        
        // Создаём контейнер для VK iframe (скрытый)
        this.vkContainer = document.createElement('div');
        this.vkContainer.style.position = 'absolute';
        this.vkContainer.style.top = '-9999px';
        this.vkContainer.style.left = '-9999px';
        this.vkContainer.style.width = '560px';
        this.vkContainer.style.height = '315px';
        document.body.appendChild(this.vkContainer);
        
        // Создаём iframe с VK плеером
        this.vkIframe = document.createElement('iframe');
        
        // Преобразуем ссылку в формат для встраивания
        // Из clip-236002705_456239017 получаем oid и id
        const videoId = 'clip-236002705_456239017';
        const parts = videoId.replace('clip-', '').split('_');
        const oid = parts[0]; // -236002705
        const id = parts[1];  // 456239017
        
        // Формируем embed ссылку
        this.vkIframe.src = `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2&autoplay=1`;
        this.vkIframe.width = 560;
        this.vkIframe.height = 315;
        this.vkIframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        this.vkIframe.style.border = 'none';
        this.vkIframe.allowFullscreen = true;
        
        this.vkContainer.appendChild(this.vkIframe);
        
        // Считаем видео загруженным через небольшую задержку
        setTimeout(() => {
            this.videoLoaded = true;
            console.log('✅ VK видео загружено');
        }, 2000);
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
        
        // Пытаемся запустить видео в iframe (если есть API)
        try {
            // Для VK если нужно будет дополнительно управлять плеером
        } catch (e) {}
        
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
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
        
        // Физика игрока
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Создание препятствий
        const freq = Math.max(this.minObstacleFrequency, this.obstacleFrequency - Math.floor(this.score / 100) * 10);
        if (this.frameCount % freq === 0) this.createObstacle();
        
        // Движение препятствий
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
        
        // Облака
        this.drawClouds();
        
        // Земля
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        // Рисуем игрока (визуализация поверх iframe не получится, 
        // поэтому используем заглушку с надписью, что видео загружено)
        if (this.videoLoaded) {
            // Рисуем рамку с надписью "VK Video"
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('VK', this.player.x + 30, this.player.y + 30);
            this.ctx.fillText('🎥', this.player.x + 30, this.player.y + 45);
        } else {
            // Заглушка если видео не загрузилось
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + 20, this.player.y + 20, 5, 0, Math.PI*2);
            this.ctx.arc(this.player.x + 40, this.player.y + 20, 5, 0, Math.PI*2);
            this.ctx.fill();
        }
        
        // Препятствия
        this.obstacles.forEach(obs => {
            // Прозрачный фон
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Обводка
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            
            // Эмодзи
            this.ctx.font = `${obs.height-10}px Arial`;
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(obs.emoji, obs.x + obs.width/2, obs.y + obs.height/2);
        });
        
        // Game Over
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
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const cloudOffset = (this.frameCount * 0.5) % (this.canvas.width + 200);
        
        this.drawCloud(100 - cloudOffset, 50);
        this.drawCloud(400 - cloudOffset, 80);
        this.drawCloud(700 - cloudOffset, 60);
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
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

// Инициализация игры
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
