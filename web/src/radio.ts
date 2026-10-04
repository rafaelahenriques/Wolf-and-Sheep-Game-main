// Live radio from Radio Browser (radio-browser.info), a free community-run
// station directory that needs no API key. Two mirrors in case one is down.
const MIRRORS = ["https://de1.api.radio-browser.info", "https://de2.api.radio-browser.info"];

// Formats every major browser plays from a plain <audio> element.
const PLAYABLE_CODECS = ["MP3", "AAC", "AAC+"];

export interface Station {
  id: string;
  name: string;
  url: string;
  countryCode: string;
  country: string;
}

interface ApiCountry {
  iso_3166_1: string;
  stationcount: number;
}

interface ApiStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  codec: string;
  hls: number;
}

async function get<T>(path: string): Promise<T> {
  for (const base of MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.ok) return await res.json();
    } catch {
      // try the next mirror
    }
  }
  throw new Error("Radio Browser is unreachable");
}

let countryCodes: Promise<string[]> | null = null;

// Countries with enough stations that a random pick usually finds one that plays.
function loadCountryCodes() {
  if (!countryCodes) {
    countryCodes = get<ApiCountry[]>("/json/countries").then((list) =>
      list.filter((c) => c.stationcount >= 10).map((c) => c.iso_3166_1)
    );
    countryCodes.catch(() => (countryCodes = null)); // retry on the next call
  }
  return countryCodes;
}

// Radio Browser's own names read like "The United Arab Emirates"; the
// browser's are cleaner and in the visitor's language.
const regionNames = new Intl.DisplayNames(undefined, { type: "region" });

function countryName(code: string) {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

// A random popular station from a random country. Only HTTPS streams are
// used, since the deployed site can't play http:// audio.
export async function randomStation(excludeCountry?: string): Promise<Station> {
  const codes = (await loadCountryCodes()).filter((c) => c !== excludeCountry);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = pick(codes);
    const stations = await get<ApiStation[]>(
      `/json/stations/search?countrycode=${code}&hidebroken=true&is_https=true` +
        "&order=clickcount&reverse=true&limit=30"
    );
    const playable = stations.filter(
      (s) =>
        s.hls === 0 && PLAYABLE_CODECS.includes(s.codec) && s.url_resolved.startsWith("https://")
    );
    if (playable.length) {
      const s = pick(playable);
      return {
        id: s.stationuuid,
        name: s.name.trim(),
        url: s.url_resolved,
        countryCode: code,
        country: countryName(code),
      };
    }
  }
  throw new Error("No playable station found");
}

// Radio Browser asks apps to report plays; it feeds their popularity ranking.
export function reportPlay(stationId: string) {
  get(`/json/url/${stationId}`).catch(() => {});
}
