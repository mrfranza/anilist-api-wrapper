const axios = require('axios');
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");

const API_URL = 'https://graphql.anilist.co';

async function getAnimeOrMangaInfo(id) {
  const query = `
  query ($id: Int) {
    Media (id: $id) {
      title {
        romaji
        english
        native
      }
      episodes
      duration
      source
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      description
      type
      relations {
        edges {
          node {
            id
            title {
              romaji
            }
          }
        }
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
    }
  }
  `;
  const variables = {
    id: parseInt(id),
  };
  const response = await axios.post('https://graphql.anilist.co', {
    query,
    variables,
  });

  let data = response.data.data.Media

  return data;
}

const app = express();

//middlewares
app.use(helmet());
app.use(cors());

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json({
  extended: true
}));


app.get("/", (_, res) => {
  return res.json({
    message: "API's working well!"
  });
});

app.get('/search/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const animeOrManga = await getAnimeOrMangaInfo(id);
    return res.json(animeOrManga);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post("/element", async (req, res) => {
  const { query } = req.body;
  const animeOrManga = await getAnimeOrMangaInfo(query);
  return res.json(
    animeOrManga
  );
});

app.use((_, __, next) => {
  return next({
    error: "Route not found.",
    code: "route-not-found",
    status: 404,
  }); // Not found error
});

app.listen(5000, () =>
  console.log(`Server is running on: http://localhost:5000/`)
);

process
  .on('unhandledRejection', (reason, _) => {
    console.error("unhandledRejection: " + reason);
  })
  .on('uncaughtException', err => {
    console.error("uncaughtException" + `${err}`);
  });
