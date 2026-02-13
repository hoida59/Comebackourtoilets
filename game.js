// ===== ИГРА: ТУАЛЕТНЫЙ ЗАБЕГ (CORS ANYWHERE) =====

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
        
        // Видео элемент
        this.video = null;
        this.videoLoaded = false;
        
        // Типы препятствий
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
        
        // ⬇️⬇️⬇️ ТВОЯ ССЫЛКА ЧЕРЕЗ CORS ANYWHERE ⬇️⬇️⬇️
        const videoUrl = 'https://cors-anywhere.herokuapp.com/' + 'https://github.com/hoida59/Comebackourtoilets/raw/main/lv_0_20260125005509%20(2)%20(1).mp4';
        // ⬆️⬆️⬆️ ЭТА ССЫЛКА ДОЛЖНА РАБОТАТЬ ⬆️⬆️⬆️
        
        console.log('Загружаю видео через CORS Anywhere:', videoUrl);
        
        this.video.src = videoUrl;
        this.video.loop = true;
        this.video.muted = true; // обязательно для автовоспроизведения
        this.video.playsInline = true;
        this.video.crossOrigin = 'anonymous';
        
        this.video.addEventListener('loadeddata', () => {
            this.videoLoaded = true;
            console.log('✅ Видео успешно загружено!');
        });
        
        this.video.addEventListener('error', (e) => {
            console.log('❌ Ошибка загрузки видео');
            console.log('Код ошибки:', this.video.error ? this.video.error.code : 'неизвестно');
            this.videoLoaded = false;
        });
        
        this.video.addEventListener('canplay', () => {
            console.log('🎬 Видео готово к воспроизведению');
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
            if (this.isRunning && !this.gameOver) {
                this.jump();
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isRunning && !this.gameOver) {
                this.jump();
            }
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
        
        // Пытаемся воспроизвести видео
        if (this.videoLoaded) {
            this.video.play()
                .then(() => console.log('▶️ Видео воспроизводится'))
                .catch(e => {
                    console.log('❌ Не удалось воспроизвести видео:', e);
                    // Пробуем ещё раз с muted (некоторые браузеры требуют)
                    this.video.muted = true;
                    this.video.play().catch(e2 => console.log('❌ И снова ошибка:', e2));
                });
        }
        
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.video) {
            this.video.pause();
        }
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
        
        // Проверка достижения 500 очков
        if (this.score >= 500 && !this.certificateUnlocked) {
            this.certificateUnlocked = true;
            this.unlockCertificate();
        }
        
        // Физика игрока
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Проверка земли
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Создание препятствий
        const currentFrequency = Math.max(
            this.minObstacleFrequency,
            this.obstacleFrequency - Math.floor(this.score / 100) * 10
        );
        
        if (this.frameCount % currentFrequency === 0) {
            this.createObstacle();
        }
        
        // Движение препятствий
        const speed = 5 + Math.floor(this.score / 100);
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= speed;
            
            // Удаляем за экраном
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Проверка столкновения
            if (this.checkCollision(this.player, obstacle)) {
                this.endGame();
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
        
        // Небо с градиентом
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#e0f6ff');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Облака
        this.drawClouds();
        
        // Земля
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        // Игрок (видео или заглушка)
        if (this.videoLoaded && this.video.readyState >= 2) {
            try {
                this.ctx.drawImage(
                    this.video,
                    this.player.x,
                    this.player.y,
                    this.player.width,
                    this.player.height
                );
                
                // Рисуем небольшую обводку, чтобы игрок был заметнее
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
            } catch (e) {
                console.log('Ошибка отрисовки видео:', e);
                this.drawPlayerPlaceholder();
            }
        } else {
            this.drawPlayerPlaceholder();
        }
        
        // Препятствия
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(obstacle);
        });
        
        // Game Over экран
        if (this.gameOver) {
            this.drawGameOver();
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
    
    drawPlayerPlaceholder() {
        // Заглушка если видео не загрузилось
        this.ctx.fillStyle = '#667eea';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Рисуем лицо
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 20, this.player.y + 20, 5, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + 40, this.player.y + 20, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.arc(this.player.x + 30, this.player.y + 35, 10, 0, Math.PI);
        this.ctx.stroke();
        
        // Текст "Загрузка..."
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('видео...', this.player.x + 30, this.player.y - 5);
    }
    
    drawObstacle(obstacle) {
        const { x, y, width, height, emoji } = obstacle;
        
        // Прозрачный фон
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x, y, width, height);
        
        // Обводка
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Эмодзи по центру
        this.ctx.font = `${height - 10}px Arial`;
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, x + width/2, y + height/2);
    }
    
    drawGameOver() {
        // Затемнение
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Текст Game Over
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '30px Arial';
        this.ctx.fillText(`Счёт: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        const highScore = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
        if (this.score > highScore) {
            this.ctx.fillStyle = '#f4a261';
            this.ctx.fillText('🎉 НОВЫЙ РЕКОРД! 🎉', this.canvas.width / 2, this.canvas.height / 2 + 70);
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        if (this.video) {
            this.video.pause();
        }
        
        // Сохраняем рекорд
        this.saveHighScore(this.score);
        
        // Показываем кнопку рестарта
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'inline-block';
    }
    
    saveHighScore(score) {
        const currentHigh = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
        if (score > currentHigh) {
            localStorage.setItem('toiletGameHighScore', score);
            // Обновляем отображение рекорда на странице
            const highScoreElement = document.getElementById('highScore');
            if (highScoreElement) {
                highScoreElement.textContent = score;
            }
        }
    }
    
    unlockCertificate() {
        this.stop();
        
        setTimeout(() => {
            alert('🎉 Поздравляем! Ты набрал 500 очков и разблокировал сертификат!');
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
    
    // Обработчики кнопок
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

// Функция для сохранения рекорда (для обратной совместимости)
function saveHighScore(score) {
    if (gameInstance) {
        gameInstance.saveHighScore(score);
    }
}
