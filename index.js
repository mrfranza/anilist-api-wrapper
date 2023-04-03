const axios = require('axios');
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");

const API_URL = 'https://graphql.anilist.co';

async function getAnimeOrMangaInfo(idOrLink) {
    const regex = /https:\/\/anilist.co\/(?:anime|manga)\/(\d+)/;
    const id = idOrLink.match(regex)[1];
    const query = `
    query ($id: Int) {
        Media (id: $id) {
          id
          title {
            romaji
            english
            native
          }
          type
          format
          status
          description
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
          season
          seasonYear
          episodes
          duration
          chapters
          volumes
          genres
          synonyms
          averageScore
          meanScore
          popularity 
          favourites
          isAdult
          bannerImage
          coverImage {
            extraLarge
            large
            medium
            color
          }
          trailer {
            id
            site
            thumbnail
          }
          externalLinks {
            url
            site
          }
          rankings {
            id
            rank
            type
            format
            year
            season
            allTime
            context
          }
          tags {
            id
            name
            description
            rank
            isMediaSpoiler
            category
          }
          relations {
            edges {
              id
              relationType
              node {
                id
                type
                format
                status
                title {
                  romaji
                  english
                  native
                }
              }
            }
          }
          staff {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
              }
            }
          }
          characters {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
              }
            }
          }
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
    return response.data.data.Media;
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


app.post("/element", async (req, res) => {
    const {
        query
    } = req.body;
    const animeOrManga = await getAnimeOrMangaInfo(query);
    return res.json({
        animeOrManga
    });
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
        console.error(reason);
    })
    .on('uncaughtException', err => {
        console.error(`${err}`);
    });
