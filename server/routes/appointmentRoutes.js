const express = require('express');
const router = express.Router();
const { getSlots, bookAppointment, cancelAppointment } = require('../controllers/appointmentController');

router.get('/slots', getSlots);
router.post('/book', bookAppointment);
router.delete('/cancel/:id', cancelAppointment);

module.exports = router;
