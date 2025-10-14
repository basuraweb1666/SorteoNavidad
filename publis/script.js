// Fecha fija del sorteo: Hoy a las 9:15:40 (próximos minutos para pruebas)
const now = new Date();
const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 15, 40).getTime();

// Función para obtener el número ganador oficial desde el servidor
async function fetchOfficialWinner() {
  try {
    const res = await fetch('/.netlify/functions/generate-winner');
    if (!res.ok) throw new Error('Error al obtener ganador');
    const data = await res.json();
    console.log('Número ganador oficial:', data.winner);
    return data.winner;
  } catch (e) {
    console.error('Error obteniendo ganador:', e);
    return '000'; // fallback
  }
}

// Número ganador (se obtiene del servidor)
let winnerNumber = null;

// Elementos del DOM
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const winnerNameElement = document.getElementById('winnerName');
const winnerDisplay = document.getElementById('winnerDisplay');

// Variable global para el intervalo del contador
let countdownInterval;

// Función para actualizar el contador
function updateCountdown() {
    const now = new Date().getTime();
    let distance = drawDate - now;

    // Si faltan 5 segundos o menos, mostrar la cuenta regresiva en el área del ganador
    if (distance <= 5000 && distance > 0) {
        const secondsLeft = Math.ceil(distance / 1000);
        const winnerElement = document.querySelector('.winner-name .placeholder');

        if (winnerElement) {
            // Mostrar desde 4 hacia abajo en el área del ganador
            winnerElement.textContent = Math.max(secondsLeft, 1);
            winnerElement.style.fontSize = '6rem';
            winnerElement.style.color = 'var(--christmas-gold)';
            winnerElement.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        }

        // Poner el contador principal a cero
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';

        // Cambiar el texto del contador principal
        const countdownTitle = document.querySelector('.countdown-container h2');
        if (countdownTitle) {
            countdownTitle.textContent = '¡Preparados para el sorteo!';
        }
    }

    // Si la cuenta atrás ha terminado
    if (distance <= 0) {
        clearInterval(countdownInterval);

        // Obtener el número ganador oficial del servidor
        fetchOfficialWinner().then(winner => {
            winnerNumber = winner;
            startConfetti();
            selectWinner();
        });
        return;
    }

    // Cálculos para días, horas, minutos y segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar el DOM solo si el contador es mayor a 5 segundos
    if (distance > 5000) {
        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    }

    // Efecto de parpadeo en el separador cada segundo
    const separators = document.querySelectorAll('.countdown-separator');
    separators.forEach(separator => {
        separator.style.animation = 'none';
        void separator.offsetWidth; // Trigger reflow
        separator.style.animation = 'blink 1s infinite';
    });
}

// Función para seleccionar un número ganador aleatorio
function selectWinner() {
    const winnerElement = document.querySelector('.winner-name .placeholder');

    // Usar el número ganador oficial (ya generado y guardado)
    const formattedNumber = `Nº ${String(winnerNumber).padStart(3, '0')}`;

    if (winnerElement) {
        winnerElement.textContent = formattedNumber;
        winnerElement.classList.add('winner-number');
        winnerElement.style.fontSize = '6rem';
        winnerElement.style.color = 'var(--christmas-gold)';
        winnerElement.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        winnerElement.style.animation = 'zoomIn 0.5s ease-out';
    }

    playVictorySound();
    startConfetti();

    if (winnerDisplay) {
        winnerDisplay.querySelector('h2').textContent = '¡Número ganador!';
    }
}

// Añadir la animación al CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes zoomIn {
        from {
            transform: scale(0.5);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
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

// Función para crear confeti
function startConfetti() {
    const colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    
    for (let i = 0; i < 100; i++) {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }
    
    // Seguir lanzando confeti cada 3 segundos
    setInterval(() => {
        for (let i = 0; i < 20; i++) {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }
    }, 3000);
}

// Función auxiliar para crear partículas de confeti
function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = color;
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-20px';
    confetti.style.zIndex = '1000';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    
    document.body.appendChild(confetti);
    
    // Animación del confeti
    const animation = confetti.animate(
        [
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
            { 
                transform: `translate(${Math.random() * 400 - 200}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0 
            }
        ],
        {
            duration: 3000 + Math.random() * 4000,
            easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)',
            fill: 'forwards'
        }
    );
    
    // Eliminar el elemento después de la animación
    animation.onfinish = () => {
        confetti.remove();
    };
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
        // Después del sorteo: obtener número del servidor
        fetchOfficialWinner().then(winner => {
            winnerNumber = winner;

            // Aplicar estilo inmediatamente
            const winnerElement = document.querySelector('.winner-name .placeholder');
            if (winnerElement) {
                winnerElement.style.fontSize = '6rem';
                winnerElement.style.color = 'var(--christmas-gold)';
                winnerElement.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
            }

            selectWinner();
        });
    } else {
        // Antes del sorteo: generar número diferente cada carga para pruebas
        winnerNumber = Math.floor(Math.random() * 1000);
        console.log('Número de prueba generado:', winnerNumber);

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
