const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // formato "HH:MM"
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);