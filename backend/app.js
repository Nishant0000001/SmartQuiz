const express = require('express');
const { Client } = require('pg');
const { exec } = require('child_process');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://smart-quiz-ojg7.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS origin:', origin); // Add this line to debug origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));



app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to SmartQuiz Backend API!');
});

const JWT_SECRET = 'your-secret-key'; // 🔐 Use .env in production

// ✅ PostgreSQL setup
const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Connection error', err.stack));

/* ---------------- ADMIN ROUTES ---------------- */

app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM admin_users WHERE username = $1', [username]);

    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: result.rows[0].username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).send('Server error');
  }
});

/* ---------------- QUIZ ROUTES ---------------- */

app.get('/quiz', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM quiz_questions ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching quiz questions:', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/run-quiz', (req, res) => {
  exec('./quiz.exe', (err, stdout, stderr) => {
    if (err || stderr) {
      console.error('❌ Error running quiz.exe:', err || stderr);
      return res.status(500).send('Error running quiz logic');
    }
    res.send(stdout);
  });
});

/* ---------------- QUESTION MANAGEMENT ---------------- */

app.post('/add-question', async (req, res) => {
  const { type, question, option_a, option_b, option_c, option_d, correct_answer, timer } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO quiz_questions
        (type, question, option_a, option_b, option_c, option_d, correct_answer, timer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id;`,
      [type, question, option_a, option_b, option_c, option_d, correct_answer, timer]
    );

    res.send(`✅ Question added successfully with ID: ${result.rows[0].id}`);
  } catch (err) {
    console.error('❌ Error adding question:', err);
    res.status(500).send('Error adding question');
  }
});

app.delete('/delete-quiz/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const check = await client.query('SELECT * FROM quiz_questions WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).send('❌ Question not found');
    }

    await client.query('DELETE FROM quiz_questions WHERE id = $1', [id]);

    const responseCheck = await client.query('SELECT * FROM responses WHERE question_id = $1', [id]);
    if (responseCheck.rows.length > 0) {
      res.send('✅ Question deleted. Note: It had existing responses.');
    } else {
      res.send('✅ Quiz question deleted successfully');
    }
  } catch (err) {
    console.error('❌ Error deleting question:', err);
    res.status(500).send('Error deleting question');
  }
});

/* ---------------- USER MANAGEMENT ---------------- */

app.post('/set-password', async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ success: false, message: 'Missing user ID or password.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userCheck = await client.query('SELECT * FROM users WHERE user_id = $1', [user_id]);

    if (userCheck.rows.length === 0) {
      await client.query('INSERT INTO users (user_id, password) VALUES ($1, $2)', [user_id, hashedPassword]);
      return res.status(201).json({ success: true, message: 'User created and password set.' });
    } else {
      await client.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, user_id]);
      return res.status(200).json({ success: true, message: 'Password updated.' });
    }
  } catch (error) {
    console.error('❌ Error setting password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/user-login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: { user_id: result.rows[0].user_id } });
  } catch (err) {
    console.error('❌ Error in user login:', err);
    res.status(500).send('Login error');
  }
});

app.get('/user-dashboard/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await client.query(
      `SELECT * FROM user_scores
       WHERE user_id = $1
       ORDER BY score_date DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching user dashboard:', err);
    res.status(500).send('Error fetching dashboard');
  }
});

/* ---------------- SCORES ---------------- */

app.get('/scores', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM user_scores ORDER BY score_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching scores:', err);
    res.status(500).send('Error fetching scores');
  }
});

app.post('/submit-quiz', async (req, res) => {
  const { user_id, score } = req.body;

  if (!user_id || score === undefined) {
    return res.status(400).json({ success: false, message: 'Missing user_id or score' });
  }

  try {
    const result = await client.query(
      `INSERT INTO user_scores (user_id, score, score_date)
       VALUES ($1, $2, NOW())
       RETURNING score_id;`,
      [user_id, score]
    );

    res.status(201).json({ success: true, message: 'Score submitted', score_id: result.rows[0].score_id });
  } catch (error) {
    console.error('❌ Error submitting score:', error);
    res.status(500).json({ success: false, message: 'Error saving score' });
  }
});

/* ---------------- SERVER START ---------------- */

app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
});
