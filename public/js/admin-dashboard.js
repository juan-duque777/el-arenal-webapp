document.addEventListener('DOMContentLoaded', () => {

    const cargarDashboard = async () => {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();

            // 1. Pintar Estadísticas Principales
            const domReservas = document.getElementById('stat-reservas');
            if (domReservas) domReservas.textContent = data.stats.totalReservas;

            const domOpiniones = document.getElementById('stat-opiniones');
            if (domOpiniones) domOpiniones.textContent = data.stats.totalOpiniones;

            const domPromedio = document.getElementById('stat-promedio');
            if (domPromedio) domPromedio.textContent = data.stats.promedio;

            // 2. Pintar Reservas de Hoy
            const contenedorReservas = document.getElementById('lista-reservas-hoy');
            if (data.reservasHoy.length === 0) {
                contenedorReservas.innerHTML = '<li class="text-center text-gray-500 py-4">No hay reservas programadas para hoy.</li>';
            } else {
                let htmlReservas = '';
                data.reservasHoy.forEach(reserva => {
                    // Formatear hora (ej: 14:00:00 -> 2:00 PM)
                    const horaFormateada = new Date(`2000-01-01T${reserva.hora}`).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
                    
                    htmlReservas += `
                    <li class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#D94D1A] font-bold">
                                ${reserva.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900">${reserva.nombre}</h4>
                                <p class="text-sm text-gray-500">${reserva.personas} personas • ${reserva.telefono}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="block font-bold text-[#D94D1A]">${horaFormateada}</span>
                            <span class="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 uppercase mt-1 inline-block">${reserva.estado}</span>
                        </div>
                    </li>`;
                });
                contenedorReservas.innerHTML = htmlReservas;
            }

            // 3. Pintar Actividad Reciente
            const contenedorActividad = document.getElementById('lista-actividad');
            if (data.actividad.length === 0) {
                contenedorActividad.innerHTML = '<div class="text-center text-gray-500 py-4">No hay actividad reciente.</div>';
            } else {
                let htmlActividad = '';
                data.actividad.forEach(act => {
                    let estrellas = '';
                    for(let i=0; i<act.calificacion; i++) estrellas += '★';

                    htmlActividad += `
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-50 bg-white hover:shadow-sm transition-all">
                        <div class="p-2 bg-blue-50 text-blue-500 rounded-xl mt-0.5">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-800"><span class="font-bold">${act.nombre}</span> dejó una opinión de <span class="text-yellow-500 font-bold">${estrellas}</span></p>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-1 italic">"${act.comentario}"</p>
                        </div>
                    </div>`;
                });
                contenedorActividad.innerHTML = htmlActividad;
            }

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        }
    };

    cargarDashboard();
});