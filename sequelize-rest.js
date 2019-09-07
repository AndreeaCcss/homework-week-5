const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const Sequelize = require("sequelize");
const { Router } = require("express");
const router = new Router();

const parserMiddleware = bodyParser.json();
app.use(parserMiddleware);

const databaseUrl = "postgres://postgres:secret@localhost:5432/postgres";
const db = new Sequelize(databaseUrl);

const Movie = db.define("movie", {
  title: Sequelize.STRING,
  yearOfRelease: Sequelize.INTEGER,
  synopsis: Sequelize.STRING
});

db.sync()
  .then(() => console.log("Database connected"))
  .then(() =>
    Promise.all([
      Movie.create({
        title: "x",
        yearOfRelease: 2000,
        synopsis: "it's cool"
      }),
      Movie.create({
        title: "y",
        yearOfRelease: 2001,
        synopsis: "it's cooler"
      }),
      Movie.create({
        title: "z",
        yearOfRelease: 2002,
        synopsis: "it's even cooler"
      })
    ])
  )
  .catch(console.error);

router.post("/movies", (req, res, next) => {
  Movie.create(req.body)
    .then(movie => res.json(movie))
    .catch(err => next(err));
});

router.get("/movies", (req, res, next) => {
  const limit = req.query.limit;
  const offset = req.query.offset;

  Promise.all([Movie.count(), Movie.findAll({ limit, offset })])
    .then(([total, movies]) => {
      res.send({
        movies,
        total
      });
    })
    .catch(error => next(error));
});

router.get("/movies/:id", (req, res, next) => {
  Movie.findByPk(req.params.id)
    .then(movie => {
      if (!movie) {
        res.status(404).end();
      } else {
        res.json(movie);
      }
    })
    .catch(next);
});

router.put("/movies/:id", (req, res, next) => {
  Movie.findByPk(req.params.id)
    .then(movie => {
      if (!movie) {
        res.status(404).end();
      } else {
        return movie.update(req.body).then(movie => res.json(movie));
      }
    })
    .catch(next);
});

router.delete("/movies/:id", (req, res, next) => {
  Movie.findByPk(req.params.id).then(movie => {
    if (!movie) {
      res.status(404).end();
    } else {
      Movie.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(numDeleted => {
          if (numDeleted) {
            return res.status(204).end();
          }
        })
        .catch(next);
    }
  });
});

app.use(router);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port: ${port}`));
