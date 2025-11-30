import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container">
            <div className="hero">
                <h1>Marnissi Barbershop</h1>
                <p>Estilo, precisión y elegancia. Reserva tu cita hoy mismo y vive la experiencia premium.</p>
                <Link to="/book">
                    <button className="btn-primary">Reservar Cita</button>
                </Link>
            </div>

            {/* Optional: Add some visuals or info sections here */}
            <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                <h2>Horario</h2>
                <p>Lunes a Sábado</p>
                <p style={{ color: 'var(--accent)' }}>09:00 - 14:00 | 16:00 - 21:00</p>
                <p>Domingo: Cerrado</p>
            </div>
        </div>
    );
};

export default Home;
