export const SITE_TITLE = "!W0ND3R";
export const SITE_DESCRIPTION = "Just Wondering...";
export const AUTHOR = "iW0ND3R";
export const SITE_URL = "https://attackor7.tech";
export const SITE_START_DATE = "2026-07-30"; // 建站日期，用于运行时长

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/posts/" },
  { label: "Tags", href: "/tags/" },
  { label: "Albums", href: "/albums/" },
  { label: "Me", href: "/about/" },
  { label: "RSS", href: "/rss.xml" },
] as const;

export const POSTS_PER_PAGE = 20;

export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/PWN022", icon: "gh" },
] as const;
