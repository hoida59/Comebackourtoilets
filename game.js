// ===== ИГРА: ТУАЛЕТНЫЙ ЗАБЕГ =====

class ToiletRunnerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Устанавливаем размеры
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Игровые переменные
        this.score = 0;
        this.isRunning = false;
        this.gameOver = false;
        this.frameCount = 0;
        
        // Физика
        this.gravity = 0.8;
        this.jumpPower = -15;
        
        // Игрок (видео)
        this.player = {
            x: 100,
            y: 0,
            width: 60,
            height: 60,
            velocityY: 0,
            isJumping: false,
            onGround: false
        };
        
        // Земля
        this.groundY = this.canvas.height - 80;
        this.player.y = this.groundY - this.player.height;
        
        // Препятствия (туалеты)
        this.obstacles = [];
        this.obstacleFrequency = 120; // Кадры между препятствиями
        this.minObstacleFrequency = 60;
        
        // Видео элемент
        this.video = null;
        this.videoLoaded = false;
        
        // Загружаем видео
        this.loadVideo();
        
        // Обработчики событий
        this.setupControls();
    }
    
    loadVideo() {
        this.video = document.createElement('video');
        this.video.src = 'video_personaz.mp4';
        this.video.loop = true;
        this.video.muted = true;
        this.video.playsInline = true;
        
        this.video.addEventListener('loadeddata', () => {
            this.videoLoaded = true;
            console.log('Видео загружено');
        });
        
        this.video.addEventListener('error', () => {
            // Ошибка загрузки видео, используем заглушку — без вывода в консоль
            this.videoLoaded = false;
        });
        
        this.video.load();
    }
    
    setupControls() {
        // Прыжок по пробелу
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isRunning && !this.gameOver) {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Прыжок по клику на canvas
        this.canvas.addEventListener('click', () => {
            if (this.isRunning && !this.gameOver) {
                this.jump();
            }
        });
        
        // Прыжок по тачу (мобильные)
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
            this.player.isJumping = true;
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
        
        // Запускаем видео
        if (this.videoLoaded) {
            this.video.play().catch(e => console.log('Ошибка воспроизведения видео:', e));
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
        
        // Обновляем счёт
        this.score = Math.floor(this.frameCount / 10);
        document.getElementById('gameScore').textContent = this.score;
        
        // Проверяем достижение 500 очков
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
            this.player.isJumping = false;
        } else {
            this.player.onGround = false;
        }
        
        // Создание препятствий
        const currentFrequency = Math.max(
            this.minObstacleFrequency,
            this.obstacleFrequency - Math.floor(this.score / 100) * 10
        );
        
        if (this.frameCount % currentFrequency === 0) {
            this.createObstacle();
        }
        
        // Обновление препятствий
        const speed = 5 + Math.floor(this.score / 100);
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= speed;
            
            // Удаление препятствий за экраном
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Проверка коллизий
            if (this.checkCollision(this.player, obstacle)) {
                this.endGame();
            }
        }
    }
    
    createObstacle() {
        const types = ['toilet1', 'toilet2', 'toilet3'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let width, height;
        switch(type) {
            case 'toilet1':
                width = 40;
                height = 60;
                break;
            case 'toilet2':
                width = 50;
                height = 70;
                break;
            case 'toilet3':
                width = 35;
                height = 80;
                break;
        }
        
        this.obstacles.push({
            x: this.canvas.width,
            y: this.groundY - height,
            width: width,
            height: height,
            type: type
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон (небо)
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
        
        // Трава
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
        
        // Игрок (видео или заглушка)
        if (this.videoLoaded && this.video.readyState >= 2) {
            this.ctx.drawImage(
                this.video,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Заглушка - простой персонаж
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.font = '40px Arial';
            this.ctx.fillText('🏃', this.player.x + 10, this.player.y + 45);
        }
        
        // Препятствия (туалеты)
        this.obstacles.forEach(obstacle => {
            this.drawToilet(obstacle);
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
    
    drawToilet(obstacle) {
        const { x, y, width, height, type } = obstacle;
        
        // Основа туалета
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, width, height);
        
        // Обводка
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Детали в зависимости от типа
        switch(type) {
            case 'toilet1':
                // Классический унитаз
                this.ctx.fillStyle = '#e0e0e0';
                this.ctx.fillRect(x + 5, y + 10, width - 10, height - 20);
                this.ctx.font = '30px Arial';
                this.ctx.fillText('🚽', x + 5, y + 45);
                break;
            case 'toilet2':
                // Писсуар
                this.ctx.fillStyle = '#f0f0f0';
                this.ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
                this.ctx.font = '35px Arial';
                this.ctx.fillText('🚻', x + 7, y + 50);
                break;
            case 'toilet3':
                // Высокий туалет
                this.ctx.fillStyle = '#d0d0d0';
                this.ctx.fillRect(x + 3, y + 5, width - 6, height - 10);
                this.ctx.font = '25px Arial';
                this.ctx.fillText('🚽', x + 5, y + 40);
                this.ctx.fillText('💩', x + 5, y + 65);
                break;
        }
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
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Нажми "ЗАНОВО" для повтора', this.canvas.width / 2, this.canvas.height / 2 + 120);
        
        this.ctx.textAlign = 'left';
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        if (this.video) {
            this.video.pause();
        }
        
        // Сохраняем рекорд
        saveHighScore(this.score);
        
        // Показываем кнопку рестарта
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'inline-block';
    }
    
    unlockCertificate() {
        // Останавливаем игру
        this.stop();
        
        // Показываем поздравление
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
