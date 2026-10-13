document.addEventListener('DOMContentLoaded', () => {
    
    const reservaForm = document.getElementById('reservaForm');
    const successMessage = document.getElementById('successMessage');
    const fechaInput = document.getElementById('fecha');
    const horaInput = document.getElementById('hora');
    const horaError = document.getElementById('horaError');
    const reservaError = document.getElementById('reservaError');

    const validarHorario = () => {
        const hora = horaInput.value;
        const horarioValido = !hora || (hora >= '12:00' && hora <= '22:00');
        horaError.textContent = horarioValido ? '' : 'El horario de atención para reservas es de 12:00 p. m. a 10:00 p. m.';
        horaError.classList.toggle('hidden', horarioValido);
        horaInput.setAttribute('aria-invalid', String(!horarioValido));
        return horarioValido;
    };

    if (horaInput) {
        horaInput.addEventListener('input', validarHorario);
        horaInput.addEventListener('change', validarHorario);
        horaInput.addEventListener('invalid', () => {
            if (horaInput.validity.rangeUnderflow || horaInput.validity.rangeOverflow) {
                validarHorario();
            }
        });
    }

    if (fechaInput) {
        fechaInput.min = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }

    if (reservaForm) {
        reservaForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitamos que la página se recargue al enviar
            if (!validarHorario()) {
                horaInput.focus();
                return;
            }
            horaError.classList.add('hidden');
            reservaError.classList.add('hidden');
            const submitButton = reservaForm.querySelector('button[type="submit"]');
            const contenidoOriginal = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.textContent = 'Cargando...';

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
                const response = await fetch('/api/reservas', {
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
                    reservaError.textContent = data.mensaje || 'No fue posible enviar la solicitud. Revisa los datos e intenta de nuevo.';
                    reservaError.classList.remove('hidden');
                }

            } catch (error) {
                console.error("Error al enviar la reserva:", error);
                reservaError.textContent = 'Ocurrió un error de conexión. Intenta de nuevo.';
                reservaError.classList.remove('hidden');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = contenidoOriginal;
            }
        });
    }
});