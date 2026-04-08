let listaPlatos = []; 
let platoEnEdicionId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    const formNuevoPlato = document.getElementById('formNuevoPlato');
    const formEditarPlato = document.getElementById('formEditarPlato'); 
    const tablaPlatosBody = document.getElementById('tablaPlatosBody');
    const contenedorTarjetasMovil = document.getElementById('contenedorTarjetasMovil');
    const buscador = document.querySelector('input[placeholder="Buscar plato..."]');

    window.cargarPlatos = async () => {
        try {
            const response = await fetch('/api/platos');
            listaPlatos = await response.json(); 
            renderizarHTML(listaPlatos); 
        } catch (error) { console.error("Error al cargar la tabla:", error); }
    };

    const renderizarHTML = (platosA_Dibujar) => {
        let htmlTabla = '';
        let htmlMovil = '';

        platosA_Dibujar.forEach(plato => {
            const cat = plato.categoria || 'Sin Categoría';
            const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(plato.precio);
            const img = plato.imagen ? plato.imagen : 'https://via.placeholder.com/100?text=Sin+Foto';

            htmlTabla += `
                <tr class="bg-white hover:bg-gray-50 transition">
                    <td class="px-6 py-4 flex items-center gap-4">
                        <img src="${img}" class="w-14 h-14 rounded-xl object-cover shadow-sm">
                        <div>
                            <div class="font-bold text-gray-900 text-base">${plato.nombre}</div>
                            <p class="text-xs text-gray-500 w-48 truncate">${plato.descripcion || ''}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4"><span class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">${cat}</span></td>
                    <td class="px-6 py-4 font-extrabold text-[#D94D1A] text-base">${precio}</td>
                    <td class="px-6 py-4"><span class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Activo</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="prepararEdicion(${plato.id})" class="text-blue-500 hover:text-blue-700 font-bold mr-3">Editar</button>
                        <button onclick="borrarPlato(${plato.id})" class="text-red-400 hover:text-red-600 font-bold">Borrar</button>
                    </td>
                </tr>
            `;

            htmlMovil += `
                <div class="p-5 bg-white flex flex-col gap-3">
                    <div class="flex items-center gap-4">
                        <img src="${img}" class="w-20 h-20 rounded-2xl object-cover shadow-sm">
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-900 text-lg leading-tight">${plato.nombre}</h3>
                            <span class="text-[#D94D1A] font-extrabold text-lg">${precio}</span>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4 mt-2">
                        <button onclick="prepararEdicion(${plato.id})" class="text-blue-500 font-bold text-sm">Editar</button>
                        <button onclick="borrarPlato(${plato.id})" class="text-red-500 font-bold text-sm">Borrar</button>
                    </div>
                </div>
            `;
        });

        if (tablaPlatosBody) tablaPlatosBody.innerHTML = htmlTabla || '<tr><td colspan="5" class="text-center py-4">No hay platos</td></tr>';
        if (contenedorTarjetasMovil) contenedorTarjetasMovil.innerHTML = htmlMovil || '<div class="text-center py-4">No hay platos</div>';
    };

    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            renderizarHTML(listaPlatos.filter(p => p.nombre.toLowerCase().includes(texto))); 
        });
    }

    // --- 2. CREAR NUEVO PLATO ---
    if (formNuevoPlato) {
        formNuevoPlato.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombrePlato').value);
            formData.append('precio', document.getElementById('precioPlato').value);
            formData.append('categoria_id', document.getElementById('categoriaPlato').value);
            formData.append('descripcion', document.getElementById('descripcionPlato').value);
            
            const archivo = document.getElementById('imagenPlato').files[0];
            if(archivo) formData.append('imagen', archivo);

            try {
                const response = await fetch('/api/platos', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (response.ok) {
                    alert("✅ " + data.mensaje);
                    formNuevoPlato.reset();
                    // SOLUCIÓN: Cambiado a toggle para que coincida con el HTML
                    document.querySelector('[data-modal-toggle="crud-modal"]').click(); 
                    cargarPlatos(); 
                } else alert("❌ Error: " + data.mensaje);
            } catch (error) { 
                console.error("Error creando plato:", error);
                alert("❌ Error de conexión"); 
            }
        });
    }

    // --- 3. ACTUALIZAR PLATO ---
    if (formEditarPlato) {
        formEditarPlato.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const formData = new FormData();
            formData.append('nombre', document.getElementById('editNombrePlato').value);
            formData.append('precio', document.getElementById('editPrecioPlato').value);
            formData.append('categoria_id', document.getElementById('editCategoriaPlato').value);
            formData.append('descripcion', document.getElementById('editDescripcionPlato').value);
            
            const archivo = document.getElementById('editImagenPlato').files[0];
            if(archivo) formData.append('imagen', archivo);

            try {
                const response = await fetch(`/api/platos/${platoEnEdicionId}`, {
                    method: 'PUT',
                    body: formData
                });
                const data = await response.json();
                if (response.ok) {
                    alert("✅ " + data.mensaje);
                    formEditarPlato.reset();
                    document.getElementById('btnCerrarEditModal').click(); 
                    cargarPlatos(); 
                } else alert("❌ Error: " + data.mensaje);
            } catch (error) { 
                console.error("Error editando plato:", error);
                alert("❌ Error de conexión"); 
            }
        });
    }

    cargarPlatos();
});

window.prepararEdicion = (id) => {
    const plato = listaPlatos.find(p => p.id === id);
    if (!plato) return;

    document.getElementById('editNombrePlato').value = plato.nombre;
    document.getElementById('editPrecioPlato').value = plato.precio;
    document.getElementById('editCategoriaPlato').value = plato.categoria || "";
    document.getElementById('editDescripcionPlato').value = plato.descripcion || "";
    document.getElementById('editImagenPlato').value = "";

    document.getElementById('editImagenActual').src = plato.imagen ? plato.imagen : 'https://via.placeholder.com/100?text=Sin+Foto';

    platoEnEdicionId = id;
    document.getElementById('btnAbrirEditModal').click();
};

window.borrarPlato = async (id) => {
    if (confirm("⚠️ ¿Estás seguro de que quieres eliminar este plato y su imagen para siempre?")) {
        try {
            const response = await fetch(`/api/platos/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok) {
                alert("✅ " + data.mensaje);
                cargarPlatos(); 
            } else alert("❌ " + data.mensaje);
        } catch (error) { 
            console.error("Error borrando plato:", error);
            alert("❌ Error de conexión"); 
        }
    }
};