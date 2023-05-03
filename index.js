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
      studios {
        edges {
          node {
            name
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

  const { title, description, startDate, endDate, episodes, duration, bannerImage, coverImage } = response.data.data.Media;
  const data = {
    ...response.data.data.Media,
    title: title.english,
    alternativeTitle: `${title.native} - ${title.romaji}`,
    storyline: description,
    description: undefined,
    startDate: `${startDate.year}-${startDate.month}-${startDate.day}`,
    endDate: `${endDate.year}-${endDate.month}-${endDate.day}`,
    episodeNumber: episodes,
    episodes: undefined,
    episodeDuration: duration,
    duration: undefined,
    horizontalImages: bannerImage,
    bannerImage: undefined,
    verticalImages: coverImage.extraLarge,
    coverImage: undefined
  };

  const statusMapping = {
    FINISHED: 1,
    RELEASING: 2,
    HIATUS: 3,
    NOT_YET_RELEASED: 4,
    CANCELLED: 5
  };

  data.statusId = statusMapping[data.status] || 0;
  delete data.status;

  const sourceMapping = {
    MANGA: 3,
    LIGHT_NOVEL: 2,
    NOVEL: 6,
    ORIGINAL: 9,
    VISUAL_NOVEL: 8,
    VIDEO_GAME: 7,
    MOVIE: 5,
    MUSIC: 4,
    OTHER: 10,
    CARD_GAME: 1,
    WEB_MANGA: 11,
    WEB_NOVEL: 12
  };

  data.originId = sourceMapping[data.source] || 0;
  delete data.source;

  const formatMapping = {
    TV: 1,
    MOVIE: 2,
    OVA: 3,
    ONA: 4,
    SPECIAL: 5,
    MUSIC: 6
  };

  data.typeId = formatMapping[data.format] || 0;
  delete data.format;
  delete data.type;

  const relationMapping = {
    PREQUEL: 1,
    SEQUEL: 2,
    ALTERNATIVE: 4,
    OTHER: 3,
    CHARACTER: 5
  };

  const animeRelations = data.relations.edges.map((edge) => ({
    id: edge.node.id,
    relationType: relationMapping[edge.relationType] || 6
  }));

  data.animeRelations = animeRelations;
  delete data.relations;

  const genreMap = {
    "Action": 38,
    "Mystery": 27,
    "Fantasy": 26,
    "Adventure": 25,
    "Drama": 32,
    "Horror": 29,
    "Sci-Fi": 69,
    "Mahou Shoujo": 41,
    "Thriller": 35,
    "Psychological": 28,
    "Mecha": 45,
    "Comedy": 37,
    "Romance": 43,
    "Slice of Life": 30,
    "Ecchi": 47,
    "Sports": 74,
    "Supernatural": 34,
    "Music": 94
  };

  const tagMap = {
    "Military": 84,
    "War": 63,
    "Isekai": 74,
    "Alternate Universe": 74,
    "School": 32,
    "School Club": 32,
    "Demons": 53,
    "Superhero": 96,
    "Space": 87,
    "Space Opera": 87,
    "Cars": 90,
    "Politics": 59,
    "Suicide": 56,
    "Gore": 56,
    "Video Games": 85,
    "Vampire": 67,
    "Police": 33,
    "Female Harem": 46,
    "Mixed Gender Harem": 46,
    "Male Harem": 80,
    "Seinen": 49,
    "Historical": 52,
    "Shoujo": 60,
    "Parody": 75,
    "Samurai": 95,
    "Josei": 101,
    "Crime": 102,
    "Food": 103,
    "Shounen": 48,
    "Yuri": 50,
    "Yaoi": 51,
    "Satire": 66,
    "Boys' Love": 104,
    "Teens' Love": 36,
    "Love Triangle": 36,
    "Boxing": 64,
    "Martial Arts": 68
  };

  let newGenres = [];

  for (let genre of data.genres) {
    const id = genreMap[genre];
    if (id) {
      newGenres.push(id);
    }
  }

  for (let tag of data.tags) {
    const id = tagMap[tag.name];
    if (id && !newGenres.includes(id)) {
      newGenres.push(id);
    }
  }

  const studioMap = {
    "White Fox": 161,
    "Madhouse": 165,
    "ufotable": 166,
    "A-1 Picture": 167,
    "Studio Pierrot": 168,
    "P.A.Works": 169,
    "Hoods Entertainment": 175,
    "Wit Studio": 176,
    "Shuka": 177,
    "J.C.Staff": 178,
    "Kyoto Animation": 179,
    "Gonzo": 181,
    "MAPPA": 182,
    "8bit": 183,
    "Kinema Citrus": 185,
    "Polygon Pictures": 186,
    "Pierrot Plus": 187,
    "Brain's Base": 189,
    "Sunrise": 190,
    "Production I.G": 191,
    "Diomedea": 192,
    "Bones": 193,
    "Silver Link": 194,
    "Lerche": 195,
    "Xebec": 196,
    "Satelight": 197,
    "AIC Plus+": 198,
    "Manglobe": 199,
    "Trigger": 200,
    "Science SARU": 201,
    "Passione": 202,
    "Shaft": 203,
    "Studio Deen": 204,
    "Arms": 205,
    "NAZ": 206,
    "Ezo'la": 207,
    "TNK": 208,
    "Production Reed": 211,
    "Ajia-Do": 212,
    "GoHands": 213,
    "TMS Entertainment": 214,
    "Shin-Ei Animation": 215,
    "Gainax": 216,
    "Pine Jam": 218,
    "AIC Build": 220,
    "Yumeta Company": 222,
    "Geno Studio": 223,
    "Toei Animation": 224,
    "Doga Kobo": 225,
    "Nippon Columbia": 226,
    "Tatsunoko Production": 227,
    "Telecom Animation Film": 228,
    "Seven": 229,
    "TROYCA": 230,
    "Triangle Staff": 231,
    "Imagin": 233,
    "Nut": 235,
    "TYO Animations": 236,
    "CloverWorks": 237,
    "production doA": 238,
    "Lay-duce": 239,
    "Studio Voln": 240,
    "Tezuka Productions": 241,
    "Zero-G": 242,
    "Studio PuYUKAI": 244,
    "feel.": 247,
    "Platinum Vision": 249,
    "Studio Gokumi": 250,
    "AXsiZ": 251,
    "Studio 3Hz": 252,
    "C-Station": 253,
    "David Production": 254,
    "Graphinica": 255,
    "Orange": 256,
    "Asread": 257,
    "A.C.G.T.": 258,
    "Zexcs": 259,
    "Haoliners Animation League": 262,
    "Artland": 263,
    "Project No.9": 264,
    "CoMix Wave Films": 265,
    "BeSTACK": 266,
    "AIC": 267,
    "Bridge": 268,
    "Creators in Pack": 269,
    "Studio Animal": 271,
    "Saetta": 272,
    "Production IMS": 273,
    "EMT": 274,
    "Studio Ghibli": 279,
    "Wao world": 284,
    "Bee Train": 287,
    "AIC Classic": 306,
    "LIDENFILMS": 311,
    "Encourage Films": 312,
    "Funimation": 313,
    "Namu Animation": 314,
    "Daume": 316,
    "Animax": 318,
    "VAP": 319,
    "OLM": 320,
    "Millepensee": 321,
    "Hal Film Maker": 323,
    "Bandai Namco Pictures": 324,
    "Studio Flad": 327,
    "DR Movie": 328,
    "Studio Comet": 329,
    "Studio Blanc": 330,
    "Manpuku Jinja": 331,
    "Nomad": 332,
    "DandeLion Animation Studio": 333,
    "Studio Gallop": 334,
    "Group TAC": 335,
    "Gaina": 336,
    "Square-Enix": 337,
    "Movic": 338,
    "SANZIGEN": 340,
    "LandQ studios": 342,
    "Fanworks": 343,
    "Studio 4C": 344,
    "blade": 347,
    "Emon, Blade": 348,
    "Karaku": 349,
    "Seven Arcs": 351,
    "Seven Arcs Pictures": 352,
    "AIC Spirits": 356,
    "drop": 357,
    "Wawayu Animation": 358,
    "Nexus": 359,
    "Vega Entertainment": 361,
    "ANIK": 362,
    "PrimeTime": 363,
    "SynergySP": 364,
    "G.CMay Animation & Film": 365,
    "Tokyo Kids": 366,
    "Actas": 367,
    "Plum": 368,
    "Bibury Animation Studios": 369,
    "Radix": 371,
    "Studio A-CAT": 373,
    "Oddjob": 374,
    "Maho Film": 375,
    "Urban Production": 376,
    "Craftar Studios": 377,
    "Kyotoma": 379,
    "Emon Animation Company": 380,
    "AIC ASTA": 381,
    "EKACHI EPILKA": 382,
    "Kamikaze Douga": 383,
    "UWAN Pictures": 385,
    "DLE": 387,
    "Nippon Animation": 388,
    "M.S.C": 390,
    "Non menzionato": 392,
    "Asahi Production": 394,
    "Yaoyorozu": 396,
    "Larx Entertainment": 397,
    "C2C": 398,
    "Felix Film": 399,
    "Signal.MD": 400,
    "Gathering": 401,
    "W-Toon Studio": 402,
    "Lilix": 403,
    "Studio Fantasia": 407,
    "Sentai Filmworks": 408,
    "Tokyo Movie Shinsha": 410,
    "monofilmo": 411,
    "GEEK TOYS": 412,
    "Shirogumi": 413,
    "Studio! Cucuri": 414,
    "Bouncy": 416,
    "Hobi Animation": 417,
    "Genco": 418,
    "Primastea": 420,
    "Trinet Entertainment": 421,
    "Seven Stone Entertainment": 422,
    "Anpro": 423,
    "Studio Chizu": 424,
    "Office DCI": 425,
    "Yokohama Animation Lab": 426,
    "ILCA": 427,
    "GRIZZLY": 428,
    "Connect": 430,
    "Revoroot": 431,
    "Trans Arts": 432,
    "Ordet": 433,
    "Studio LAN": 434,
    "2:10 AM Animation": 435,
    "Barnum Studio": 436,
    "TriF Studio": 440,
    "B&T": 441,
    "KJJ Animation": 442,
    "Shanghai Foch Film Culture Investmen": 445,
    "Planet": 447,
    "Knack Productions": 451,
    "G&G Entertainment": 456,
    "Suiseisha": 457,
    "IMAGICA Lab.": 459,
    "Studio Rikka": 460,
    "Rooster Teeth": 461,
    "Lesprit": 462,
    "Qualia Animation": 463,
    "Typhoon Graphics": 465,
    "Tencent Animation & Comics": 467,
    "A-Real": 468,
    "MASTER LIGHTS": 469,
    "Thundray": 471,
    "TAKI Corporation": 475,
    "ixtl": 479,
    "PRA": 480,
    "Twilight Studio": 481,
    "Jinnis Animation Studios": 482,
    "Chippai": 483,
    "Magic Bus": 484,
    "Ishimori Entertainment": 485,
    "Gallop": 486,
    "Rising Force": 487,
    "Kazami Gakuen Koushiki Douga-bu": 488,
    "Studio Hibari": 492,
    "Palm Studio": 494,
    "APPP": 495,
    "Team YokkyuFuman": 496,
    "G-angle": 497,
    "Studio Colorido": 498,
    "Rainbow": 499,
    "Animation Planet": 500,
    "Gainax Kyoto": 501,
    "Anima&Co": 502,
    "Drive": 503,
    "HOTZIPANG": 505,
    "Mushi Production": 506,
    "Dynamo Pictures": 507,
    "Children's Playground Entertainment": 509,
    "Studio Signpost": 510,
    "CygamesPictures": 511,
    "Sunrise Beyond": 515,
    "Buemon": 518,
    "Studio Elle": 520,
    "Arvo Animation": 521,
    "ENGI": 522,
    "WolfsBane": 523,
    "Studio Hokiboshi": 524,
    "DMM.futureworks": 525,
    "B.CMAY PICTURES": 526,
    "Think Corporation": 528,
    "Kitty Films": 530,
    "Sublimation": 532,
    "AQUA ARIS": 533,
    "Team TillDawn": 535,
    "Chaos Project": 537,
    "DMM pictures": 538,
    "Bushiroad": 539,
    "Kachidoki Studio": 540,
    "Studio Live": 542,
    "LICO": 545,
    "Studio Ponoc": 546,
    "Studio Bind": 547,
    "Okuruto Noboru": 548
  }

  let studio = [];
  for (let ttudio of data.studios.edges) {
    const id = studioMap[ttudio.node.name];
    if (id) {
      studio.push(id);
    }
  }

  data.studioId = studio;
  
  delete data.studios;
  delete data.tags;
  delete data.genres;

  data.genres = newGenres;
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
