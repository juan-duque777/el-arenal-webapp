document.addEventListener('DOMContentLoaded', () => {
    
    const reservaForm = document.getElementById('reservaForm');
    const successMessage = document.getElementById('successMessage');

    if (reservaForm) {
        reservaForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitamos que la página se recargue al enviar

            // 1. Recolectamos todos los datos que el cliente escribió
            const datosReserva = {
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value,
                fecha: document.getElementById('fecha').value,
                hora: document.getElementById('hora').value,
                personas: document.getElementById('personas').value,
                notas: document.getElementById('notas').value
            };

            try {
                // 2. Enviamos la petición POST a nuestra API (La cocina)
                const response = await fetch('http://localhost:3000/api/reservas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosReserva)
                });

                const data = await response.json();

                if (response.ok) {
                    // 3. ¡Éxito! Ocultamos el formulario y mostramos el mensaje de "¡Reserva Solicitada!"
                    reservaForm.classList.add('hidden');
                    successMessage.classList.remove('hidden');
                    
                    // Opcional: Limpiamos el formulario por si acaso
                    reservaForm.reset();
                } else {
                    // Si el backend nos manda algún error (ej. faltaron datos)
                    alert("❌ Error: " + data.mensaje);
                }

            } catch (error) {
                console.error("Error al enviar la reserva:", error);
                alert("❌ Ocurrió un error de conexión con el servidor. Intenta de nuevo.");
            }
        });
    }
});