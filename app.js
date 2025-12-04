// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// State
let selectedDate = '';
let selectedTime = '';
let currentAppointment = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePicker();
    setupEventListeners();
    checkCancelLink();
});

function initializeDatePicker() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
}

function setupEventListeners() {
    const dateInput = document.getElementById('booking-date');
    dateInput.addEventListener('change', handleDateChange);

    const form = document.getElementById('booking-form');
    form.addEventListener('submit', handleFormSubmit);
}

// Navigation
function showHomePage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('home-page').classList.add('active');
    resetBookingForm();
}

function showBookingPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('booking-page').classList.add('active');
    handleDateChange(); // Load slots for default date
}

function showSuccessPage(appointmentData) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('success-page').classList.add('active');

    const detailsDiv = document.getElementById('appointment-details');
    detailsDiv.innerHTML = `
        <p><strong>${t('detailName')}:</strong> ${appointmentData.name}</p>
        <p><strong>${t('detailDate')}:</strong> ${appointmentData.date_string}</p>
        <p><strong>${t('detailTime')}:</strong> ${appointmentData.time}</p>
        <p style="margin-top: 1rem;">${t('successDetails').replace('{email}', appointmentData.email)}</p>
    `;
}

function resetBookingForm() {
    document.getElementById('step-1').classList.add('active');
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('booking-form').reset();
    selectedDate = '';
    selectedTime = '';
}

function backToStep1() {
    document.getElementById('step-1').classList.add('active');
    document.getElementById('step-2').classList.remove('active');
    selectedTime = '';
}

// Date and time selection
async function handleDateChange() {
    const dateInput = document.getElementById('booking-date');
    selectedDate = dateInput.value;

    if (!selectedDate) return;

    const slotsContainer = document.getElementById('slots-container');
    const loading = document.getElementById('loading');
    const slotsGrid = document.getElementById('slots-grid');
    const noSlots = document.getElementById('no-slots');

    slotsContainer.style.display = 'block';
    loading.style.display = 'block';
    slotsGrid.innerHTML = '';
    noSlots.style.display = 'none';

    try {
        const slots = await getAvailableSlots(selectedDate);
        loading.style.display = 'none';

        if (slots.length === 0) {
            noSlots.textContent = t('noSlots');
            noSlots.style.display = 'block';
        } else {
            renderSlots(slots);
        }
    } catch (error) {
        console.error('Error loading slots:', error);
        loading.style.display = 'none';
        showError(t('errorSlots'));
    }
}

function generateTimeSlots(date) {
    const slots = [];
    const dayOfWeek = new Date(date).getDay();

    // Sunday (0) is closed
    if (dayOfWeek === 0) return slots;

    // Morning: 9:00 - 13:30 (last slot)
    for (let hour = 9; hour < 14; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 13 || (hour === 13 && 30 < 60)) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    // Afternoon: 16:00 - 20:30 (last slot)
    for (let hour = 16; hour <= 20; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 20 || (hour === 20 && 30 <= 30)) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }

    return slots;
}

async function getAvailableSlots(date) {
    const allSlots = generateTimeSlots(date);

    // Get availability override
    const { data: availabilityData } = await supabase
        .from('daily_availability')
        .select('max_slots')
        .eq('date_string', date)
        .maybeSingle();

    const maxSlots = availabilityData ? availabilityData.max_slots : 2;

    // Get appointments for this date from Supabase
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('time')
        .eq('date_string', date);

    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }

    // Count bookings per slot
    const bookedSlots = {};
    appointments.forEach(appt => {
        const time = appt.time;
        bookedSlots[time] = (bookedSlots[time] || 0) + 1;
    });

    // Filter slots
    return allSlots.map(time => ({
        time,
        available: maxSlots > 0 && (bookedSlots[time] || 0) < maxSlots
    }));
}

function renderSlots(slots) {
    const slotsGrid = document.getElementById('slots-grid');
    slotsGrid.innerHTML = '';

    slots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.textContent = slot.time;

        if (!slot.available) {
            slotDiv.classList.add('disabled');
        } else {
            slotDiv.addEventListener('click', () => selectTimeSlot(slot.time, slotDiv));
        }

        slotsGrid.appendChild(slotDiv);
    });
}

function selectTimeSlot(time, element) {
    selectedTime = time;

    // Update UI
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    element.classList.add('selected');

    // Move to step 2
    setTimeout(() => {
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');

        const selectedInfo = document.getElementById('selected-datetime');
        selectedInfo.textContent = t('selectedDatetime')
            .replace('{date}', selectedDate)
            .replace('{time}', selectedTime);
    }, 300);
}

// Form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const confirmBtnText = document.getElementById('confirm-btn-text');

    submitBtn.disabled = true;
    confirmBtnText.textContent = t('confirmingText');

    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;

    try {
        // Check for existing appointment with same phone on this date
        const { data: existingAppointments, error: checkError } = await supabase
            .from('appointments')
            .select('time')
            .eq('date_string', selectedDate)
            .eq('phone', phone);

        if (checkError) throw checkError;

        if (existingAppointments && existingAppointments.length > 0) {
            const existingTime = existingAppointments[0].time;
            throw new Error(`Ya tienes una cita reservada para el día ${selectedDate} a las ${existingTime}. Por favor, revisa tu correo electrónico.`);
        }

        // Double-check availability
        const slots = await getAvailableSlots(selectedDate);
        const slot = slots.find(s => s.time === selectedTime);

        if (!slot || !slot.available) {
            throw new Error(t('errorSlotTaken'));
        }

        // Create appointment in Supabase
        const appointmentData = {
            name,
            phone,
            email,
            date_string: selectedDate,
            time: selectedTime,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('appointments')
            .insert([appointmentData])
            .select()
            .single();

        if (error) throw error;

        appointmentData.id = data.id;

        // Send email
        await sendConfirmationEmail(appointmentData);

        // Show success
        showSuccessPage(appointmentData);

    } catch (error) {
        console.error('Error booking appointment:', error);
        showError(error.message || t('errorBooking'));
        submitBtn.disabled = false;
        confirmBtnText.textContent = t('confirmBtnText');
    }
}

async function sendConfirmationEmail(appointment) {
    const cancelUrl = `${APP_URL}?cancel=${appointment.id}`;

    const templateParams = {
        to_email: appointment.email,
        to_name: appointment.name,
        appointment_date: appointment.date_string,
        appointment_time: appointment.time,
        cancel_url: cancelUrl
    };

    console.log('Sending email with params:', templateParams);
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw - we still want to complete the booking
    }
}

// Cancel appointment
function checkCancelLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const cancelId = urlParams.get('cancel');

    if (cancelId) {
        showCancelPage(cancelId);
    }
}

async function showCancelPage(appointmentId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('cancel-page').classList.add('active');

    const content = document.getElementById('cancel-content');
    content.innerHTML = `
        <p>${t('cancelConfirm')}</p>
        <div style="margin-top: 2rem;">
            <button class="btn-primary" style="background: var(--error); margin-right: 1rem;" onclick="confirmCancel('${appointmentId}')">
                ${t('cancelYes')}
            </button>
            <button class="btn-secondary" onclick="showHomePage()">
                ${t('cancelNo')}
            </button>
        </div>
    `;
}

async function confirmCancel(appointmentId) {
    const content = document.getElementById('cancel-content');
    content.innerHTML = `<div class="loader"></div><p>${t('canceling')}</p>`;

    try {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId);

        if (error) throw error;

        content.innerHTML = `
            <div class="success-icon">✓</div>
            <h2 style="color: var(--success)">${t('cancelSuccess')}</h2>
            <p>${t('cancelSuccessMsg')}</p>
            <button class="btn-primary" onclick="showHomePage()" style="margin-top: 2rem;">
                ${t('homeBtn')}
            </button>
        `;
    } catch (error) {
        console.error('Error canceling appointment:', error);
        content.innerHTML = `
            <h2 style="color: var(--error)">${t('cancelError')}</h2>
            <p>${t('cancelErrorMsg')}</p>
            <button class="btn-secondary" onclick="showHomePage()" style="margin-top: 2rem;">
                ${t('homeBtn')}
            </button>
        `;
    }
}

// Error handling
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}
