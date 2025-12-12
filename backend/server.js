const express = require('express'); 
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:5173/',
  credentials: true
}));
app.use(bodyParser.json());


const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) console.error('Ошибка при подключении к БД:', err.message);
  else console.log('Подключено к SQLite');
});


db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);


db.run(`CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  lobby TEXT,
  time TEXT,
  status TEXT,
  date TEXT
)`);


const testUser = { username: 'admin', password: '1234' };
db.get('SELECT * FROM users WHERE username = ?', [testUser.username], (err, row) => {
  if (!row) {
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [testUser.username, testUser.password]);
    console.log('Добавлен тестовый пользователь: admin / 1234');
  }
});


app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username и password обязательны' });

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ message: 'Пользователь уже существует' });
      return res.status(500).json({ message: err.message });
    }
    res.json({ id: this.lastID, username });
  });
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username и password обязательны' });

  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!row) return res.status(401).json({ message: 'Неверный логин или пароль' });
    res.json({ id: row.id, username: row.username });
  });
});


app.get('/events', (req, res) => {
  db.all('SELECT * FROM events', (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
