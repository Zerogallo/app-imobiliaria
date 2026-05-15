const express = require('express');
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const router = express.Router();

// @route   POST /api/properties
// @desc    Cadastrar um novo imóvel
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      photo,
      streetName,
      location,
      bedrooms,
      bathrooms,
      livingRoom,
      balcony,
      area,
      price
    } = req.body;

    // Validação de campos obrigatórios
    if (!streetName || !location) {
      return res.status(400).json({ msg: 'Nome da rua e localização são obrigatórios' });
    }

    const newProperty = new Property({
      photo: photo || '',
      streetName,
      location,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      livingRoom: livingRoom !== undefined ? livingRoom : true,
      balcony: balcony !== undefined ? balcony : false,
      area: area || 0,
      price: price || 0
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/properties
// @desc    Listar todos os imóveis (sem filtro de usuário, pois são compartilhados)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/properties/:id
// @desc    Obter um imóvel específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/properties/:id
// @desc    Atualizar um imóvel
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      photo,
      streetName,
      location,
      bedrooms,
      bathrooms,
      livingRoom,
      balcony,
      area,
      price
    } = req.body;

    // Construir objeto com campos a serem atualizados
    const updateFields = {};
    if (photo !== undefined) updateFields.photo = photo;
    if (streetName) updateFields.streetName = streetName;
    if (location) updateFields.location = location;
    if (bedrooms !== undefined) updateFields.bedrooms = bedrooms;
    if (bathrooms !== undefined) updateFields.bathrooms = bathrooms;
    if (livingRoom !== undefined) updateFields.livingRoom = livingRoom;
    if (balcony !== undefined) updateFields.balcony = balcony;
    if (area !== undefined) updateFields.area = area;
    if (price !== undefined) updateFields.price = price;

    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

// @route   DELETE /api/properties/:id
// @desc    Remover um imóvel
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }
    await property.deleteOne();
    res.json({ msg: 'Imóvel removido com sucesso' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Imóvel não encontrado' });
    }
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;