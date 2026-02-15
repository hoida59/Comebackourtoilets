// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initializeSignatureSystem();
    updateCounter();
    loadHighScore();
    generateQRCodes();
});

// ===== СИСТЕМА ПОДПИСЕЙ =====
let signatures = JSON.parse(localStorage.getItem('toiletSignatures')) || [];

function initializeSignatureSystem() {
    const checkbox = document.getElementById('supportCheckbox');
    const signButton = document.getElementById('signButton');
    const statusElement = document.getElementById('signatureStatus');
    
    const userSigned = localStorage.getItem('userSignedToilet');
    if (userSigned) {
        statusElement.textContent = '✅ Ты уже поддержал кампанию! Спасибо!';
        statusElement.className = 'signature-status already-signed';
        checkbox.checked = true;
        checkbox.disabled = true;
        signButton.disabled = true;
    }
    
    checkbox.addEventListener('change', function() {
        signButton.disabled = !this.checked;
    });
    
    signButton.addEventListener('click', function() {
        if (!userSigned) {
            addSignature();
            localStorage.setItem('userSignedToilet', 'true');
            statusElement.textContent = '🎉 Отлично! Твоя подпись учтена!';
            statusElement.className = 'signature-status success';
            checkbox.disabled = true;
            signButton.disabled = true;
            updateCounter();
            createConfetti();
        }
    });
}

function addSignature() {
    const timestamp = new Date().toISOString();
    signatures.push({ timestamp, id: generateId() });
    localStorage.setItem('toiletSignatures', JSON.stringify(signatures));
}

function updateCounter() {
    const counterElement = document.getElementById('signatureCounter');
    animateCounter(counterElement, signatures.length);
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
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed; width: 10px; height: 10px; background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * window.innerWidth}px; top: -10px; opacity: 1; transform: rotate(${Math.random()*360}deg);
            transition: all 3s ease-out; z-index: 9999; pointer-events: none;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => {
            confetti.style.top = window.innerHeight + 'px';
            confetti.style.left = (parseFloat(confetti.style.left) + (Math.random() - 0.5) * 200) + 'px';
            confetti.style.opacity = '0';
        }, 10);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// ===== QR КОДЫ =====
function generateQRCodes() {
    // ⬇️⬇️⬇️ СЮДА ВСТАВЛЯЙ СВОИ ССЫЛКИ НА КАРТИНКИ QR ⬇️⬇️⬇️
    const myImages = [
        'https://i.postimg.cc/KjNqRB2D/IMG-20260215-200156-682.jpg', // Главная страница
        'https://i.postimg.cc/BnqLkXnk/IMG-20260213-231634-967.jpg', // ТГ-КАНАЛ
        'https://i.postimg.cc/BnqLkXnk/IMG-20260213-231634-967.jpg'  // Бонус
    ];

    for (let i = 0; i < myImages.length; i++) {
        const canvas = document.getElementById(`qrCanvas${i+1}`);
        if (!canvas) continue;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            canvas.width = 200;
            canvas.height = 200;
            ctx.drawImage(img, 0, 0, 200, 200);
            console.log(`QR${i+1} загружен`);
        };
        img.onerror = () => {
            ctx.fillStyle = '#667eea';
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = '#fff';
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🚽', 100, 100);
            ctx.font = '20px Arial';
            ctx.fillText(`QR-код ${i+1}`, 100, 160);
        };
        img.src = myImages[i];
    }
}

function downloadQR(qrId) {
    const canvas = document.querySelector(`#${qrId} canvas`);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `toilet-campaign-qr-${qrId}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// ===== ИГРА (ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ) =====
function openGame() {
    document.getElementById('gameModal').classList.add('active');
    if (typeof initGame === 'function') initGame();
}

function closeGame() {
    document.getElementById('gameModal').classList.remove('active');
    if (window.gameInstance) window.gameInstance.stop();
}

function loadHighScore() {
    const hs = localStorage.getItem('toiletGameHighScore') || 0;
    document.getElementById('highScore').textContent = hs;
    if (document.getElementById('gameHighScore')) {
        document.getElementById('gameHighScore').textContent = hs;
    }
}

function saveHighScore(score) {
    const current = parseInt(localStorage.getItem('toiletGameHighScore')) || 0;
    if (score > current) {
        localStorage.setItem('toiletGameHighScore', score);
        loadHighScore();
    }
}

// ===== КОЛЕСО (АНИМИРОВАННОЕ) =====
const prizes = ['Карандаш', 'Ручка', 'Ластик', 'Тетрадь'];
let spinning = false;

function openWheel() {
    const modal = document.getElementById('wheelModal');
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinButton');
    const resultDiv = document.getElementById('wheelResult');
    const messageDiv = document.querySelector('.prize-message');
    
    // Сбрасываем состояние
    wheel.style.transform = 'rotate(0deg)';
    resultDiv.style.display = 'none';
    messageDiv.style.display = 'none';
    spinBtn.style.display = 'inline-block';
    spinBtn.disabled = false;
    spinning = false;
    
    modal.classList.add('active');
}

function closeWheel() {
    document.getElementById('wheelModal').classList.remove('active');
}

function spinWheel() {
    if (spinning) return;
    
    const wheel = document.getElementById('wheel');
    const resultDiv = document.getElementById('wheelResult');
    const messageDiv = document.querySelector('.prize-message');
    const spinBtn = document.getElementById('spinButton');
    
    spinning = true;
    spinBtn.disabled = true;
    
    // Случайный индекс приза (0-3)
    const randomIndex = Math.floor(Math.random() * prizes.length);
    // Каждый сектор занимает 90°, указатель сверху. Чтобы указатель указывал на середину сектора,
    // нужно повернуть колесо на угол: -(randomIndex * 90 + 45) + 360 * 5 (5 полных оборотов)
    const targetAngle = -(randomIndex * 90 + 45) + 360 * 5;
    
    wheel.style.transform = `rotate(${targetAngle}deg)`;
    
    setTimeout(() => {
        resultDiv.innerHTML = `
            <div style="font-size: 4rem;">🎲</div>
            <div style="font-size: 2rem; font-weight: bold; color: #e94560;">${prizes[randomIndex]}</div>
            <p style="margin-top: 20px;">Ты выиграл(а) этот приз!</p>
        `;
        resultDiv.style.display = 'block';
        messageDiv.style.display = 'block';
        spinBtn.style.display = 'none';
        spinning = false;
        createConfetti();
    }, 3000); // время совпадает с transition в CSS
}

// ===== ПАСХАЛКИ =====
const easterEggMessages = [
    { title: '🚽 Факт #1', text: 'Средний человек проводит в туалете около 3 лет жизни!' },
    { title: '💪 Мотивация', text: 'Каждый великий протест начинается с малого.' },
    { title: '🎯 Миссия', text: 'Наша цель — справедливость и комфорт для всех!' }
];
let currentEasterEgg = 0;

function showEasterEgg() {
    const modal = document.getElementById('easterEggModal');
    const textEl = document.getElementById('easterEggText');
    const egg = easterEggMessages[currentEasterEgg];
    textEl.innerHTML = `<h3>${egg.title}</h3><p>${egg.text}</p>`;
    modal.classList.add('active');
    currentEasterEgg = (currentEasterEgg + 1) % easterEggMessages.length;
}

function closeEasterEgg() {
    document.getElementById('easterEggModal').classList.remove('active');
}

// Закрытие модалок по клику вне
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        if (window.gameInstance) window.gameInstance.stop();
    }
});
