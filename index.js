const axios = require('axios');
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");

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
      genres
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
      tags {
            name
          }
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

  data.startDate = data.startDate.year + "-" + data.startDate.month + "-" + data.startDate.day;
  data.endDate = data.endDate.year + "-" + data.endDate.month + "-" + data.endDate.day;

  data.episodeNumber = data.episodes;
  delete data.episodes;
  data.episodeDuration = data.duration;
  delete data.duration;

  data.horizontalImages = data.bannerImage
  delete data.bannerImage
  data.verticalImages = data.coverImage.extraLarge
    delete data.coverImage

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

    delete data.type

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


    let newGenres = []
    for (let i = 0; i < data.genres.length; i++) {
        let id = -1

        switch (data.genres[i]) {
            case "Action":
                id = 38
                break
            case "Mystery":
                id = 27
                break
            case "Fantasy":
                id = 26
                break
            case "Adventure":
                id = 25;
                break;
            case "Drama":
                id = 32;
                break;
            case "Horror":
                id = 29;
                break
            case "Sci-Fi":
                id = 69;
                break
            case "Mahou Shoujo":
                id = 41;
                break
            case "Thriller":
                id = 35;
                break
            case "Psychological":
                id = 28;
                break
            case "Mecha":
                id = 45;
                break
            case "Comedy":
                id = 37;
                break
            case "Romance":
                id = 43;
                break
            case "Slice of Life":
                id = 30;
                break
            case "Ecchi":
                id = 47;
                break
            case "Sports":
                id = 74;
                break
            case "Supernatural":
                id = 34;
                break
            case "Music":
                id = 94;
                break
        }

        if (id !== -1) {
            newGenres.push(id)
        }
    }

    for (let genre of data.tags) {
        let id = -1;

        switch (genre.name) {
            case "Military":
                id = 84;
                break;
            case "War":
                id = 63
                break
            case "Isekai":
            case "Alternate Universe":
                id = 74;
                break
            case "School":
            case "School Club":
                id = 32;
                break
            case "Demons":
                id = 53
                break
            case "Superhero":
                id = 96
                break
            case "Space":
            case "Space Opera":
                id = 87
                break
            case "Cars":
                id = 90
                break
            case "Politics":
                id = 59
                break
            case "Suicide":
            case "Gore":
                id = 56;
                break
            case "Video Games":
                id = 85;
                break
            case "Vampire":
                id = 67;
                break
            case "Police":
                id = 33;
                break
            case "Female Harem":
            case "Mixed Gender Harem":
                id = 46;
                break
            case "Male Harem":
                id = 80;
                break
            case "Seinen":
                id = 49;
                break
            case "Historical":
                id = 52;
                break
            case "Shoujo":
                id = 60;
                break
            case "Parody":
                id = 75;
                break
            case "Samurai":
                id = 95;
                break
            case "Josei":
                id = 101;
                break
            case "Crime":
                id = 102;
                break
            case "Food":
                id = 103;
                break
            case "Shounen":
                id = 48
                break
            case "Yuri":
                id = 50;
                break
            case "Yaoi":
                id = 51;
                break
            case "Satire":
                id = 66;
                break
            case "Boys' Love":
                id = 104;
                break
            case "Teens' Love":
            case "Love Triangle":
                id = 36;
                break
            case "Boxing":
                id = 64;
                break
            case "Martial Arts":
                id = 68;
                break
        }
        if (id !== -1 && !newGenres.includes(id)) {
            newGenres.push(id)
        }
    }

    delete data.tags
    delete data.genres

    data.genres = newGenres

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
