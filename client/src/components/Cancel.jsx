import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cancelAppointment } from '../services/api';

const Cancel = () => {
    const { id } = useParams();
    const [status, setStatus] = useState('confirm'); // confirm, loading, success, error

    const handleCancel = async () => {
        setStatus('loading');
        try {
            await cancelAppointment(id);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <div className="card">
                {status === 'confirm' && (
                    <>
                        <h2>Cancelar Cita</h2>
                        <p>¿Estás seguro de que quieres cancelar tu cita?</p>
                        <div style={{ marginTop: '2rem' }}>
                            <button className="btn-primary" style={{ backgroundColor: 'var(--error)', color: 'white', marginRight: '1rem' }} onClick={handleCancel}>
                                Sí, Cancelar
                            </button>
                            <Link to="/">
                                <button className="btn-secondary">No, Volver</button>
                            </Link>
                        </div>
                    </>
                )}

                {status === 'loading' && <div className="loader"></div>}

                {status === 'success' && (
                    <>
                        <h2 style={{ color: 'var(--success)' }}>Cita Cancelada</h2>
                        <p>Tu cita ha sido cancelada correctamente.</p>
                        <Link to="/">
                            <button className="btn-primary" style={{ marginTop: '1rem' }}>Volver al Inicio</button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ color: 'var(--error)' }}>Error</h2>
                        <p>No se pudo cancelar la cita. Es posible que ya haya sido cancelada o el enlace sea inválido.</p>
                        <Link to="/">
                            <button className="btn-secondary" style={{ marginTop: '1rem' }}>Volver al Inicio</button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cancel;
