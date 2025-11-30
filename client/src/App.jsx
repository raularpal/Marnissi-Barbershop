import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Booking from './components/Booking';
import Success from './components/Success';
import Cancel from './components/Cancel';

function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<Booking />} />
                <Route path="/success" element={<Success />} />
                <Route path="/cancel/:id" element={<Cancel />} />
            </Routes>
        </div>
    );
}

export default App;
