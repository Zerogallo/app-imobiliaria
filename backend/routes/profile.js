const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/profile
// @desc    Obter perfil do usuário logado
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/profile
// @desc    Atualizar perfil (nome, telefone, descrição, foto)
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, description, photo } = req.body;

    // Construir objeto com campos a serem atualizados
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (description !== undefined) updateFields.description = description;
    if (photo !== undefined) updateFields.photo = photo;

    // Atualizar usuário
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/profile/photo
// @desc    Atualizar apenas a foto de perfil
// @access  Private
router.put('/photo', auth, async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) {
      return res.status(400).json({ msg: 'Foto é obrigatória' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { photo } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;