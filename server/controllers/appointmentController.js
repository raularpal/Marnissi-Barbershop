const Appointment = require('../models/Appointment');
const getCalendarClient = require('../config/googleCalendar');
const sendEmail = require('../config/email');
const { startOfDay, endOfDay, parseISO, format, addMinutes, isSameMinute, getDay } = require('date-fns');

// Helper to generate slots
const generateSlots = (dateStr) => {
    const slots = [];
    const date = parseISO(dateStr); // Expecting YYYY-MM-DD
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ...

    if (dayOfWeek === 0) return []; // Closed on Sunday

    // Morning: 9:00 - 14:00 (Last slot 13:30)
    let current = new Date(date);
    current.setHours(9, 0, 0, 0);
    const morningEnd = new Date(date);
    morningEnd.setHours(13, 30, 0, 0);

    while (current <= morningEnd) {
        slots.push(new Date(current));
        current = addMinutes(current, 30);
    }

    // Afternoon: 16:00 - 21:00 (Last slot 20:30)
    current = new Date(date);
    current.setHours(16, 0, 0, 0);
    const afternoonEnd = new Date(date);
    afternoonEnd.setHours(20, 30, 0, 0);

    while (current <= afternoonEnd) {
        slots.push(new Date(current));
        current = addMinutes(current, 30);
    }

    return slots;
};

exports.getSlots = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ message: 'Date is required' });

        const slots = generateSlots(date);

        // Find appointments for this date
        const start = startOfDay(parseISO(date));
        const end = endOfDay(parseISO(date));

        const appointments = await Appointment.find({
            date: { $gte: start, $lte: end }
        });

        // Filter slots
        const availableSlots = slots.filter(slot => {
            const count = appointments.filter(appt => isSameMinute(appt.date, slot)).length;
            return count < 2; // Max 2 per slot
        }).map(slot => format(slot, 'HH:mm'));

        res.json(availableSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const { name, phone, email, date, time } = req.body;

        // Construct Date object
        // date is YYYY-MM-DD, time is HH:mm
        const dateTimeStr = `${date}T${time}:00`;
        const appointmentDate = new Date(dateTimeStr);

        // Double check availability
        const existing = await Appointment.find({ date: appointmentDate });
        if (existing.length >= 2) {
            return res.status(400).json({ message: 'Slot no longer available' });
        }

        // Google Calendar Integration
        let googleEventId = null;
        try {
            const { calendar, calendarId } = getCalendarClient();
            const event = {
                summary: `Cita: ${name}`,
                description: `Tel: ${phone}\nEmail: ${email}`,
                start: {
                    dateTime: appointmentDate.toISOString(),
                    timeZone: process.env.TIMEZONE || 'Europe/Madrid',
                },
                end: {
                    dateTime: addMinutes(appointmentDate, 30).toISOString(),
                    timeZone: process.env.TIMEZONE || 'Europe/Madrid',
                },
            };

            const response = await calendar.events.insert({
                calendarId,
                resource: event,
            });
            googleEventId = response.data.id;
        } catch (gError) {
            console.error('Google Calendar Error:', gError);
            // Proceed even if GCal fails? Maybe not.
            // For now, we log and proceed, but in prod maybe fail.
        }

        // Save to DB
        const newAppointment = new Appointment({
            name,
            phone,
            email,
            date: appointmentDate,
            googleEventId
        });

        await newAppointment.save();

        // Send Email
        const cancelLink = `${process.env.CLIENT_URL}/cancel/${newAppointment._id}`;
        const emailHtml = `
      <h1>Confirmación de Cita - Marnissi Barbershop</h1>
      <p>Hola ${name},</p>
      <p>Tu cita ha sido confirmada.</p>
      <ul>
        <li><strong>Fecha:</strong> ${date}</li>
        <li><strong>Hora:</strong> ${time}</li>
      </ul>
      <p>Si necesitas cancelar, haz clic aquí:</p>
      <a href="${cancelLink}" style="background: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Cancelar Cita</a>
    `;

        await sendEmail(email, 'Confirmación de Cita', emailHtml);

        res.status(201).json(newAppointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Remove from Google Calendar
        if (appointment.googleEventId) {
            try {
                const { calendar, calendarId } = getCalendarClient();
                await calendar.events.delete({
                    calendarId,
                    eventId: appointment.googleEventId,
                });
            } catch (gError) {
                console.error('Google Calendar Delete Error:', gError);
            }
        }

        // Remove from DB
        await Appointment.findByIdAndDelete(id);

        res.json({ message: 'Cita cancelada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
