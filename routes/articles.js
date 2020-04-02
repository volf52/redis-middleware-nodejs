const mongoose = require("mongoose");
const Article = mongoose.model("Article");

module.exports = (app) => {
  app.get("/api/articles", async (req, res) => {
    const articleList = await Article.find().cache({ expire: 10 });

    res.json(articleList);
  });

  app.post("/api/articles", async (req, res) => {
    const { title, author, content } = req.body;

    if (!title || !author || !content) {
      return res.status(403).send("Missing data");
    }

    const article = new Article({
      title,
      author,
      content,
    });

    try {
      await article.save();
      res.send(article);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
};
