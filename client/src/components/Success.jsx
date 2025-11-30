import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Success = () => {
    const location = useLocation();
    const { appointment } = location.state || {};

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <div className="card">
                <h1 style={{ color: 'var(--success)', fontSize: '2rem' }}>¡Reserva Confirmada!</h1>
                <p>Gracias por confiar en Marnissi Barbershop.</p>

                {appointment && (
                    <div style={{ margin: '2rem 0', textAlign: 'left', background: 'var(--glass)', padding: '1rem', borderRadius: '8px' }}>
                        <p><strong>Nombre:</strong> {appointment.name}</p>
                        <p><strong>Fecha:</strong> {appointment.date}</p>
                        <p><strong>Hora:</strong> {appointment.time}</p>
                        <p>Hemos enviado un correo de confirmación a <strong>{appointment.email}</strong>.</p>
                    </div>
                )}

                <Link to="/">
                    <button className="btn-primary">Volver al Inicio</button>
                </Link>
            </div>
        </div>
    );
};

export default Success;
