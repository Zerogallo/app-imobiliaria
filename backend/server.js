const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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
    // Se o arquivo não existir ou estiver corrompido, cria um novo
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
    // Cria a estrutura inicial com um usuário admin (senha: 123456)
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
    return res.status(401).json({ msg: 'Token não fornecido, acesso negado' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
}

// ---------- Rotas de autenticação ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Preencha todos os campos' });
    }
    const db = readDB();
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ msg: 'Usuário já existe' });
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
    res.json({ token, user: userWithoutPass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ msg: 'Credenciais inválidas' });
    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// ---------- Rotas de clientes (CRUD) ----------
app.get('/api/clients', auth, (req, res) => {
  const db = readDB();
  const clients = db.clients.filter(c => c.createdBy === req.user.id);
  res.json(clients);
});

app.post('/api/clients', auth, (req, res) => {
  const db = readDB();
  const newClient = {
    id: Date.now(),
    ...req.body,
    createdBy: req.user.id
  };
  db.clients.push(newClient);
  writeDB(db);
  res.json(newClient);
});

app.get('/api/clients/:id', auth, (req, res) => {
  const db = readDB();
  const client = db.clients.find(c => c.id == req.params.id && c.createdBy === req.user.id);
  if (!client) return res.status(404).json({ msg: 'Cliente não encontrado' });
  res.json(client);
});

app.put('/api/clients/:id', auth, (req, res) => {
  const db = readDB();
  const index = db.clients.findIndex(c => c.id == req.params.id && c.createdBy === req.user.id);
  if (index === -1) return res.status(404).json({ msg: 'Cliente não encontrado' });
  db.clients[index] = { ...db.clients[index], ...req.body };
  writeDB(db);
  res.json(db.clients[index]);
});

app.delete('/api/clients/:id', auth, (req, res) => {
  const db = readDB();
  const newClients = db.clients.filter(c => !(c.id == req.params.id && c.createdBy === req.user.id));
  if (newClients.length === db.clients.length) return res.status(404).json({ msg: 'Cliente não encontrado' });
  db.clients = newClients;
  writeDB(db);
  res.json({ msg: 'Cliente removido' });
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
  const db = readDB();
  const newAppointment = {
    id: Date.now(),
    ...req.body,
    createdBy: req.user.id
  };
  db.appointments.push(newAppointment);
  writeDB(db);
  res.json(newAppointment);
});

app.put('/api/appointments/:id', auth, (req, res) => {
  const db = readDB();
  const index = db.appointments.findIndex(a => a.id == req.params.id && a.createdBy === req.user.id);
  if (index === -1) return res.status(404). json({ msg: 'Compromisso não encontrado' });
  db.appointments[index] = { ...db.appointments[index], ...req.body };
  writeDB(db);
  res.json(db.appointments[index]);
});

app.delete('/api/appointments/:id', auth, (req, res) => {
  const db = readDB();
  const newApps = db.appointments.filter(a => !(a.id == req.params.id && a.createdBy === req.user.id));
  if (newApps.length === db.appointments.length) return res.status(404).json({ msg: 'Compromisso não encontrado' });
  db.appointments = newApps;
  writeDB(db);
  res.json({ msg: 'Compromisso removido' });
});

// ---------- Rotas de imóveis (acesso compartilhado, sem filtro por usuário) ----------
app.get('/api/properties', auth, (req, res) => {
  const db = readDB();
  res.json(db.properties);
});

app.post('/api/properties', auth, (req, res) => {
  const db = readDB();
  const newProperty = {
    id: Date.now(),
    ...req.body
  };
  db.properties.push(newProperty);
  writeDB(db);
  res.json(newProperty);
});

app.put('/api/properties/:id', auth, (req, res) => {
  const db = readDB();
  const index = db.properties.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ msg: 'Imóvel não encontrado' });
  db.properties[index] = { ...db.properties[index], ...req.body };
  writeDB(db);
  res.json(db.properties[index]);
});

app.delete('/api/properties/:id', auth, (req, res) => {
  const db = readDB();
  const newProps = db.properties.filter(p => p.id != req.params.id);
  if (newProps.length === db.properties.length) return res.status(404).json({ msg: 'Imóvel não encontrado' });
  db.properties = newProps;
  writeDB(db);
  res.json({ msg: 'Imóvel removido' });
});

// ---------- Rotas de perfil ----------
app.get('/api/profile', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });
  const { password, ...userWithoutPass } = user;
  res.json(userWithoutPass);
});

app.put('/api/profile', auth, (req, res) => {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ msg: 'Usuário não encontrado' });
  db.users[index] = { ...db.users[index], ...req.body };
  writeDB(db);
  const { password, ...userWithoutPass } = db.users[index];
  res.json(userWithoutPass);
});

// Rota de status para verificar que o servidor está ativo
app.get('/', (req, res) => {
  res.json({ message: '🚀 Servidor da Imobiliária rodando com db.json!', status: 'online' });
});

// Inicializar banco e iniciar servidor
initializeDB();
app.listen(PORT,'0.0.0.0', () => {
  console.log(`
  ========================================
  🏢 Servidor da Imobiliária rodando!
  ========================================
  📡 Porta: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📁 Banco: ${DB_FILE}
  ========================================
  `);
});