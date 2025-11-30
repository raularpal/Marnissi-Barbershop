// Initialize Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Admin password (change this!)
const ADMIN_PASSWORD = "marnissi2024";

let currentDate = new Date();
let searchTimeout;

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    initializeAdminDate();
});

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;

    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
    } else {
        document.getElementById('login-error').style.display = 'block';
        setTimeout(() => {
            document.getElementById('login-error').style.display = 'none';
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    document.getElementById('admin-password').value = '';
}

function showAdminPanel() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('admin-page').classList.add('active');
    loadAppointments();
}

function initializeAdminDate() {
    const dateInput = document.getElementById('admin-date');
    dateInput.value = formatDate(currentDate);
    updateDateDisplay();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
    if (!date || isNaN(date.getTime())) return 'Selecciona una fecha';

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
}

function updateDateDisplay() {
    document.getElementById('date-display').textContent = formatDateDisplay(currentDate);
}

function changeDate(days) {
    if (isNaN(currentDate.getTime())) currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);
    document.getElementById('admin-date').value = formatDate(currentDate);
    updateDateDisplay();
    loadAppointments();
}

function triggerSearch() {
    const query = document.getElementById('admin-search').value;
    clearTimeout(searchTimeout);
    if (!query) {
        loadAppointments();
        return;
    }
    searchAppointments(query);
}

function handleSearch(query) {
    clearTimeout(searchTimeout);

    if (!query || query.length < 2) {
        if (query.length === 0) loadAppointments();
        return;
    }

    searchTimeout = setTimeout(() => {
        searchAppointments(query);
    }, 500);
}

async function searchAppointments(query) {
    const loading = document.getElementById('loading-appointments');
    const calendar = document.getElementById('appointments-calendar');
    const noAppointments = document.getElementById('no-appointments');
    const dateDisplay = document.getElementById('date-display');

    loading.style.display = 'block';
    calendar.innerHTML = '';
    noAppointments.style.display = 'none';
    dateDisplay.textContent = `Resultados para: "${query}"`;

    try {
        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
            .order('date_string', { ascending: false })
            .order('time', { ascending: true })
            .limit(20);

        if (error) throw error;

        loading.style.display = 'none';

        if (appointments.length === 0) {
            noAppointments.style.display = 'block';
            noAppointments.innerHTML = `<p style="font-size: 1.2rem;">🔍</p><p>No se encontraron resultados</p>`;
        } else {
            renderSearchResults(appointments);
        }

    } catch (error) {
        console.error('Error searching appointments:', error);
        loading.style.display = 'none';
        alert('Error en la búsqueda');
    }
}

function renderSearchResults(appointments) {
    const calendar = document.getElementById('appointments-calendar');

    const listContainer = document.createElement('div');
    listContainer.className = 'appointments-list';
    listContainer.style.gap = '1rem';

    appointments.forEach(appt => {
        const apptItem = document.createElement('div');
        apptItem.className = 'appointment-item';
        apptItem.style.background = 'var(--glass)';

        // Add date to the display since it's a mixed list
        apptItem.innerHTML = `
            <div class="appointment-info">
                <div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem;">
                    ${appt.date_string} - ${appt.time}
                </div>
                <h4>${appt.name}</h4>
                <div class="appointment-details">
                    <div class="detail-item">📞 ${appt.phone}</div>
                    <div class="detail-item">📧 ${appt.email}</div>
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn-cancel" onclick="cancelAppointment('${appt.id}', '${appt.name}', '${appt.time}', '${appt.email}', '${appt.date_string}')">
                    Cancelar
                </button>
            </div>
        `;
        listContainer.appendChild(apptItem);
    });

    calendar.appendChild(listContainer);
}

let currentMaxSlots = 2;

async function loadAppointments() {
    // Clear search input if loading by date
    const searchInput = document.getElementById('admin-search');
    // If we are loading appointments by date, we might want to clear the search results view
    // But if the user is typing, we shouldn't interfere. 
    // Usually loadAppointments is called by date change or init.

    const dateInput = document.getElementById('admin-date');
    if (!dateInput.value) {
        currentDate = new Date();
        dateInput.value = formatDate(currentDate);
    } else {
        const newDate = new Date(dateInput.value);
        if (isNaN(newDate.getTime())) {
            currentDate = new Date();
            dateInput.value = formatDate(currentDate);
        } else {
            currentDate = newDate;
        }
    }
    updateDateDisplay();

    const loading = document.getElementById('loading-appointments');
    const calendar = document.getElementById('appointments-calendar');
    const noAppointments = document.getElementById('no-appointments');

    loading.style.display = 'block';
    calendar.innerHTML = '';
    noAppointments.style.display = 'none';

    try {
        const dateString = formatDate(currentDate);

        // Fetch availability override
        const { data: availabilityData, error: availError } = await supabaseClient
            .from('daily_availability')
            .select('max_slots')
            .eq('date_string', dateString)
            .maybeSingle();

        if (availError) {
            console.error('Error fetching availability:', availError);
        }

        currentMaxSlots = availabilityData ? availabilityData.max_slots : 2;

        // Update select value
        const availSelect = document.getElementById('availability-select');
        if (availSelect) availSelect.value = currentMaxSlots;

        // Get appointments for this date
        const { data: appointments, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('date_string', dateString)
            .order('time', { ascending: true });

        if (error) throw error;

        loading.style.display = 'none';

        // Update stats
        updateStats(appointments, dateString);

        // Render calendar
        if (appointments.length === 0 && currentMaxSlots > 0) {
            noAppointments.style.display = 'block';
        } else if (currentMaxSlots === 0) {
            calendar.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--error);">
                    <p style="font-size: 2rem;">⛔</p>
                    <h3>CERRADO</h3>
                    <p>No hay disponibilidad para este día.</p>
                </div>
            `;
        } else {
            renderCalendar(appointments);
        }

    } catch (error) {
        console.error('Error loading appointments:', error);
        loading.style.display = 'none';
        alert('Error al cargar las citas. Revisa la consola.');
    }
}

async function setAvailability(slots) {
    slots = parseInt(slots);
    const dateString = formatDate(currentDate);

    try {
        if (slots === 2) {
            // Remove override (default)
            const { error } = await supabaseClient
                .from('daily_availability')
                .delete()
                .eq('date_string', dateString);
            if (error) throw error;
        } else {
            // Upsert override
            const { error } = await supabaseClient
                .from('daily_availability')
                .upsert({ date_string: dateString, max_slots: slots });
            if (error) throw error;
        }

        loadAppointments(); // Reload to update UI

    } catch (error) {
        console.error('Error setting availability:', error);
        alert('Error al guardar la disponibilidad');
    }
}

function updateStats(appointments, dateString) {
    // Total appointments
    document.getElementById('total-appointments').textContent = appointments.length;

    // Next appointment
    const now = new Date();
    const today = formatDate(now);
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let nextAppt = '--:--';
    if (dateString === today) {
        const upcoming = appointments.find(a => a.time > currentTime);
        if (upcoming) {
            nextAppt = upcoming.time;
        }
    } else if (appointments.length > 0) {
        nextAppt = appointments[0].time;
    }
    document.getElementById('next-appointment').textContent = nextAppt;

    // Available slots
    if (currentMaxSlots === 0) {
        document.getElementById('available-slots').textContent = '0 (Cerrado)';
        return;
    }

    const totalSlots = generateAllTimeSlots().length;
    const bookedSlots = {};
    appointments.forEach(a => {
        bookedSlots[a.time] = (bookedSlots[a.time] || 0) + 1;
    });

    // Calculate available based on currentMaxSlots
    // A slot is available if bookings < currentMaxSlots
    // Total capacity = totalSlots * currentMaxSlots
    // Used capacity = appointments.length
    // But we want "Huecos Disponibles" (slots that can accept at least one more person? or total seats left?)
    // Usually "Huecos" implies total seats left.

    const totalCapacity = totalSlots * currentMaxSlots;
    const availableCount = totalCapacity - appointments.length;

    document.getElementById('available-slots').textContent = Math.max(0, availableCount);
}

function generateAllTimeSlots() {
    const slots = [];

    // Morning: 9:00 - 13:30
    for (let hour = 9; hour < 14; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 13 || (hour === 13 && 30 < 60)) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Afternoon: 16:00 - 20:30
    for (let hour = 16; hour <= 20; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 20 || (hour === 20 && 30 <= 30)) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    return slots;
}

function renderCalendar(appointments) {
    const calendar = document.getElementById('appointments-calendar');
    const allSlots = generateAllTimeSlots();

    // Group appointments by time
    const appointmentsByTime = {};
    appointments.forEach(appt => {
        if (!appointmentsByTime[appt.time]) {
            appointmentsByTime[appt.time] = [];
        }
        appointmentsByTime[appt.time].push(appt);
    });

    const slotsGrid = document.createElement('div');
    slotsGrid.className = 'time-slots-grid';

    allSlots.forEach(time => {
        const slotRow = document.createElement('div');
        slotRow.className = 'time-slot-row';

        const appointments = appointmentsByTime[time] || [];
        if (appointments.length > 0) {
            slotRow.classList.add('has-appointments');
        }

        // Header
        const header = document.createElement('div');
        header.className = 'time-slot-header';
        header.innerHTML = `
            <div class="time-label">${time}</div>
            <div class="slot-count" style="background: ${appointments.length >= currentMaxSlots ? 'var(--error)' : 'var(--accent)'}">
                ${appointments.length}/${currentMaxSlots}
            </div>
        `;
        slotRow.appendChild(header);

        // Appointments
        if (appointments.length > 0) {
            const appointmentsList = document.createElement('div');
            appointmentsList.className = 'appointments-list';

            appointments.forEach(appt => {
                const apptItem = document.createElement('div');
                apptItem.className = 'appointment-item';
                apptItem.innerHTML = `
                    <div class="appointment-info">
                        <h4>${appt.name}</h4>
                        <div class="appointment-details">
                            <div class="detail-item">📞 ${appt.phone}</div>
                            <div class="detail-item">📧 ${appt.email}</div>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-cancel" onclick="cancelAppointment('${appt.id}', '${appt.name}', '${time}', '${appt.email}', '${appt.date_string}')">
                            Cancelar
                        </button>
                    </div>
                `;
                appointmentsList.appendChild(apptItem);
            });

            slotRow.appendChild(appointmentsList);
        } else {
            const empty = document.createElement('div');
            empty.className = 'empty-slot';
            empty.textContent = 'Sin citas';
            slotRow.appendChild(empty);
        }

        slotsGrid.appendChild(slotRow);
    });

    calendar.appendChild(slotsGrid);
}

async function cancelAppointment(id, name, time, email, date) {
    if (!confirm(`¿Estás seguro de cancelar la cita de ${name} a las ${time}?`)) {
        return;
    }

    try {
        // Send cancellation email
        const templateParams = {
            to_email: email,
            to_name: name,
            appointment_date: date,
            appointment_time: time,
            message: "Lamentamos informarle que su cita ha sido cancelada. Por favor, le invitamos a reservar una nueva hora a través de nuestra web. Disculpe las molestias."
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CANCEL_TEMPLATE_ID, templateParams);
            console.log('Cancellation email sent');
        } catch (emailError) {
            console.error('Error sending cancellation email:', emailError);
            alert('No se pudo enviar el correo de cancelación, pero se procederá a eliminar la cita.');
        }

        // Delete from Supabase
        const { error } = await supabaseClient
            .from('appointments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('Cita cancelada correctamente y correo enviado.');
        loadAppointments(); // Reload

    } catch (error) {
        console.error('Error canceling appointment:', error);
        alert('Error al cancelar la cita');
    }
}
