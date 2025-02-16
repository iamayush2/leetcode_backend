const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const users = ["WhoIsHigh"];

const fetchLeetCodeStats = async (username) => {
  const query = {
    query: `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    variables: { username },
  };

  try {
    const response = await axios.post(LEETCODE_GRAPHQL_URL, query);

    // Check if user exists
    if (!response.data.data.matchedUser) {
      throw new Error(`User ${username} not found.`);
    }

    const stats = response.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const easy = stats.find((s) => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find((s) => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find((s) => s.difficulty === "Hard")?.count || 0;
    const points = easy * 1 + medium * 3 + hard * 5;

    return { username, easy, medium, hard, points };
  } catch (error) {
    console.error(`Error fetching data for ${username}:`, error.message);
    return { username, easy: 0, medium: 0, hard: 0, points: 0 };
  }
};

// ✅ API Route for Leaderboard
app.get("/leaderboard", async (req, res) => {
  const leaderboard = await Promise.all(users.map(fetchLeetCodeStats));
  leaderboard.sort((a, b) => b.points - a.points);
  res.json(leaderboard);
});

// ✅ Make sure the server listens on a port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
