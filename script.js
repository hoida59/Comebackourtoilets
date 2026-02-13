// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initializeSignatureSystem();
    updateCounter();
    loadHighScore();
    generateQRCodes(); // Загружаем QR-коды
});

// ===== СИСТЕМА ПОДПИСЕЙ =====
let signatures = JSON.parse(localStorage.getItem('toiletSignatures')) || [];

function initializeSignatureSystem() {
    const checkbox = document.getElementById('supportCheckbox');
    const signButton = document.getElementById('signButton');
    const statusElement = document.getElementById('signatureStatus');
    
    // Проверяем, подписывал ли пользователь
    const userSigned = localStorage.getItem('userSignedToilet');
    if (userSigned) {
        statusElement.textContent = '✅ Ты уже поддержал кампанию! Спасибо!';
        statusElement.className = 'signature-status already-signed';
        checkbox.checked = true;
        checkbox.disabled = true;
        signButton.disabled = true;
    }
    
    // Обработчик чекбокса
    checkbox.addEventListener('change', function() {
        signButton.disabled = !this.checked;
    });
    
    // Обработчик кнопки подписи
    signButton.addEventListener('click', function() {
        if (!userSigned) {
            addSignature();
            localStorage.setItem('userSignedToilet', 'true');
            statusElement.textContent = '🎉 Отлично! Твоя подпись учтена!';
            statusElement.className = 'signature-status success';
            checkbox.disabled = true;
            signButton.disabled = true;
            
            // Анимация счётчика
            updateCounter();
            
            // Конфетти эффект
            createConfetti();
        }
    });
}

function addSignature() {
    const timestamp = new Date().toISOString();
    signatures.push({
        timestamp: timestamp,
        id: generateId()
    });
    localStorage.setItem('toiletSignatures', JSON.stringify(signatures));
}

function updateCounter() {
    const counterElement = document.getElementById('signatureCounter');
    const count = signatures.length;
    
    // Анимация счётчика
    animateCounter(counterElement, count);
}

function animateCounter(element, target) {
    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== КОНФЕТТИ =====
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.style.transition = 'all 3s ease-out';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.style.top = window.innerHeight + 'px';
            confetti.style.left = (parseFloat(confetti.style.left) + (Math.random() - 0.5) * 200) + 'px';
            confetti.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// ===== QR КОДЫ =====
// Функция для генерации простого QR (заглушка)
function generateSimpleQR(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Белый фон
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
    
    // Простой паттерн QR (для демонстрации)
    ctx.fillStyle = 'black';
    const size = 10;
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i * size, j * size, size, size);
            }
        }
    }
    
    // Центральный логотип
    ctx.fillStyle = 'white';
    ctx.fillRect(75, 75, 50, 50);
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('🚽', 100, 108);
}

function generateQRCodes() {
    // ВАШИ РЕАЛЬНЫЕ ССЫЛКИ С POSTIMAGES
    const myImages = [
        'https://i.postimg.cc/WpCwBmBx/IMG-20260213-231252-849.jpg', // ваш QR-код
        'https://i.postimg.cc/WpCwBmBx/IMG-20260213-231252-849.jpg', // пока та же, замените на свою
        'https://i.postimg.cc/WpCwBmBx/IMG-20260213-231252-849.jpg'  // пока та же, замените на свою
    ];
    
    // Загружаем каждую картинку
    for (let i = 0; i < myImages.length; i++) {
        loadQRImage(i + 1, myImages[i]);
    }
}

function loadQRImage(index, url) {
    const canvas = document.getElementById(`qrCanvas${index}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Важно для CORS
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        console.log(`QR${index} успешно загружен`);
    };
    
    img.onerror = function() {
        console.log(`Ошибка загрузки QR${index}, использую заглушку`);
        // Если картинка не загрузилась - рисуем заглушку
        generateSimpleQR(`qrCanvas${index}`, `QR ${index}`);
    };
    
    img.src = url;
}

function downloadQR(qrId) {
    const container = document.getElementById(qrId);
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `toilet-campaign-qr-${qrId}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function uploadQR(index) {
    const input = document.getElementById(`qrUpload${index}`);
    input.click();
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.getElementById(`qrCanvas${index}`);
                    const ctx = canvas.getContext('2d');
                    canvas.width = 200;
                    canvas.height = 200;
                    ctx.drawImage(img, 0, 0, 200, 200);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
}

// ===== ИГРА =====
function openGame() {
    const modal = document.getElementById('gameModal');
    modal.classList.add('active');
    initGame();
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
    if (window.gameInstance) {
        window.gameInstance.stop();
    }
}

function loadHighScore() {
    const highScore = localStorage.getItem('toiletGameHighScore') || 0;
    document.getElementById('highScore').textContent = highScore;
    if (document.getElementById('gameHighScore')) {
        document.getElementById('gameHighScore').textContent = highScore;
    }
}

function saveHighScore(score) {
    const currentHigh = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
    if (score > currentHigh) {
        localStorage.setItem('toiletGameHighScore', score);
        document.getElementById('highScore').textContent = score;
        if (document.getElementById('gameHighScore')) {
            document.getElementById('gameHighScore').textContent = score;
        }
    }
}

// ===== СЕРТИФИКАТ =====
function openCertificate() {
    const modal = document.getElementById('certificateModal');
    modal.classList.add('active');
}

function closeCertificate() {
    const modal = document.getElementById('certificateModal');
    modal.classList.remove('active');
}

let uploadedPhoto = null;

// Загрузка фото для сертификата
const photoInput = document.getElementById('certificatePhoto');
if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedPhoto = new Image();
                uploadedPhoto.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function generateCertificate() {
    const name = document.getElementById('certificateName').value.trim();
    
    if (!name) {
        alert('Пожалуйста, введи своё имя!');
        return;
    }
    
    const canvas = document.getElementById('certificateCanvas');
    const ctx = canvas.getContext('2d');
    
    // Размеры сертификата
    canvas.width = 1000;
    canvas.height = 700;
    
    // Загружаем фоновое изображение
    const background = new Image();
    background.onload = function() {
        // Рисуем фон
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Добавляем текст
        ctx.fillStyle = '#000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('СЕРТИФИКАТ АКТИВИСТА', canvas.width / 2, 150);
        
        ctx.font = '32px Arial';
        ctx.fillText('Этот сертификат подтверждает, что', canvas.width / 2, 250);
        
        ctx.font = 'bold 56px Arial';
        ctx.fillStyle = '#e94560';
        ctx.fillText(name, canvas.width / 2, 330);
        
        ctx.fillStyle = '#000';
        ctx.font = '28px Arial';
        ctx.fillText('активно поддержал кампанию', canvas.width / 2, 400);
        ctx.fillText('"Верните туалет на 4 этаж!"', canvas.width / 2, 440);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🚽 Набрал 500+ очков в игре 🚽', canvas.width / 2, 500);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666';
        const date = new Date().toLocaleDateString('ru-RU');
        ctx.fillText(`Дата: ${date}`, canvas.width / 2, 580);
        
        // Добавляем фото если есть
        if (uploadedPhoto && uploadedPhoto.complete) {
            const photoSize = 120;
            const photoX = 50;
            const photoY = 50;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(uploadedPhoto, photoX, photoY, photoSize, photoSize);
            ctx.restore();
        }
        
        // Показываем превью
        document.getElementById('certificatePreview').style.display = 'block';
    };
    
    // Если нет gramota.jpg, используем градиент
    background.onerror = function() {
        // Создаём красивый фон
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Добавляем декоративную рамку
        ctx.strokeStyle = '#f4a261';
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Продолжаем с текстом
        background.onload();
    };
    
    background.src = 'gramota.jpg';
}

function downloadCertificate() {
    const canvas = document.getElementById('certificateCanvas');
    const link = document.createElement('a');
    const name = document.getElementById('certificateName').value.trim();
    link.download = `sertifikat-${name}-toilet-campaign.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function shareCertificate() {
    const canvas = document.getElementById('certificateCanvas');
    canvas.toBlob(function(blob) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' });
        
        if (navigator.share) {
            navigator.share({
                title: 'Мой сертификат активиста!',
                text: 'Я поддержал кампанию "Верните туалет на 4 этаж!" 🚽',
                files: [file]
            }).catch(err => console.log('Ошибка при шаринге:', err));
        } else {
            alert('Функция "Поделиться" не поддерживается в этом браузере. Используй кнопку "Скачать"!');
        }
    });
}

// ===== ПАСХАЛКИ =====
const easterEggMessages = [
    {
        title: '🚽 Факт #1',
        text: 'Знаешь ли ты, что средний человек проводит в туалете около 3 лет своей жизни? Представь, сколько времени мы теряем, бегая на другие этажи!'
    },
    {
        title: '💪 Мотивация',
        text: 'Каждый великий протест начинается с малого. Сегодня мы боремся за туалет, завтра - меняем мир!'
    },
    {
        title: '🎯 Миссия',
        text: 'Наша цель - не просто вернуть туалет. Мы боремся за справедливость, комфорт и равные условия для всех студентов!'
    }
];

let currentEasterEgg = 0;

function showEasterEgg(id) {
    const modal = document.getElementById('easterEggModal');
    const textElement = document.getElementById('easterEggText');
    
    const egg = easterEggMessages[currentEasterEgg];
    textElement.innerHTML = `
        <h3>${egg.title}</h3>
        <p>${egg.text}</p>
    `;
    
    modal.classList.add('active');
    
    currentEasterEgg = (currentEasterEgg + 1) % easterEggMessages.length;
}

function closeEasterEgg() {
    const modal = document.getElementById('easterEggModal');
    modal.classList.remove('active');
}

// ===== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ПО КЛИКУ ВНЕ =====
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        if (window.gameInstance) {
            window.gameInstance.stop();
        }
    }
});
