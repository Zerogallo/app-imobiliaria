const express = require('express');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const router = express.Router();

// @route   GET /api/appointments
// @desc    Listar todos os compromissos do usuário
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { createdBy: req.user.id };
    if (date) {
      // Filtra compromissos de uma data específica (formato YYYY-MM-DD)
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   POST /api/appointments
// @desc    Criar novo compromisso
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { clientId, clientName, date, time, notes } = req.body;
    if (!clientId || !clientName || !date || !time) {
      return res.status(400).json({ msg: 'Cliente, nome, data e hora são obrigatórios' });
    }
    const newAppointment = new Appointment({
      clientId,
      clientName,
      date,
      time,
      notes,
      createdBy: req.user.id
    });
    const appointment = await newAppointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/appointments/:id
// @desc    Editar um compromisso
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { clientName, date, time, notes } = req.body;
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Compromisso não encontrado' });
    if (appointment.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    const updateFields = {};
    if (clientName) updateFields.clientName = clientName;
    if (date) updateFields.date = date;
    if (time) updateFields.time = time;
    if (notes !== undefined) updateFields.notes = notes;
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Compromisso não encontrado' });
    res.status(500).send('Erro no servidor');
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Deletar um compromisso
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Compromisso não encontrado' });
    if (appointment.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    await appointment.deleteOne();
    res.json({ msg: 'Compromisso removido' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Compromisso não encontrado' });
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;