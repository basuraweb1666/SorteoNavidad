// Fecha fija del sorteo: 22 de diciembre de 2025 a las 00:00:00
const drawDate = new Date('2025-12-22T00:00:00').getTime();

// Función para obtener el número ganador oficial desde el servidor
async function fetchOfficialWinner() {
  try {
    // Número ganador FIJO: 452
    console.log('Número ganador oficial: 452');
    return '452';
  } catch (e) {
    console.error('Error obteniendo ganador:', e);
    return '452'; // fallback
  }
}

// Función para generar el número ganador oficial
async function drawOfficialWinner() {
  try {
    // Número ganador FIJO: 452
    console.log('Número ganador generado: 452');
    return '452';
  } catch (e) {
    console.error('Error generando ganador:', e);
    return '452'; // fallback
  }
}

// Número ganador (se obtiene del servidor)
let winnerNumber = null;

// Elementos del DOM para escritorio
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

// Elementos del DOM para móvil
const daysMobileElement = document.getElementById('days-mobile');
const hoursMobileElement = document.getElementById('hours-mobile');
const minutesMobileElement = document.getElementById('minutes-mobile');
const secondsMobileElement = document.getElementById('seconds-mobile');

const winnerNameElement = document.getElementById('winnerName');
const winnerDisplay = document.getElementById('winnerDisplay');

// Variable global para el intervalo del contador
let countdownInterval;

// Función para actualizar el contador
function updateCountdown() {
    const now = new Date().getTime();
    let distance = drawDate - now;

    // Si la cuenta atrás ha terminado
    if (distance <= 0) {
        clearInterval(countdownInterval);

        // Obtener o generar el número ganador oficial del servidor
        fetchOfficialWinner().then(winner => {
            if (winner === 'No winner yet') {
                // Si no existe, generar uno nuevo
                drawOfficialWinner().then(newWinner => {
                    winnerNumber = newWinner;
                    selectWinner();
                });
            } else {
                winnerNumber = winner;
                selectWinner();
            }
        });
        return;
    }

    // Cálculos para días, horas, minutos y segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar el DOM para escritorio
    if (daysElement) daysElement.textContent = String(days).padStart(2, '0');
    if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
    if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
    if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');

    // Actualizar el DOM para móvil
    if (daysMobileElement) daysMobileElement.textContent = String(days).padStart(2, '0');
    if (hoursMobileElement) hoursMobileElement.textContent = String(hours).padStart(2, '0');
    if (minutesMobileElement) minutesMobileElement.textContent = String(minutes).padStart(2, '0');
    if (secondsMobileElement) secondsMobileElement.textContent = String(seconds).padStart(2, '0');
}

// Función para mostrar el número ganador con animación de ruleta
function selectWinner() {
    const winnerElement = document.querySelector('.winner-name .placeholder');
    const targetNumber = '452'; // Número ganador fijo

    if (winnerElement) {
        // Crear elementos separados para cada dígito con estructura simple
        winnerElement.innerHTML = `
            <span class="roulette-digit" data-target="4">4</span>
            <span class="roulette-digit" data-target="5">5</span>
            <span class="roulette-digit" data-target="2">2</span>
        `;

        const rouletteDigits = document.querySelectorAll('.roulette-digit');

        // Animar cada ruleta por separado
        rouletteDigits.forEach((digit, index) => {
            animateRoulette(digit, targetNumber[index], index * 200);
        });

        // Aplicar estilos iniciales simples
        document.querySelectorAll('.roulette-digit').forEach(digit => {
            digit.style.fontSize = '6rem';
            digit.style.fontWeight = 'bold';
            digit.style.color = 'var(--christmas-gold)';
            digit.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
            digit.style.display = 'inline-block';
            digit.style.margin = '0 0.2rem';
            digit.style.position = 'relative';
        });

        // Hacer scroll automático hacia el resultado
        setTimeout(() => {
            winnerElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }, 2500);
    }

    playVictorySound();
    startConfetti();

    if (winnerDisplay) {
        winnerDisplay.querySelector('h2').textContent = '¡Número ganador!';
    }
}


// Función para animar ruleta física (números que bajan)
function animateRoulette(digitElement, targetDigit, delay) {
    const duration = 2000; // 2 segundos de giro
    const fps = 60; // Más frames para mayor fluidez
    const totalFrames = (duration / 1000) * fps;
    const frameDuration = duration / totalFrames;

    let currentFrame = 0;
    const target = parseInt(targetDigit);

    setTimeout(() => {
        const interval = setInterval(() => {
            if (currentFrame >= totalFrames) {
                clearInterval(interval);
                digitElement.textContent = target;
                digitElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    digitElement.style.transform = 'scale(1)';
                }, 200);
                return;
            }

            // Calcular posición Y para simular movimiento hacia abajo
            const progress = currentFrame / totalFrames;

            if (progress < 0.9) {
                // Fase inicial: números pasan rápidamente
                const cycleProgress = (progress * 8) % 1; // 8 ciclos rápidos
                const yOffset = cycleProgress * 60 - 30; // Movimiento más amplio
                const randomNum = Math.floor(Math.random() * 10);

                digitElement.textContent = randomNum;
                digitElement.style.transform = `translateY(${yOffset}px)`;
            } else {
                // Fase final: se acerca al número objetivo
                const approachProgress = (progress - 0.9) / 0.1;
                const targetY = 0;
                const currentY = 30 * (1 - approachProgress);

                if (Math.random() < approachProgress * 3) {
                    digitElement.textContent = target;
                } else {
                    digitElement.textContent = Math.floor(Math.random() * 10);
                }

                digitElement.style.transform = `translateY(${currentY}px)`;
            }

            currentFrame++;
        }, frameDuration);
    }, delay);
}

// Añadir la animación al CSS
const style = document.createElement('style');
style.textContent = `
    .roulette-digit {
        transform-origin: center;
        transition: transform 0.1s ease-out;
    }

    .winner-number {
        display: inline-block;
        animation: pulse 1s infinite;
        color: var(--christmas-gold);
        text-shadow: 0 0 15px rgba(241, 196, 15, 0.9);
    }
`;
document.head.appendChild(style);

// Función para reproducir sonido de victoria
function playVictorySound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('No se pudo reproducir el sonido:', e));
}

// Función para crear luces navideñas parpadeantes
function createChristmasLights() {
    const lightsContainer = document.createElement('div');
    lightsContainer.className = 'lights';
    document.body.appendChild(lightsContainer);
    
    // Crear luces
    for (let i = 0; i < 50; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        light.style.left = Math.random() * 100 + 'vw';
        light.style.top = Math.random() * 100 + 'vh';
        light.style.animationDelay = Math.random() * 3 + 's';
        light.style.animationDuration = 2 + Math.random() * 4 + 's';
        
        // Colores navideños aleatorios
        const colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff9900'];
        light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Tamaño aleatorio
        const size = 3 + Math.random() * 7;
        light.style.width = size + 'px';
        light.style.height = size + 'px';
        
        lightsContainer.appendChild(light);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado');

    // Crear luces navideñas
    createChristmasLights();

    // Efecto de nieve en el título al cargar
    const title = document.querySelector('.title');
    title.style.animation = 'none';
    void title.offsetWidth; // Trigger reflow
    title.style.animation = 'titlePulse 2s infinite alternate';

    // Efecto de brillo en el contenedor principal
    const container = document.querySelector('.container');
    const countdownItems = document.querySelectorAll('.countdown-item span:first-child');
    const winnerName = document.querySelector('.winner-name');
    const ornaments = document.querySelectorAll('.ornament');

    container.style.animation = 'borderGlow 3s infinite alternate';
    countdownItems.forEach(item => (item.style.animation = 'pulse 2s infinite'));
    winnerName.style.animation = 'borderDance 3s infinite linear';
    ornaments.forEach((ornament, index) => {
        ornament.style.animation = `swing ${3 + Math.random() * 2}s infinite ease-in-out`;
        ornament.style.animationDelay = `${index * 0.5}s`;
    });

    // Verificar si ya pasó la fecha del sorteo
    const currentTime = new Date().getTime();
    if (currentTime >= drawDate) {
        console.log('Sorteo terminado, mostrando ganador oficial...');
        // Después del sorteo: usar número fijo oficial
        winnerNumber = '452';

        // Aplicar estilo inmediatamente
        const winnerElement = document.querySelector('.winner-name .placeholder');
        if (winnerElement) {
            winnerElement.style.fontSize = '6rem';
            winnerElement.style.color = 'var(--christmas-gold)';
            winnerElement.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        }

        selectWinner();
    } else {
        // Antes del sorteo: número fijo para pruebas
        winnerNumber = '452';      console.log('Número de prueba fijo:', winnerNumber);

        // Iniciar contador
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Efecto de nieve al hacer clic
    function createClickSnowflake(e) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = e.clientX + 'px';
        snowflake.style.top = e.clientY + 'px';
        snowflake.style.position = 'fixed';
        snowflake.style.pointerEvents = 'none';
        snowflake.style.animation = 'snow 2s linear forwards';
        document.body.appendChild(snowflake);

        // Eliminar el copo después de la animación
        setTimeout(() => {
            snowflake.remove();
        }, 2000);
    }

    // Agregar efecto de nieve al hacer clic
    document.addEventListener('click', createClickSnowflake);

    // Efecto de brillo en enlaces y botones al pasar el ratón
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transition = 'all 0.3s ease';
            element.style.filter = 'brightness(1.2)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.filter = 'brightness(1)';
        });
    });
});
