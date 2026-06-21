import { createServerFn } from "@tanstack/react-start";

export interface RobloxGameStats {
  placeId: number;
  universeId: number;
  name: string;
  playing: number;
  visits: number;
  favoritedCount: number;
  iconUrl: string | null;
  url: string;
  error?: string;
}

async function fetchUniverseId(placeId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { universeId: number | null };
    return data.universeId ?? null;
  } catch {
    return null;
  }
}

export const getRobloxGames = createServerFn({ method: "GET" })
  .inputValidator((data: { placeIds: number[] }) => data)
  .handler(async ({ data }): Promise<RobloxGameStats[]> => {
    const placeIds = data.placeIds;

    const universeIds = await Promise.all(
      placeIds.map(async (pid) => ({
        placeId: pid,
        universeId: await fetchUniverseId(pid),
      })),
    );

    const validUniverses = universeIds.filter(
      (u): u is { placeId: number; universeId: number } => u.universeId !== null,
    );
    const idsParam = validUniverses.map((u) => u.universeId).join(",");

    const [gamesRes, iconsRes] = await Promise.all([
      fetch(`https://games.roblox.com/v1/games?universeIds=${idsParam}`),
      fetch(
        `https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsParam}&size=512x512&format=Png&isCircular=false`,
      ),
    ]);

    const games = gamesRes.ok
      ? ((await gamesRes.json()) as { data: Array<any> }).data
      : [];
    const icons = iconsRes.ok
      ? ((await iconsRes.json()) as { data: Array<any> }).data
      : [];

    return placeIds.map((placeId) => {
      const u = universeIds.find((x) => x.placeId === placeId);
      const universeId = u?.universeId ?? 0;
      const g = games.find((x) => x.id === universeId);
      const icon = icons.find((x) => x.targetId === universeId);
      if (!g) {
        return {
          placeId,
          universeId,
          name: "Unavailable",
          playing: 0,
          visits: 0,
          favoritedCount: 0,
          iconUrl: null,
          url: `https://www.roblox.com/games/${placeId}`,
          error: "Could not load game",
        };
      }
      return {
        placeId,
        universeId,
        name: g.name,
        playing: g.playing ?? 0,
        visits: g.visits ?? 0,
        favoritedCount: g.favoritedCount ?? 0,
        iconUrl: icon?.imageUrl ?? null,
        url: `https://www.roblox.com/games/${placeId}`,
      };
    });
  });
