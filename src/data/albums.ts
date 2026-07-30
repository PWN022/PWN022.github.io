export interface Album {
  title: string;
  artist: string;
  year: number;
  cover: string;
  rating: number;       // 1-5
  genre?: string;
  comment?: string;
  link?: string;
}

export const albums: Album[] = [
  {
    title: "ye",
    artist: "Kanye West",
    year: 2018,
    cover: "/images/albums/ye.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "the best",
    link: "https://open.spotify.com/album/2Ek1q2haOnxVqhvVKqMvJe?si=4WbWBTb_S0yWY8Sdxg6ecQ",
  },
  {
    title: "Abbey Road",
    artist: "The Beatles",
    year: 1969,
    cover: "https://picsum.photos/seed/abbey/300/450",
    rating: 5,
    genre: "Rock",
    comment: "The perfect swan song. Side B medley is one of the greatest achievements in recorded music.",
    link: "https://music.douban.com/subject/1418652/",
  },
  {
    title: "Kind of Blue",
    artist: "Miles Davis",
    year: 1959,
    cover: "https://picsum.photos/seed/kindblue/300/450",
    rating: 5,
    genre: "Jazz",
    comment: "Modal jazz perfection. 'So What' is the coolest thing ever recorded.",
    link: "https://music.douban.com/subject/1436961/",
  },
  {
    title: "In Rainbows",
    artist: "Radiohead",
    year: 2007,
    cover: "https://picsum.photos/seed/inrain/300/450",
    rating: 5,
    genre: "Alternative / Art Rock",
    comment: "Warm, organic, and deeply human. 'Weird Fishes' is transcendent.",
    link: "https://music.douban.com/subject/2050143/",
  },
  {
    title: "Blonde",
    artist: "Frank Ocean",
    year: 2016,
    cover: "https://picsum.photos/seed/blonde/300/450",
    rating: 4,
    genre: "R&B / Soul",
    comment: "Minimalist and emotionally devastating. Gets better with every listen.",
    link: "https://music.douban.com/subject/26860071/",
  },
  {
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    year: 2015,
    cover: "https://picsum.photos/seed/tpab/300/450",
    rating: 5,
    genre: "Hip-Hop / Jazz Rap",
    comment: "A dense, challenging, era-defining album. Jazz, funk, and raw poetry.",
  },
  {
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    cover: "https://picsum.photos/seed/rumours/300/450",
    rating: 4,
    genre: "Rock / Pop",
    comment: "Every song is a hit. The personal drama behind it makes it even more compelling.",
  },
  {
    title: "Dark Side of the Moon",
    artist: "Pink Floyd",
    year: 1973,
    cover: "https://picsum.photos/seed/darkside/300/450",
    rating: 5,
    genre: "Progressive Rock",
    comment: "Timeless exploration of time, money, and madness. The production still sounds futuristic.",
  },
  {
    title: "Melodrama",
    artist: "Lorde",
    year: 2017,
    cover: "https://picsum.photos/seed/melodrama/300/450",
    rating: 4,
    genre: "Pop / Art Pop",
    comment: "A coming-of-age masterpiece painted in neon and heartbreak. Jack Antonoff's best production.",
  },
  {
    title: "Channel Orange",
    artist: "Frank Ocean",
    year: 2012,
    cover: "https://picsum.photos/seed/channel/300/450",
    rating: 4,
    genre: "R&B / Soul",
    comment: "Cinematic storytelling. 'Pyramids' is a 10-minute journey worth every second.",
  },
];
