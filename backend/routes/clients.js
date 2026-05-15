const express = require('express');
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const router = express.Router();

// @route   POST /api/clients
// @desc    Criar um novo cliente
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      firstServiceDate,
      familyMembers,
      hasPets,
      propertyType,
      lastAttendedBy,
      chosenProperty,
      visitDate
    } = req.body;

    // Validações básicas
    if (!name || !phone) {
      return res.status(400).json({ msg: 'Nome e telefone são obrigatórios' });
    }

    const newClient = new Client({
      name,
      phone,
      email,
      firstServiceDate: firstServiceDate || Date.now(),
      familyMembers,
      hasPets: hasPets || false,
      propertyType,
      lastAttendedBy,
      chosenProperty,
      visitDate,
      createdBy: req.user.id
    });

    const client = await newClient.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/clients
// @desc    Listar todos os clientes do usuário logado
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user.id }).sort({ firstServiceDate: -1 });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/clients/:id
// @desc    Obter um cliente específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    // Verificar se o cliente pertence ao usuário
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/clients/:id
// @desc    Atualizar um cliente
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      firstServiceDate,
      familyMembers,
      hasPets,
      propertyType,
      lastAttendedBy,
      chosenProperty,
      visitDate
    } = req.body;

    // Construir objeto de atualização
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (firstServiceDate) updateFields.firstServiceDate = firstServiceDate;
    if (familyMembers !== undefined) updateFields.familyMembers = familyMembers;
    if (hasPets !== undefined) updateFields.hasPets = hasPets;
    if (propertyType) updateFields.propertyType = propertyType;
    if (lastAttendedBy) updateFields.lastAttendedBy = lastAttendedBy;
    if (chosenProperty) updateFields.chosenProperty = chosenProperty;
    if (visitDate) updateFields.visitDate = visitDate;

    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

// @route   DELETE /api/clients/:id
// @desc    Remover um cliente
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    if (client.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    await client.deleteOne();
    res.json({ msg: 'Cliente removido com sucesso' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cliente não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;