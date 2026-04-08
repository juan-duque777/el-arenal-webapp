let listaReservasGlobal = []; 
let reservasMostradas = []; // Lo que se ve en pantalla actualmente (para exportar)

document.addEventListener('DOMContentLoaded', () => {
    
    const tablaReservasBody = document.getElementById('tablaReservasBody');
    const contenedorTarjetasMovil = document.getElementById('contenedorTarjetasMovil');
    const filtroFecha = document.getElementById('filtroFecha');
    const btnExportar = document.getElementById('btnExportar');
    const badgeReservas = document.getElementById('badgeReservas');

    // --- 1. CARGAR RESERVAS DESDE LA BASE DE DATOS ---
    window.cargarReservas = async () => {
        try {
            const response = await fetch('/api/reservas');
            listaReservasGlobal = await response.json();
            
            // Calculamos cuántas pendientes hay para la bolita de notificaciones
            const pendientes = listaReservasGlobal.filter(r => r.estado === 'pendiente').length;
            if (badgeReservas) {
                badgeReservas.innerText = pendientes;
                badgeReservas.style.display = pendientes > 0 ? 'inline-flex' : 'none';
            }

            // Si hay un filtro de fecha activo, respetarlo; si no, mostrar todas
            aplicarFiltroFecha(); 
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            if(tablaReservasBody) tablaReservasBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error de conexión con la base de datos</td></tr>';
        }
    };

    // --- 2. DIBUJAR EN PANTALLA ---
    const renderizarReservas = (reservas) => {
        reservasMostradas = reservas; // Guardamos lo que se está viendo
        let htmlTabla = '';
        let htmlMovil = '';

        if (reservas.length === 0) {
            htmlTabla = '<tr><td colspan="5" class="text-center py-8 text-gray-500 font-bold">No hay reservas para mostrar.</td></tr>';
            htmlMovil = '<div class="text-center py-8 text-gray-500 font-bold">No hay reservas para mostrar.</div>';
        }

        reservas.forEach(reserva => {
            // Formatear Fecha
            const fechaObj = new Date(reserva.fecha);
            fechaObj.setMinutes(fechaObj.getMinutes() + fechaObj.getTimezoneOffset()); 
            const opcionesFecha = { weekday: 'short', day: 'numeric', month: 'short' };
            const fechaFormateada = fechaObj.toLocaleDateString('es-CO', opcionesFecha);

            // ==========================================
            // 🟢 LÓGICA DE MENSAJES DE WHATSAPP
            // ==========================================
            let mensajeWa = `¡Hola ${reserva.nombre}! Te escribimos del Restaurante El Arenal.`; // Mensaje base
            
            if (reserva.estado === 'confirmada') {
                mensajeWa = `¡Hola ${reserva.nombre}! Tu reserva en El Arenal para ${reserva.personas} personas el ${fechaFormateada} a las ${reserva.hora} ha sido CONFIRMADA ✅. Por favor recuerda ser muy puntual con tu hora de llegada para no perder tu mesa. ¡Te esperamos!`;
            } else if (reserva.estado === 'rechazada') {
                mensajeWa = `¡Hola ${reserva.nombre}! Te escribimos de El Arenal. Lamentablemente en este momento no tenemos mesas disponibles para tu solicitud del ${fechaFormateada} a las ${reserva.hora} ❌. Esperamos poder atenderte en otra ocasión.`;
            }

            // Codificamos el mensaje para que funcione en la URL de WhatsApp
            const urlWhatsApp = `https://wa.me/57${reserva.telefono}?text=${encodeURIComponent(mensajeWa)}`;

            // Determinar Colores y Botones según el estado
            let badgeEstado = '';
            let botonesAccion = '';

            if (reserva.estado === 'pendiente') {
                badgeEstado = `<span class="bg-yellow-50 text-[#C28B16] text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200 flex items-center w-max gap-1.5 shadow-sm"><span class="w-2 h-2 rounded-full bg-[#C28B16] animate-pulse"></span> Pendiente</span>`;
                botonesAccion = `
                    <button onclick="cambiarEstado(${reserva.id}, 'confirmada')" class="bg-[#268C79] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1c6b5c] transition shadow-md mr-2 active:scale-95">Confirmar</button>
                    <button onclick="cambiarEstado(${reserva.id}, 'rechazada')" class="text-red-500 font-semibold hover:text-red-700 hover:underline text-xs">Rechazar</button>`;
            } 
            else if (reserva.estado === 'confirmada') {
                badgeEstado = `<span class="bg-green-50 text-[#268C79] text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 flex items-center w-max gap-1.5"><span class="w-2 h-2 rounded-full bg-[#268C79]"></span> Confirmada</span>`;
                botonesAccion = `<span class="text-gray-400 text-xs italic">Aprobada</span>`;
            } 
            else if (reserva.estado === 'rechazada') {
                badgeEstado = `<span class="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 flex items-center w-max gap-1.5"><span class="w-2 h-2 rounded-full bg-red-600"></span> Rechazada</span>`;
                botonesAccion = `<span class="text-gray-400 text-xs italic">Cancelada</span>`;
            }

            // --- VISTA DE PC ---
            htmlTabla += `
                <tr class="bg-white hover:bg-gray-50 transition border-b border-gray-100">
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-900 text-base capitalize">${reserva.nombre}</div>
                        <div class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M19.5 12.5a2.5 2.5 0 0 1-2.5 2.5h-10a2.5 2.5 0 0 1-2.5-2.5V3.5a2.5 2.5 0 0 1 2.5-2.5h10a2.5 2.5 0 0 1 2.5 2.5v9Zm-11-9a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 8.5 14h10a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 18.5 3.5h-10Z"/></svg>
                            <a href="${urlWhatsApp}" target="_blank" class="hover:text-green-600 hover:underline font-semibold" title="Enviar WhatsApp">${reserva.telefono}</a>
                        </div>
                        ${reserva.notas ? `<p class="text-[10px] text-orange-500 mt-1 italic w-48 truncate">Nota: ${reserva.notas}</p>` : ''}
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-semibold text-gray-800 capitalize">${fechaFormateada}</div>
                        <div class="text-xs text-gray-500 mt-1 font-mono">${reserva.hora}</div>
                    </td>
                    <td class="px-6 py-4 font-bold text-[#D94D1A] text-center text-lg">${reserva.personas}</td>
                    <td class="px-6 py-4">${badgeEstado}</td>
                    <td class="px-6 py-4 text-right">${botonesAccion}</td>
                </tr>
            `;

            // --- VISTA MÓVIL ---
            htmlMovil += `
                <div class="p-5 bg-white flex flex-col gap-4 border-b border-gray-100">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-gray-900 text-lg capitalize">${reserva.nombre}</h3>
                            <a href="${urlWhatsApp}" target="_blank" class="text-sm text-green-600 font-medium mt-1 flex items-center gap-1 hover:underline">📞 ${reserva.telefono}</a>
                        </div>
                        ${badgeEstado}
                    </div>
                    <div class="flex justify-between text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span class="font-medium text-gray-700 capitalize">${fechaFormateada} - ${reserva.hora}</span>
                        <span class="font-bold text-[#D94D1A]">${reserva.personas} pax</span>
                    </div>
                    ${reserva.notas ? `<p class="text-xs text-orange-600 italic px-1">Nota: ${reserva.notas}</p>` : ''}
                    
                    ${reserva.estado === 'pendiente' ? `
                    <div class="flex gap-3 mt-2">
                        <button onclick="cambiarEstado(${reserva.id}, 'confirmada')" class="w-full bg-[#268C79] text-white py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition">Confirmar</button>
                        <button onclick="cambiarEstado(${reserva.id}, 'rechazada')" class="w-full bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition">Rechazar</button>
                    </div>` : ''}
                </div>
            `;
        });

        if (tablaReservasBody) tablaReservasBody.innerHTML = htmlTabla;
        if (contenedorTarjetasMovil) contenedorTarjetasMovil.innerHTML = htmlMovil;
    };

    // --- 3. ACTUALIZAR ESTADO (PUT) ---
    window.cambiarEstado = async (id, nuevoEstado) => {
        let mensajeConfirmacion = nuevoEstado === 'confirmada' 
            ? "¿Seguro que quieres CONFIRMAR esta reserva?" 
            : "⚠️ ¿Seguro que quieres RECHAZAR esta reserva? (No se puede deshacer)";

        if (confirm(mensajeConfirmacion)) {
            try {
                const response = await fetch(`/api/reservas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                if (response.ok) {
                    cargarReservas(); // Recarga los datos al terminar
                } else {
                    alert("❌ Error al actualizar");
                }
            } catch (error) { alert("❌ Error de conexión"); }
        }
    };

    // --- 4. FILTRAR POR FECHA ---
    const aplicarFiltroFecha = () => {
        if (filtroFecha && filtroFecha.value) {
            // Comparamos la fecha seleccionada con la fecha de la base de datos
            const filtradas = listaReservasGlobal.filter(r => {
                const f = new Date(r.fecha);
                f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
                const stringFecha = f.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                return stringFecha === filtroFecha.value;
            });
            renderizarReservas(filtradas);
        } else {
            renderizarReservas(listaReservasGlobal);
        }
    };

    if (filtroFecha) {
        filtroFecha.addEventListener('change', aplicarFiltroFecha);
    }

    // --- 5. EXPORTAR A EXCEL (CSV) ---
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            if (reservasMostradas.length === 0) {
                alert("No hay datos para exportar en esta fecha.");
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            // Cabeceras de Excel
            csvContent += "ID,Cliente,Telefono,Fecha,Hora,Personas,Estado,Notas\n";

            // Datos
            reservasMostradas.forEach(r => {
                const f = new Date(r.fecha);
                f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
                const fechaCorta = f.toISOString().split('T')[0];
                
                // Limpiar notas de comas para no romper el Excel
                const notasLimpias = r.notas ? r.notas.replace(/,/g, " ") : ""; 
                
                let fila = `${r.id},${r.nombre},${r.telefono},${fechaCorta},${r.hora},${r.personas},${r.estado},${notasLimpias}`;
                csvContent += fila + "\n";
            });

            // Forzar descarga del archivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "Reservas_El_Arenal.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Arrancamos el motor
    cargarReservas();
});