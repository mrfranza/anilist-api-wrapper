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
      format
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
          relationType
          node {
            id
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

  let title = data.title.english;
  let alternativeTitle = data.title.native + " - " + data.title.romaji;
  delete data.title;

  data.title = title;
  data.alternativeTitle = alternativeTitle;

  data.storyline = data.description
  delete data.description

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
      data.originId = 3
      break;
    case "LIGHT_NOVEL":
      data.originId = 2
      break
    case "NOVEL":
      data.originId = 6
      break
    case "ORIGINAL":
      data.originId = 9
      break
    case "VISUAL_NOVEL":
      data.originId = 8
      break
    case "VIDEO_GAME":
      data.originId = 7
      break
    case "MOVIE":
      data.originId = 5
      break
    case "MUSIC":
      data.originId = 4
      break
    case "OTHER":
      data.originId = 10
      break
    case "CARD_GAME":
      data.originId = 1
      break
    case "WEB_MANGA":
      data.originId = 11
      break
    case "WEB_NOVEL":
      data.originId = 12
      break
    default:
      data.originId = 0
  }

  delete data.source

  switch (data['format']) {
        case "TV":
            data.typeId = 1
            break;
        case "MOVIE":
            data.typeId = 2
            break;
        case "OVA":
            data.typeId = 3
            break;
        case "ONA":
            data.typeId = 4
            break;
        case "SPECIAL":
            data.typeId = 5
            break;
        case "MUSIC":
            data.typeId = 6
            break;
        default:
            data.typeId = 0
            break;
    }

    delete data['format']

    let animeRelations = []

    data.relations.edges.forEach((edge) => {

        let relation

        switch (edge.relationType) {
            case "PREQUEL":
                relation = 1
                break;
            case "SEQUEL":
                relation = 2
                break;
            case "ALTERNATIVE":
                relation = 4
                break;
            case "OTHER":
                relation = 3
                break;
            case "CHARACTER":
                relation = 5
                break;
            default:
                relation = 6
        }

        animeRelations.push({
            id: edge.node.id,
            relationType: relation
        })
    })

    data.animeRelations = animeRelations

    delete data.relations

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
