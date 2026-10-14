window.filterMenu = (category, btnElement) => {
    const contenedorMenu = document.getElementById('contenedorMenu');
    if (!contenedorMenu) return;

    const items = contenedorMenu.querySelectorAll('.menu-item');
    let visibles = 0;

    items.forEach(item => {
        const coincide = category === 'todos' || item.getAttribute('data-category') === category;
        item.classList.remove('fade-in');
        item.style.display = coincide ? 'flex' : 'none';
        if (coincide) {
            visibles += 1;
            void item.offsetWidth;
            item.classList.add('fade-in');
        }
    });

    let estadoVacio = document.getElementById('menuCategoriaVacia');
    if (!estadoVacio) {
        estadoVacio = document.createElement('div');
        estadoVacio.id = 'menuCategoriaVacia';
        estadoVacio.className = 'col-span-full rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center text-gray-600 shadow-sm';
        estadoVacio.setAttribute('role', 'status');
        estadoVacio.textContent = 'Próximamente tendremos opciones deliciosas en esta categoría';
        contenedorMenu.appendChild(estadoVacio);
    }
    estadoVacio.classList.toggle('hidden', visibles > 0);

    if (btnElement) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.className = 'filter-btn bg-white text-gray-600 border border-gray-200 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 hover:text-[#D94D1A] mr-2 transition-all shadow-sm shrink-0';
        });
        btnElement.className = 'filter-btn bg-[#D94D1A] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-orange-500/30 mr-2 transition-all shrink-0';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const contenedorMenu = document.getElementById('contenedorMenu');

    const cargarMenuPublico = async () => {
        try {
            // 1. Pedimos los datos a la cocina (Nuestra API REST)
            const response = await fetch('/api/platos');
            const platos = await response.json();

            let htmlMenu = '';

            // 2. Diccionario para traducir el ID de MySQL al "data-category"
            const categoriasFiltro = {
                1: 'pescados',
                2: 'carnes',
                3: 'sopas',
                4: 'entradas'
            };

            // 3. Recorremos los platos
            platos.forEach(plato => {
                const categoriaFiltro = plato.categoria || 'Adicionales';
                const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(plato.precio);

                const img = typeof plato.imagen === 'string' && /^\/uploads\/[A-Za-z0-9._-]+$/.test(plato.imagen)
                    ? plato.imagen
                    : 'https://via.placeholder.com/400x300?text=Sabor+Llanero';
                // ==========================================
                // 🎨 NUEVO DISEÑO DE TARJETA (Imagen con margen y botón de reserva)
                // ==========================================
                htmlMenu += `
                    <div class="menu-item bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col group fade-in" data-category="${escapeHTML(categoriaFiltro)}">
                        
                        <div class="relative h-60 w-full p-4 pb-0 overflow-hidden">
                            <img src="${escapeHTML(img)}" alt="${escapeHTML(plato.nombre)}" class="w-full h-full object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500">
                        </div>
                        
                        <div class="p-5 flex flex-col flex-grow">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-[#61161D] leading-tight">${escapeHTML(plato.nombre)}</h3>
                                <span class="text-[#D94D1A] font-extrabold text-lg whitespace-nowrap ml-3">${precio}</span>
                            </div>
                            <p class="text-gray-500 text-sm flex-grow mb-5 leading-relaxed">${escapeHTML(plato.descripcion || 'Una delicia tradicional de El Arenal.')}</p>
                            
                            <a href="/reservas" class="w-full py-2.5 rounded-xl bg-orange-50 text-[#D94D1A] font-bold text-sm hover:bg-[#D94D1A] hover:text-white border border-orange-100 hover:border-[#D94D1A] transition-colors active:scale-95 flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Reservar Mesa
                            </a>
                        </div>
                    </div>
                `;
            });

            // 4. Inyectamos las tarjetas en el contenedor
            if (contenedorMenu) {
                if (platos.length === 0) {
                    contenedorMenu.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 font-bold text-xl">¡Nuestro chef está preparando un nuevo menú! 👨‍🍳 Vuelve pronto.</div>`;
                } else {
                    contenedorMenu.innerHTML = htmlMenu;
                }
            }

        } catch (error) {
            console.error("Error al cargar el menú público:", error);
            if (contenedorMenu) {
                contenedorMenu.innerHTML = `<div class="col-span-full text-center py-12 text-red-500 font-bold">Ocurrió un error al cargar el menú. Por favor, recarga la página.</div>`;
            }
        }
    };
    cargarMenuPublico();
    cargarMenuPublico();
});