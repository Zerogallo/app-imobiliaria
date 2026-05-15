const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar limite para fotos base64

// Configurações
const PORT = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || 'meu_segredo_super_secreto_para_jwt';
const DB_FILE = path.join(__dirname, 'db.json');

// ---------- Funções auxiliares para ler/escrever o banco JSON ----------
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Inicializa o banco de dados se não existir
function initializeDB() {
  const db = readDB();
  if (!db) {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const initialData = {
      users: [
        {
          id: 1,
          name: 'Administrador',
          email: 'admin@imobiliaria.com',
          password: hashedPassword,
          phone: '(11) 99999-9999',
          description: 'Corretor principal',
          photo: ''
        }
      ],
      clients: [],
      appointments: [],
      properties: []
    };
    writeDB(initialData);
    console.log('✅ Banco de dados db.json criado com dados iniciais.');
  } else {
    console.log('✅ Banco de dados db.json já existe.');
  }
}

// Middleware de autenticação JWT
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido, acesso negado' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
}

// ---------- Rotas de autenticação ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos' });
    }
    const db = readDB();
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      phone: '',
      description: '',
      photo: ''
    };
    db.users.push(newUser);
    writeDB(db);
    const token = jwt.sign({ user: { id: newUser.id } }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = newUser;
    res.json({ message: 'Cadastro realizado com sucesso!', token, user: userWithoutPass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Credenciais inválidas' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Credenciais inválidas' });
    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ message: 'Login realizado com sucesso!', token, user: userWithoutPass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// ---------- Rotas de clientes ----------
app.get('/api/clients', auth, (req, res) => {
  const db = readDB();
  const clients = db.clients.filter(c => c.createdBy === req.user.id);
  res.json(clients);
});

app.post('/api/clients', auth, (req, res) => {
  try {
    const db = readDB();
    const newClient = {
      id: Date.now(),
      ...req.body,
      createdBy: req.user.id
    };
    db.clients.push(newClient);
    writeDB(db);
    res.json({ message: 'Cliente cadastrado com sucesso!', client: newClient });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cadastrar cliente' });
  }
});

app.get('/api/clients/:id', auth, (req, res) => {
  const db = readDB();
  const client = db.clients.find(c => c.id == req.params.id && c.createdBy === req.user.id);
  if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });
  res.json(client);
});

app.put('/api/clients/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const index = db.clients.findIndex(c => c.id == req.params.id && c.createdBy === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Cliente não encontrado' });
    db.clients[index] = { ...db.clients[index], ...req.body };
    writeDB(db);
    res.json({ message: 'Cliente atualizado com sucesso!', client: db.clients[index] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
});

app.delete('/api/clients/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const newClients = db.clients.filter(c => !(c.id == req.params.id && c.createdBy === req.user.id));
    if (newClients.length === db.clients.length) return res.status(404).json({ message: 'Cliente não encontrado' });
    db.clients = newClients;
    writeDB(db);
    res.json({ message: 'Cliente removido com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover cliente' });
  }
});

// ---------- Rotas de compromissos (agenda) ----------
app.get('/api/appointments', auth, (req, res) => {
  const db = readDB();
  let appointments = db.appointments.filter(a => a.createdBy === req.user.id);
  if (req.query.date) {
    appointments = appointments.filter(a => a.date === req.query.date);
  }
  res.json(appointments);
});

app.post('/api/appointments', auth, (req, res) => {
  try {
    const db = readDB();
    const newAppointment = {
      id: Date.now(),
      ...req.body,
      createdBy: req.user.id
    };
    db.appointments.push(newAppointment);
    writeDB(db);
    res.json({ message: 'Compromisso agendado com sucesso!', appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar compromisso' });
  }
});

app.put('/api/appointments/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const index = db.appointments.findIndex(a => a.id == req.params.id && a.createdBy === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Compromisso não encontrado' });
    db.appointments[index] = { ...db.appointments[index], ...req.body };
    writeDB(db);
    res.json({ message: 'Compromisso atualizado com sucesso!', appointment: db.appointments[index] });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar compromisso' });
  }
});

app.delete('/api/appointments/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const newApps = db.appointments.filter(a => !(a.id == req.params.id && a.createdBy === req.user.id));
    if (newApps.length === db.appointments.length) return res.status(404).json({ message: 'Compromisso não encontrado' });
    db.appointments = newApps;
    writeDB(db);
    res.json({ message: 'Compromisso removido com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover compromisso' });
  }
});

// ---------- Rotas de imóveis (com propertyType e status) ----------
app.get('/api/properties', auth, (req, res) => {
  const db = readDB();
  res.json(db.properties);
});

app.post('/api/properties', auth, (req, res) => {
  try {
    const db = readDB();
    const newProperty = {
      id: Date.now(),
      streetName: req.body.streetName || '',
      location: req.body.location || '',
      bedrooms: req.body.bedrooms || 0,
      bathrooms: req.body.bathrooms || 0,
      livingRoom: req.body.livingRoom || false,
      balcony: req.body.balcony || false,
      area: req.body.area || 0,
      price: req.body.price || 0,
      propertyType: req.body.propertyType || 'casa',     // 'casa' ou 'apartamento'
      status: req.body.status || 'disponivel',           // 'disponivel', 'vendido', 'alugado'
      photo: req.body.photo || ''
    };
    db.properties.push(newProperty);
    writeDB(db);
    res.json({ message: 'Imóvel cadastrado com sucesso!', property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cadastrar imóvel' });
  }
});

app.put('/api/properties/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const index = db.properties.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Imóvel não encontrado' });
    
    db.properties[index] = { ...db.properties[index], ...req.body };
    writeDB(db);
    res.json({ message: 'Imóvel atualizado com sucesso!', property: db.properties[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar imóvel' });
  }
});

app.delete('/api/properties/:id', auth, (req, res) => {
  try {
    const db = readDB();
    const newProps = db.properties.filter(p => p.id != req.params.id);
    if (newProps.length === db.properties.length) return res.status(404).json({ message: 'Imóvel não encontrado' });
    db.properties = newProps;
    writeDB(db);
    res.json({ message: 'Imóvel removido com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao remover imóvel' });
  }
});

// ---------- Rotas de perfil ----------
app.get('/api/profile', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const { password, ...userWithoutPass } = user;
  res.json(userWithoutPass);
});

app.put('/api/profile', auth, (req, res) => {
  try {
    const db = readDB();
    const index = db.users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado' });
    db.users[index] = { ...db.users[index], ...req.body };
    writeDB(db);
    const { password, ...userWithoutPass } = db.users[index];
    res.json({ message: 'Perfil atualizado com sucesso!', user: userWithoutPass });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// Rota de status
app.get('/', (req, res) => {
  res.json({ message: '🚀 Servidor da Imobiliária rodando com db.json!', status: 'online' });
});

// Inicializar banco e iniciar servidor
initializeDB();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ========================================
  🏢 Servidor da Imobiliária rodando!
  ========================================
  📡 Porta: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📁 Banco: ${DB_FILE}
  ✅ Respostas com mensagens amigáveis
  📦 Propriedades incluem: propertyType e status
  ========================================
  `);
});