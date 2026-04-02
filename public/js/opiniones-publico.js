document.addEventListener('DOMContentLoaded', () => {
    
    const opinionForm = document.getElementById('opinionForm');
    const contenedorOpiniones = document.getElementById('contenedorOpiniones');

    // --- 1. CARGAR OPINIONES VISIBLES ---
    const cargarOpiniones = async () => {
        try {
            // Pedimos a la API SOLO las opiniones visibles
            const response = await fetch('http://localhost:3000/api/opiniones?soloVisibles=true');
            const opiniones = await response.json();
            
            const totalOpiniones = opiniones.length;
            let promedio = 0;
            
            if (totalOpiniones > 0) {
                // Sumamos todas las calificaciones y dividimos por el total
                const sumaCalificaciones = opiniones.reduce((suma, op) => suma + op.calificacion, 0);
                promedio = (sumaCalificaciones / totalOpiniones).toFixed(1); // Redondea a 1 decimal (ej: 4.5)
            }

            // Actualizamos los textos en el HTML
            const domPromedio = document.getElementById('promedioTexto');
            const domEstrellas = document.getElementById('promedioEstrellas');
            const domTotal = document.getElementById('totalOpinionesTexto');

            if (domPromedio && domEstrellas && domTotal) {
                domPromedio.textContent = promedio > 0 ? promedio : "0.0";
                domTotal.textContent = totalOpiniones > 0 ? `Basado en ${totalOpiniones} opiniones reales` : "Sé el primero en darnos tu opinión";
                
                // Dibujamos las estrellitas del resumen
                let estrellasHtml = '';
                const promedioRedondeado = Math.round(promedio);
                for(let i=1; i<=5; i++) {
                    if(i <= promedioRedondeado) {
                        estrellasHtml += '★';
                    } else {
                        estrellasHtml += '<span class="text-gray-300">★</span>'; 
                    }
                }
                domEstrellas.innerHTML = estrellasHtml;
            }
            
            if (contenedorOpiniones) {
                let html = '';
                
                if (opiniones.length === 0) {
                    html = '<div class="col-span-full text-center py-10 text-gray-500 font-bold text-lg">Sé el primero en calificar tu experiencia en El Arenal 🌟</div>';
                } else {
                    opiniones.forEach(op => {
                        // 1.1 Generar las estrellas amarillas según la calificación
                        let estrellasHtml = '';
                        for(let i=1; i<=5; i++) {
                            if(i <= op.calificacion) {
                                // Estrella llena (Amarilla)
                                estrellasHtml += `<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
                            } else {
                                // Estrella vacía (Gris)
                                estrellasHtml += `<svg class="w-5 h-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
                            }
                        }

                        // 1.2 Formatear la fecha
                        const fechaObj = new Date(op.fecha_creacion);
                        const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
                        const fechaFormateada = fechaObj.toLocaleDateString('es-CO', opcionesFecha);

                        // 1.3 Dibujar la tarjeta
                        // 1.3 Dibujar la tarjeta
                        
                        // Validamos si el admin respondió
                        const htmlRespuesta = op.respuesta ? `
                            <div class="mt-4 bg-[#fcf8f2] p-4 rounded-xl border border-[#e8d5c4]">
                                <p class="text-xs font-bold text-[#D94D1A] mb-1 flex items-center gap-1">👑 Respuesta de El Arenal:</p>
                                <p class="text-sm text-gray-700 italic leading-relaxed">"${op.respuesta}"</p>
                            </div>
                        ` : '';

                        html += `
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow fade-in-up">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-gray-900 text-lg capitalize">${op.nombre}</h3>
                                <div class="flex gap-1">${estrellasHtml}</div>
                            </div>
                            <p class="text-gray-600 italic mb-2 leading-relaxed">"${op.comentario}"</p>
                            
                            ${htmlRespuesta}

                            <div class="text-xs text-gray-400 font-medium mt-4">${fechaFormateada}</div>
                        </div>`;
                    });
                }
                contenedorOpiniones.innerHTML = html;
            }
        } catch (error) {
            console.error("Error al cargar opiniones:", error);
        }
    };

    // --- 2. ENVIAR NUEVA OPINIÓN ---
    if (opinionForm) {
        opinionForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Capturamos el input de radio (estrellas) que esté seleccionado
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            const calificacion = ratingInput ? ratingInput.value : 0;
            
            if (calificacion == 0) {
                alert('¡Hey! No olvides seleccionar cuántas estrellas le das a tu experiencia. ⭐');
                return;
            }

            const datosOpinion = {
                nombre: document.getElementById('nombre').value,
                calificacion: parseInt(calificacion),
                comentario: document.getElementById('comentario').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/opiniones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosOpinion)
                });

                if (response.ok) {
                    // Ocultar formulario de forma elegante
                    opinionForm.style.display = 'none';
                    document.querySelector('.bg-gray-50.py-3').style.display = 'none'; // contenedor de estrellas
                    
                    // Mostrar un mensaje de éxito si existe, o usar una alerta bonita
                    const msjExito = document.getElementById('successMessage');
                    if(msjExito) {
                        msjExito.classList.remove('hidden');
                    } else {
                        // Si no tienes div de exito, creamos uno dinámico
                        const pTag = document.querySelector('p.text-sm.mb-6');
                        if(pTag) pTag.innerHTML = '<span class="text-green-600 font-bold text-lg">✅ ¡Gracias por compartir tu experiencia!</span>';
                    }
                    
                    // Recargar la lista para que el cliente vea su comentario ahí mismo
                    cargarOpiniones();
                } else {
                    alert("❌ Ocurrió un error al enviar tu opinión.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("❌ Error de conexión al servidor.");
            }
        });
    }

    // Arrancamos el motor para cargar las que ya existan
    cargarOpiniones();
});