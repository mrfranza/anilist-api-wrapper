const axios = require('axios');

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

async function test() {
    const idOrLink = 'https://anilist.co/anime/21/';
    const animeOrMangaInfo = await getAnimeOrMangaInfo(idOrLink);
    console.log(animeOrMangaInfo);
}

test();