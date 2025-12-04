const translations = {
    es: {
        heroText: 'Estilo, precisión y elegancia. Reserva tu cita hoy mismo y vive la experiencia premium.',
        bookBtnText: 'Reservar Cita',
        feature1Title: 'Profesionales Expertos',
        feature1Text: 'Nuestro equipo de barberos cuenta con años de experiencia en cortes clásicos y modernos.',
        feature2Title: 'Reserva Online',
        feature2Text: 'Sistema inteligente de reservas que se sincroniza automáticamente con tu calendario.',
        feature3Title: 'Experiencia Premium',
        feature3Text: 'Ambiente exclusivo y atención personalizada para cada cliente.',
        scheduleTitle: 'Horario',
        scheduleDays: 'Lunes a Sábado',
        scheduleClosed: 'Domingo: Cerrado',
        backBtn: 'Volver',
        bookingTitle: 'Reserva tu Cita',
        labelDate: 'Selecciona una fecha',
        availableSlotsTitle: 'Horarios Disponibles',
        noSlots: 'No hay horarios disponibles para esta fecha.',
        selectedDatetime: 'Reserva para el {date} a las {time}',
        changeTimeBtn: 'Cambiar hora',
        labelName: 'Nombre Completo',
        labelPhone: 'Teléfono',
        labelEmail: 'Correo Electrónico',
        confirmBtnText: 'Confirmar Reserva',
        confirmingText: 'Confirmando...',
        successTitle: '¡Reserva Confirmada!',
        successMessage: 'Gracias por confiar en Marnissi Barbershop.',
        successDetails: 'Hemos enviado un correo de confirmación a {email}.',
        homeBtn: 'Volver al Inicio',
        cancelTitle: 'Cancelar Cita',
        cancelConfirm: '¿Estás seguro de que quieres cancelar tu cita?',
        cancelYes: 'Sí, Cancelar',
        cancelNo: 'No, Volver',
        canceling: 'Cancelando...',
        cancelSuccess: 'Cita Cancelada',
        cancelSuccessMsg: 'Tu cita ha sido cancelada correctamente.',
        cancelError: 'Error',
        cancelErrorMsg: 'No se pudo cancelar la cita. Es posible que ya haya sido cancelada.',
        errorSlots: 'Error al cargar horarios. Inténtalo de nuevo.',
        errorBooking: 'Error al reservar. Inténtalo de nuevo.',
        errorSlotTaken: 'Lo sentimos, este horario ya no está disponible.',
        detailName: 'Nombre',
        detailDate: 'Fecha',
        detailTime: 'Hora'
    },
    ca: {
        heroText: 'Estil, precisió i elegància. Reserva la teva cita avui mateix i viu l\'experiència premium.',
        bookBtnText: 'Reservar Cita',
        feature1Title: 'Professionals Experts',
        feature1Text: 'El nostre equip de barbers compta amb anys d\'experiència en talls clàssics i moderns.',
        feature2Title: 'Reserva Online',
        feature2Text: 'Sistema intel·ligent de reserves que se sincronitza automàticament amb el teu calendari.',
        feature3Title: 'Experiència Premium',
        feature3Text: 'Ambient exclusiu i atenció personalitzada per a cada client.',
        scheduleTitle: 'Horari',
        scheduleDays: 'Dilluns a Dissabte',
        scheduleClosed: 'Diumenge: Tancat',
        backBtn: 'Tornar',
        bookingTitle: 'Reserva la teva Cita',
        labelDate: 'Selecciona una data',
        availableSlotsTitle: 'Horaris Disponibles',
        noSlots: 'No hi ha horaris disponibles per a aquesta data.',
        selectedDatetime: 'Reserva per al {date} a les {time}',
        changeTimeBtn: 'Canviar hora',
        labelName: 'Nom Complet',
        labelPhone: 'Telèfon',
        labelEmail: 'Correu Electrònic',
        confirmBtnText: 'Confirmar Reserva',
        confirmingText: 'Confirmant...',
        successTitle: 'Reserva Confirmada!',
        successMessage: 'Gràcies per confiar en Marnissi Barbershop.',
        successDetails: 'Hem enviat un correu de confirmació a {email}.',
        homeBtn: 'Tornar a l\'Inici',
        cancelTitle: 'Cancel·lar Cita',
        cancelConfirm: 'Estàs segur que vols cancel·lar la teva cita?',
        cancelYes: 'Sí, Cancel·lar',
        cancelNo: 'No, Tornar',
        canceling: 'Cancel·lant...',
        cancelSuccess: 'Cita Cancel·lada',
        cancelSuccessMsg: 'La teva cita ha estat cancel·lada correctament.',
        cancelError: 'Error',
        cancelErrorMsg: 'No s\'ha pogut cancel·lar la cita. És possible que ja hagi estat cancel·lada.',
        errorSlots: 'Error en carregar horaris. Torna-ho a intentar.',
        errorBooking: 'Error en reservar. Torna-ho a intentar.',
        errorSlotTaken: 'Ho sentim, aquest horari ja no està disponible.',
        detailName: 'Nom',
        detailDate: 'Data',
        detailTime: 'Hora'
    }
};

let currentLang = 'es';

function changeLanguage(lang) {
    currentLang = lang;

    // Update button states
    document.getElementById('btn-es').classList.toggle('active', lang === 'es');
    document.getElementById('btn-ca').classList.toggle('active', lang === 'ca');

    // Update all translatable content
    updateTranslations();

    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

function updateTranslations() {
    const t = translations[currentLang];

    // Home page
    const heroText = document.getElementById('hero-text');
    if (heroText) heroText.textContent = t.heroText;

    const bookBtnText = document.getElementById('book-btn-text');
    if (bookBtnText) bookBtnText.textContent = t.bookBtnText;

    const feature1Title = document.getElementById('feature1-title');
    if (feature1Title) feature1Title.textContent = t.feature1Title;

    const feature1Text = document.getElementById('feature1-text');
    if (feature1Text) feature1Text.textContent = t.feature1Text;

    const feature2Title = document.getElementById('feature2-title');
    if (feature2Title) feature2Title.textContent = t.feature2Title;

    const feature2Text = document.getElementById('feature2-text');
    if (feature2Text) feature2Text.textContent = t.feature2Text;

    const feature3Title = document.getElementById('feature3-title');
    if (feature3Title) feature3Title.textContent = t.feature3Title;

    const feature3Text = document.getElementById('feature3-text');
    if (feature3Text) feature3Text.textContent = t.feature3Text;

    const scheduleTitle = document.getElementById('schedule-title');
    if (scheduleTitle) scheduleTitle.textContent = t.scheduleTitle;

    const scheduleDays = document.getElementById('schedule-days');
    if (scheduleDays) scheduleDays.textContent = t.scheduleDays;

    const scheduleClosed = document.getElementById('schedule-closed');
    if (scheduleClosed) scheduleClosed.textContent = t.scheduleClosed;

    // Booking page
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.textContent = t.backBtn;

    const bookingTitle = document.getElementById('booking-title');
    if (bookingTitle) bookingTitle.textContent = t.bookingTitle;

    const labelDate = document.getElementById('label-date');
    if (labelDate) labelDate.textContent = t.labelDate;

    const availableSlotsTitle = document.getElementById('available-slots-title');
    if (availableSlotsTitle) availableSlotsTitle.textContent = t.availableSlotsTitle;

    const changeTimeBtn = document.getElementById('change-time-btn');
    if (changeTimeBtn) changeTimeBtn.textContent = t.changeTimeBtn;

    const labelName = document.getElementById('label-name');
    if (labelName) labelName.textContent = t.labelName;

    const labelPhone = document.getElementById('label-phone');
    if (labelPhone) labelPhone.textContent = t.labelPhone;

    const labelEmail = document.getElementById('label-email');
    if (labelEmail) labelEmail.textContent = t.labelEmail;

    const confirmBtnText = document.getElementById('confirm-btn-text');
    if (confirmBtnText) confirmBtnText.textContent = t.confirmBtnText;

    // Success page
    const successTitle = document.getElementById('success-title');
    if (successTitle) successTitle.textContent = t.successTitle;

    const successMessage = document.getElementById('success-message');
    if (successMessage) successMessage.textContent = t.successMessage;

    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) homeBtn.textContent = t.homeBtn;
}

function t(key) {
    return translations[currentLang][key] || key;
}

// Load saved language preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang === 'ca') {
        changeLanguage('ca');
    }
});
