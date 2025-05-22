const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Ensure quiz.exe exists
const quizPath = path.join(__dirname, "quiz.exe");
if (!fs.existsSync(quizPath)) {
  console.error("❌ quiz.exe not found at:", quizPath);
  process.exit(1);
}
const QUIZ_EXEC = `"${quizPath}"`; // For Windows paths with spaces

// 🔹 Route: Initialize quiz for a user
app.get("/api/init", (req, res) => {
  const userId = req.query.userId || "guest";
  const cmd = `${QUIZ_EXEC} init ${userId}`;
  console.log("🛠️ Running:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Init error:", stderr || err.message);
      return res.status(500).send(`Init failed: ${stderr || err.message}`);
    }
    res.send(stdout);
  });
});

// 🔹 Route: Fetch questions (GET)
app.get("/api/questions", (req, res) => {
  const userId = req.query.userId || "guest";
  const cmd = `${QUIZ_EXEC} get_questions ${userId}`;
  console.log("📥 Fetching questions for:", userId);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Get Questions Error:", stderr || err.message);
      return res.status(500).send("Failed to fetch questions.");
    }

    try {
      const json = JSON.parse(stdout);
      res.json(json);
    } catch (parseErr) {
      console.error("❌ JSON Parse Error:", parseErr.message);
      console.error("Raw output:", stdout);
      res.status(500).send("Invalid question format.");
    }
  });
});

// 🔹 Route: Submit answer
app.post("/api/answer", (req, res) => {
  const { userId, questionId, answer } = req.body;

  if (!userId || !questionId || !answer) {
    return res.status(400).send("Missing userId, questionId, or answer.");
  }

  const cmd = `${QUIZ_EXEC} answer ${userId} ${questionId} ${answer}`;
  console.log("📝 Answer submitted:", cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Answer Error:", stderr || err.message);
      return res.status(500).send(`Answer error: ${stderr || err.message}`);
    }
    res.send(stdout);
  });
});

// 🔹 Route: Get score
app.get("/api/score", (req, res) => {
  const userId = req.query.userId || "guest";
  const cmd = `${QUIZ_EXEC} get_score ${userId}`;
  console.log("🏁 Fetching score for:", userId);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Score Error:", stderr || err.message);
      return res.status(500).send("Could not get score.");
    }
    res.send(stdout);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
