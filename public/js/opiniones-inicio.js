document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('resenasDestacadas');
    if (!contenedor) return;

    try {
        const response = await fetch('/api/opiniones?soloVisibles=true');
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const opiniones = await response.json();
        const destacadas = opiniones
            .filter(opinion => Number(opinion.calificacion) > 0)
            .sort((a, b) => {
                const diferenciaCalificacion = Number(b.calificacion) - Number(a.calificacion);
                if (diferenciaCalificacion !== 0) return diferenciaCalificacion;
                return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
            })
            .slice(0, 2);

        if (destacadas.length === 0) {
            contenedor.innerHTML = '<p class="text-sm text-gray-500">Pronto compartiremos las opiniones de nuestros clientes.</p>';
            return;
        }

        contenedor.innerHTML = destacadas.map(opinion => {
            const calificacion = Math.min(5, Math.max(1, Math.round(Number(opinion.calificacion))));
            const estrellas = '★'.repeat(calificacion) + '☆'.repeat(5 - calificacion);

            return `
                <article class="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-left">
                    <div class="flex justify-between items-center gap-3 mb-2">
                        <p class="font-semibold text-[#D94D1A]">${escapeHTML(opinion.nombre)}</p>
                        <span class="text-[#C28B16] tracking-wider" aria-label="${calificacion} de 5 estrellas">${estrellas}</span>
                    </div>
                    <blockquote class="italic text-gray-700 leading-relaxed">“${escapeHTML(opinion.comentario)}”</blockquote>
                </article>
            `;
        }).join('');
    } catch (error) {
        console.error('No se pudieron cargar las reseñas destacadas:', error);
        contenedor.innerHTML = '<p class="text-sm text-gray-500">No fue posible cargar las reseñas en este momento.</p>';
    }
});
