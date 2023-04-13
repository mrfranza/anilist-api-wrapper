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
      status
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

  switch (data.status) {
    case "FINISHED":
      data.statusId = 1
      break;
    case "RELEASING":
      data.statusId = 2
      break;
    case "HIATUS":
      data.statusId = 3
      break;
    case "NOT_YET_RELEASED":
      data.statusId = 4
      break;
    case "CANCELLED":
      data.statusId = 5
      break;
    default:
      data.statusId = 0
  }

  delete data.status

  switch (data.source) {
    case "MANGA":
      data.origin = 3
      break;
    case "LIGHT_NOVEL":
      data.origin = 2
      break
    case "NOVEL":
      data.origin = 6
      break
    case "ORIGINAL":
      data.origin = 9
      break
    case "VISUAL_NOVEL":
      data.origin = 8
      break
    case "VIDEO_GAME":
      data.origin = 7
      break
    case "MOVIE":
      data.origin = 5
      break
    case "MUSIC":
      data.origin = 4
      break
    case "OTHER":
      data.origin = 10
      break
    case "CARD_GAME":
      data.origin = 1
      break
    case "WEB_MANGA":
      data.origin = 11
      break
    case "WEB_NOVEL":
      data.origin = 12
      break
    default:
      data.origin = 0
  }

  delete data.source

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
