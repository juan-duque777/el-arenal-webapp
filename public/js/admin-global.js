document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inyectamos un contenedor invisible para las notificaciones flotantes (Toasts)
    const toastContainer = document.createElement('div');
    toastContainer.id = 'global-toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-[100] flex flex-col gap-3 overflow-hidden';
    document.body.appendChild(toastContainer);

    // 2. Memoria del navegador: Recordamos cuántas reservas había la última vez
    let lastPendingCount = localStorage.getItem('pendingReservasCount') || 0;

    // 3. La función espía (Vigila la base de datos)
    const vigilarReservas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/reservas');
            if (!response.ok) return;
            
            const reservas = await response.json();
            
            // Filtramos solo las que dicen "pendiente"
            const pendientes = reservas.filter(r => r.estado === 'pendiente');
            const currentPendingCount = pendientes.length;

            // A) Actualizamos el "Circulito" rojo del menú lateral (si existe en la pantalla actual)
            const badge = document.getElementById('badgeReservas');
            if (badge) {
                badge.textContent = currentPendingCount;
                badge.style.display = currentPendingCount > 0 ? 'inline-flex' : 'none'; // Se oculta si hay 0
            }

            // B) Si hay MÁS reservas pendientes que la última vez que revisamos... ¡LANZAMOS LA ALERTA!
            if (currentPendingCount > lastPendingCount) {
                mostrarNotificacion('🔔 ¡Nueva Reserva!', 'Acaba de ingresar una nueva solicitud de mesa. ¡Revísala!');
            }

            // Guardamos el nuevo número en la memoria para comparar la próxima vez
            lastPendingCount = currentPendingCount;
            localStorage.setItem('pendingReservasCount', currentPendingCount);

        } catch (error) {
            console.error('Error vigilando reservas en segundo plano:', error);
        }
    };

    // 4. Función para dibujar la tarjetita flotante bonita
    const mostrarNotificacion = (titulo, mensaje) => {
        const toast = document.createElement('div');
        // Estilos usando tu paleta de colores de El Arenal
        toast.className = 'bg-white border-l-4 border-[#D94D1A] shadow-2xl p-4 rounded-xl flex items-start gap-3 w-80 transform transition-transform duration-500 translate-x-[120%]';
        
        toast.innerHTML = `
            <div class="text-[#D94D1A] mt-0.5">
                <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <div>
                <h4 class="font-bold text-gray-900 text-sm">${titulo}</h4>
                <p class="text-xs text-gray-600 mt-1">${mensaje}</p>
                <a href="/admin-reservas" class="text-xs font-bold text-[#D94D1A] hover:underline mt-2 inline-block">Ver bandeja de reservas</a>
            </div>
        `;
        
        toastContainer.appendChild(toast);

        // Hacemos que entre deslizándose mágicamente
        setTimeout(() => toast.classList.remove('translate-x-[120%]'), 50);

        // La desaparecemos automáticamente a los 6 segundos
        setTimeout(() => {
            toast.classList.add('translate-x-[120%]');
            setTimeout(() => toast.remove(), 500);
        }, 6000);
    };

    // Arrancamos el motor al entrar a la página
    vigilarReservas();

    // Le decimos que vigile cada 10 segundos (10000 milisegundos)
    setInterval(vigilarReservas, 10000);
});