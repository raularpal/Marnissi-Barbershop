const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// Configure the JWT auth client for Service Account
const SCOPES = 'https://www.googleapis.com/auth/calendar';

const getCalendarClient = () => {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    const jwtClient = new google.auth.JWT(
        clientEmail,
        null,
        privateKey,
        SCOPES
    );

    const calendar = google.calendar({
        version: 'v3',
        auth: jwtClient,
    });

    return { calendar, calendarId };
};

module.exports = getCalendarClient;
