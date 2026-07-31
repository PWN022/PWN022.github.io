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
    comment: "the best.",
    link: "https://open.spotify.com/album/2Ek1q2haOnxVqhvVKqMvJe?si=4WbWBTb_S0yWY8Sdxg6ecQ",
  },
  {
    title: "The College Dropout",
    artist: "Kanye West",
    year: 2004,
    cover: "/images/albums/TCD.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "how do You Live?",
    link: "https://open.spotify.com/album/3lQePoIm6iNQIiZkCYxCy0",
  },
  {
    title: "DONDA",
    artist: "Kanye West",
    year: 2021,
    cover: "/images/albums/DONDA.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "love, regret, faith, and all.",
    link: "https://open.spotify.com/album/5CnpZV3q5BcESefcB3WJmz",
  },
  {
    title: "Yeezus",
    artist: "Kanye West",
    year: 2013,
    cover: "/images/albums/Yeezus.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "when true love arrives, please play ‘Bound 2’ for me.",
    link: "https://open.spotify.com/album/7D2NdGvBHIavgLhmcwhluK",
  },
  {
    title: "Graduation",
    artist: "Kanye West",
    year: 2007,
    cover: "/images/albums/graduation.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "find your dreams come true!",
    link: "https://open.spotify.com/album/4SZko61aMnmgvNhfhgTuD3",
  },
  {
    title: "Dawn FM",
    artist: "The Weeknd",
    year: 2022,
    cover: "/images/albums/DawnFm.jpg",
    rating: 5,
    genre: "R&B / Soul / Synth-Pop / Disco",
    comment: "‘You are now listening to 103.5 Dawn FM\nYou've been in the dark for way too long\nIt's time to walk into the light’",
  },
  {
    title: "Starboy",
    artist: "The Weeknd",
    year: 2016,
    cover: "/images/albums/Starboy.jpg",
    rating: 5,
    genre: "R&B / Synth-Pop / Disco / Funk",
    comment: "Starboy's swagger\nDie For You's devotion\nA Lonely Night's groove\n— that's the whole mood.",
  },
  {
    title: "冀西南林路行",
    artist: "万能青年旅店",
    year: 2020,
    cover: "/images/albums/河北墨麒麟.jpg",
    rating: 5,
    genre: "Rock",
    comment: "河北墨麒麟，神兽沉痛，闭口不言\n它试遍了人间的轻身术\n看透了演员王公游民盗贼的心电图，最后只发出一声怒吼，消失在电子荒原。",
  },
  {
    title: "Scorpion",
    artist: "Drake",
    year: 2018,
    cover: "/images/albums/Scorpion.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "god's plan\n尽人事，听天命",
  },
  {
    title: "17",
    artist: "XXXTENTACION",
    year: 2017,
    cover: "/images/albums/17.jpg",
    rating: 5,
    genre: "Rap / Hip-Hop",
    comment: "pain is real, and so is hope.",
  },
];
