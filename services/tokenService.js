const pool = require('../config/db');

const CITY_CODES = {
  jaipur:'JAI', delhi:'DEL', mumbai:'MUM', kolkata:'KOL',
  hyderabad:'HYD', chennai:'CHE', bangalore:'BLR', bengaluru:'BLR',
  varanasi:'VNS', agra:'AGR', leh:'LEH', alleppey:'ALP',
  kochi:'COK', cochin:'COK', pune:'PUN', ahmedabad:'AMD', default:'IND',
};

function cityCode(city='') {
  return CITY_CODES[city.toLowerCase().trim()] || CITY_CODES.default;
}
function pad(n, d=6) { return String(n).padStart(d,'0'); }

async function generateCustomerToken(city) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS c FROM customers');
  return `CUS-IND-${cityCode(city)}-${pad(row.c + 1)}`;
}
async function generateGuideToken(city) {
  const [[row]] = await pool.query('SELECT COUNT(*) AS c FROM guides');
  return `GUI-IND-${cityCode(city)}-${pad(row.c + 1)}`;
}
async function generateBookingToken() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query('SELECT COUNT(*) AS c FROM bookings');
  return `BKG-${year}-${pad(row.c + 1)}`;
}
async function generateTravelToken() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query('SELECT COUNT(*) AS c FROM travel_records');
  return `TRV-${year}-${pad(row.c + 1)}`;
}

module.exports = { generateCustomerToken, generateGuideToken, generateBookingToken, generateTravelToken };
