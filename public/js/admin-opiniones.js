let listaOpinionesGlobal = []; // Guardamos todo aquí para poder filtrar

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedorOpinionesAdmin');
    
    // --- 1. CREAR EL FILTRO DE ESTRELLAS DINÁMICAMENTE ---
    // Inyectamos el filtro arriba de las tarjetas
    const divFiltro = document.createElement('div');
    divFiltro.className = "mb-6 flex items-center gap-3";
    divFiltro.innerHTML = `
        <label class="font-bold text-gray-700">Filtrar por:</label>
        <select id="filtroEstrellas" class="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-[#D94D1A] shadow-sm">
            <option value="todas">Todas las estrellas</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</option>
            <option value="4">⭐⭐⭐⭐ (4 Estrellas)</option>
            <option value="3">⭐⭐⭐ (3 Estrellas)</option>
            <option value="2">⭐⭐ (2 Estrellas)</option>
            <option value="1">⭐ (1 Estrella)</option>
        </select>
    `;
    contenedor.parentNode.insertBefore(divFiltro, contenedor);

    document.getElementById('filtroEstrellas').addEventListener('change', (e) => {
        const valor = e.target.value;
        if(valor === 'todas') {
            renderizarOpiniones(listaOpinionesGlobal);
        } else {
            const filtradas = listaOpinionesGlobal.filter(op => op.calificacion == valor);
            renderizarOpiniones(filtradas);
        }
    });

    // --- 2. CARGAR TODAS LAS OPINIONES ---
    window.cargarOpinionesAdmin = async () => {
        try {
            const response = await fetch('/api/opiniones');
            listaOpinionesGlobal = await response.json();
            
            // Volvemos a aplicar el filtro actual al recargar
            const filtroActual = document.getElementById('filtroEstrellas').value;
            if(filtroActual === 'todas') {
                renderizarOpiniones(listaOpinionesGlobal);
            } else {
                renderizarOpiniones(listaOpinionesGlobal.filter(op => op.calificacion == filtroActual));
            }
        } catch (error) {
            if(contenedor) contenedor.innerHTML = '<div class="col-span-full text-center text-red-500 font-bold py-10">Error de conexión</div>';
        }
    };

    // --- 3. DIBUJAR LAS TARJETAS EN PANTALLA ---
    const renderizarOpiniones = (opiniones) => {
        if (!contenedor) return;
        
        if (opiniones.length === 0) {
            contenedor.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10 font-bold text-lg">No hay opiniones con este filtro.</div>';
            return;
        }

        let html = '';
        opiniones.forEach(op => {
            const fechaObj = new Date(op.fecha_creacion);
            fechaObj.setMinutes(fechaObj.getMinutes() + fechaObj.getTimezoneOffset());
            const fechaFormateada = fechaObj.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
            
            let estrellasHtml = '';
            for(let i=1; i<=5; i++) {
                estrellasHtml += i <= op.calificacion ? '<span class="text-yellow-400 text-lg">★</span>' : '<span class="text-gray-300 text-lg">★</span>';
            }

            const esVisible = (op.visible == 1 || op.visible === true);
            const badgeVisible = esVisible 
                ? `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-200 uppercase">Visible</span>`
                : `<span class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-300 uppercase">Oculta</span>`;

            const btnVisible = esVisible
                ? `<button onclick="cambiarVisibilidad(${op.id}, false)" class="text-xs font-bold text-orange-500 hover:underline">Ocultar</button>`
                : `<button onclick="cambiarVisibilidad(${op.id}, true)" class="text-xs font-bold text-green-600 hover:underline">Mostrar</button>`;

            const estiloTarjeta = esVisible ? 'bg-white opacity-100' : 'bg-gray-50 opacity-60';

            // HTML de la respuesta (Si ya la respondiste)
            const htmlRespuesta = op.respuesta 
                ? `<div class="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <p class="text-[11px] font-bold text-blue-800 mb-1">Tu respuesta:</p>
                     <p class="text-xs text-blue-900 italic">"${op.respuesta}"</p>
                   </div>`
                : `<button onclick="responder(${op.id})" class="mt-3 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">💬 Responder al cliente</button>`;

            html += `
            <article class="${estiloTarjeta} border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-gray-900 text-md capitalize">${op.nombre}</h4>
                        <span class="text-[10px] text-gray-400 font-medium">${fechaFormateada}</span>
                    </div>
                    <div class="flex">${estrellasHtml}</div>
                </div>
                
                <p class="text-sm text-gray-600 italic mb-2 leading-relaxed flex-grow">"${op.comentario}"</p>
                
                ${htmlRespuesta}
                
                <div class="flex justify-between items-center border-t border-gray-100 pt-3 mt-4">
                    <div class="flex items-center gap-2">
                        ${badgeVisible}
                        ${btnVisible}
                    </div>
                    <button onclick="eliminar(${op.id})" class="text-xs font-bold text-red-500 hover:text-red-700 hover:underline">🗑️ Eliminar</button>
                </div>
            </article>`;
        });
        contenedor.innerHTML = html;
    };

    // --- 4. FUNCIONES DE ACCIÓN (Visibilidad, Responder, Eliminar) ---
    window.cambiarVisibilidad = async (id, estadoVisible) => {
        try {
            await fetch(`/api/opiniones/${id}/visibilidad`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: estadoVisible })
            });
            cargarOpinionesAdmin();
        } catch(e) { alert("❌ Error de conexión"); }
    };

    window.eliminar = async (id) => {
        if(confirm("⚠️ ¿Estás seguro de eliminar esta opinión PARA SIEMPRE?")) {
            try {
                await fetch(`/api/opiniones/${id}`, { method: 'DELETE' });
                cargarOpinionesAdmin();
            } catch(e) { alert("❌ Error de conexión"); }
        }
    };

    window.responder = async (id) => {
        const respuesta = prompt("Escribe tu respuesta pública para este cliente:");
        if (respuesta && respuesta.trim() !== "") {
            try {
                await fetch(`/api/opiniones/${id}/respuesta`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ respuesta: respuesta.trim() })
                });
                cargarOpinionesAdmin();
            } catch(e) { alert("❌ Error de conexión"); }
        }
    };

    cargarOpinionesAdmin();
});