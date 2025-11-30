import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSunday } from 'date-fns';
import { getSlots, bookAppointment } from '../services/api';

const Booking = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        name: '',
        phone: '',
        email: ''
    });

    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        if (formData.date) {
            fetchSlots(formData.date);
        }
    }, [formData.date]);

    const fetchSlots = async (date) => {
        setLoading(true);
        setError('');
        try {
            const slots = await getSlots(date);
            setAvailableSlots(slots);
        } catch (err) {
            console.error(err);
            setError('Error al cargar horarios. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setFormData({ ...formData, date: e.target.value, time: '' });
    };

    const handleSlotSelect = (time) => {
        setFormData({ ...formData, time });
        setStep(2);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await bookAppointment(formData);
            navigate('/success', { state: { appointment: formData } });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al reservar. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Generate next 14 days for date picker (excluding Sundays if desired, but input type=date handles this poorly, so we stick to native picker or validate)
    // For better UX, we could use a custom date picker, but native is fine for MVP.

    return (
        <div className="container">
            <div className="card">
                <h2>Reserva tu Cita</h2>

                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

                {step === 1 && (
                    <div>
                        <div className="input-group">
                            <label>Selecciona una fecha</label>
                            <input
                                type="date"
                                value={formData.date}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                onChange={handleDateChange}
                            />
                        </div>

                        {loading ? (
                            <div className="loader"></div>
                        ) : (
                            <div>
                                <h3>Horarios Disponibles</h3>
                                {availableSlots.length === 0 ? (
                                    <p>No hay horarios disponibles para esta fecha.</p>
                                ) : (
                                    <div className="calendar-grid">
                                        {availableSlots.map(slot => (
                                            <div
                                                key={slot}
                                                className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
                                                onClick={() => handleSlotSelect(slot)}
                                            >
                                                {slot}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <p>Reserva para el <strong>{formData.date}</strong> a las <strong>{formData.time}</strong></p>
                            <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Cambiar hora</button>
                        </div>

                        <div className="input-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>

                        <div className="input-group">
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Ej. 600 000 000"
                            />
                        </div>

                        <div className="input-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Ej. juan@email.com"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Booking;
