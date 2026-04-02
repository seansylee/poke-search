import Image from "next/image";

type PokemonResponse = {
  id: number;
  order: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  abilities: Array<{
    is_hidden: boolean;
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
    };
  }>;
  species: {
    url: string;
  };
  sprites: {
    other?: {
      "official-artwork"?: {
        front_default?: string | null;
      };
    };
    front_default?: string | null;
  };
};

type PokemonSpeciesResponse = {
  base_happiness: number;
  capture_rate: number;
  color: {
    name: string;
  } | null;
  egg_groups: Array<{
    name: string;
  }>;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
    version: {
      name: string;
    };
  }>;
  genera: Array<{
    genus: string;
    language: {
      name: string;
    };
  }>;
  growth_rate: {
    name: string;
  } | null;
  habitat: {
    name: string;
  } | null;
  hatch_counter: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  shape: {
    name: string;
  } | null;
};

type EvolutionChainResponse = {
  chain: EvolutionLink;
};

type EvolutionLink = {
  species: {
    name: string;
  };
  evolves_to: EvolutionLink[];
};

type SearchParams = Promise<{
  pokemon?: string | string[];
}>;

async function getResource<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon data");
  }

  return (await response.json()) as T;
}

async function getPokemon(name: string) {
  return getResource<PokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${name}`);
}

async function getPokemonSpecies(url: string) {
  return getResource<PokemonSpeciesResponse>(url);
}

async function getEvolutionChain(url: string) {
  return getResource<EvolutionChainResponse>(url);
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function toDisplayName(value: string) {
  return formatLabel(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanFlavorText(value: string) {
  return value.replace(/[\f\n\r]+/g, " ").replace(/\s+/g, " ").trim();
}

function getEnglishFlavorText(species: PokemonSpeciesResponse | null) {
  const englishEntry = species?.flavor_text_entries.find(
    ({ language }) => language.name === "en",
  );

  return englishEntry ? cleanFlavorText(englishEntry.flavor_text) : null;
}

function getEnglishGenus(species: PokemonSpeciesResponse | null) {
  return (
    species?.genera.find(({ language }) => language.name === "en")?.genus ?? null
  );
}

function flattenEvolutionChain(chain: EvolutionLink): string[] {
  return [
    chain.species.name,
    ...chain.evolves_to.flatMap((nextStage) => flattenEvolutionChain(nextStage)),
  ];
}

function StatBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const percent = Math.min((value / 255) * 100, 100);

  return (
    <div className="rounded-3xl bg-white/6 p-4">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
          {label}
        </dt>
        <dd className="text-2xl font-black text-white">{value}</dd>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawPokemon = Array.isArray(params.pokemon)
    ? params.pokemon[0]
    : params.pokemon;
  const pokemonName = rawPokemon?.trim().toLowerCase() ?? "";
  const pokemon = pokemonName ? await getPokemon(pokemonName) : null;
  const species = pokemon ? await getPokemonSpecies(pokemon.species.url) : null;
  const evolutionChain = species
    ? await getEvolutionChain(species.evolution_chain.url)
    : null;
  const artwork =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default;
  const flavorText = getEnglishFlavorText(species);
  const genus = getEnglishGenus(species);
  const abilityNames =
    pokemon?.abilities.map(({ ability, is_hidden }) =>
      is_hidden
        ? `${toDisplayName(ability.name)} (Hidden)`
        : toDisplayName(ability.name),
    ) ?? [];
  const moveNames =
    pokemon?.moves.slice(0, 12).map(({ move }) => toDisplayName(move.name)) ?? [];
  const evolutionStages = evolutionChain
    ? Array.from(new Set(flattenEvolutionChain(evolutionChain.chain)))
    : [];
  const totalStats =
    pokemon?.stats.reduce((sum, { base_stat }) => sum + base_stat, 0) ?? 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6_0%,#ffd86b_28%,#f5663f_58%,#2b1745_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/78 p-8 shadow-[0_24px_90px_rgba(43,23,69,0.24)] backdrop-blur md:p-10 lg:w-[26rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">
            Poke Search
          </p>
          <h1 className="mt-4 max-w-sm text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Pokemon search goes brrr 🚀 
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Type a Pokemon like pikachu, mew, or charizard and fetch its core
            stats straight from the API.
          </p>

          <form className="mt-8 flex flex-col gap-3" action="/">
            <label className="text-sm font-semibold text-slate-700" htmlFor="pokemon">
              Pokemon name
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="pokemon"
                name="pokemon"
                defaultValue={rawPokemon}
                placeholder="pikachu"
                className="h-14 flex-1 rounded-full border border-slate-200 bg-white px-5 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-200"
              />
              <button
                type="submit"
                className="h-14 rounded-full bg-slate-950 px-6 text-base font-semibold text-white transition hover:bg-orange-500"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            {["pikachu", "bulbasaur", "snorlax", "gengar"].map((sample) => (
              <a
                key={sample}
                href={`/?pokemon=${sample}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                {sample}
              </a>
            ))}
          </div>
        </section>

        <section className="flex-1">
          {!pokemonName ? (
            <div className="rounded-[2rem] border border-white/20 bg-slate-950/80 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                Ready
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                Start with a Pokemon name.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                The page uses the search field above to call the live PokeAPI
                and render a fuller Pokedex profile with species details, stats,
                and evolution data.
              </p>
            </div>
          ) : pokemon ? (
            <article className="space-y-6">
              <div className="grid gap-6 rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:grid-cols-[1.05fr_0.95fr] md:p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                    #{pokemon.id.toString().padStart(4, "0")} • Order{" "}
                    {pokemon.order}
                  </p>
                  <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                    {toDisplayName(pokemon.name)}
                  </h2>
                  {genus ? (
                    <p className="mt-3 text-lg font-medium text-slate-200">
                      {genus}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {pokemon.types.map(({ type }) => (
                      <span
                        key={type.name}
                        className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200"
                      >
                        {formatLabel(type.name)}
                      </span>
                    ))}
                  </div>

                  {flavorText ? (
                    <p className="mt-8 max-w-2xl text-base leading-7 text-slate-200">
                      {flavorText}
                    </p>
                  ) : null}

                  <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Height
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {pokemon.height / 10}m
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Weight
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {pokemon.weight / 10}kg
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Base EXP
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {pokemon.base_experience}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Total Stats
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {totalStats}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top,#fff7d6_0%,#ffb703_25%,#fb8500_52%,#5a189a_100%)] p-6">
                  <div className="absolute inset-x-10 bottom-6 h-10 rounded-full bg-slate-950/25 blur-2xl" />
                  {artwork ? (
                    <Image
                      src={artwork}
                      alt={pokemon.name}
                      width={475}
                      height={475}
                      priority
                      className="relative z-10 h-auto max-h-80 w-full max-w-sm object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <p className="relative z-10 text-center text-sm font-medium uppercase tracking-[0.3em] text-slate-950">
                      No artwork available
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                    Base Stats
                  </p>
                  <dl className="mt-6 grid gap-4 md:grid-cols-2">
                    {pokemon.stats.map(({ base_stat, stat }) => (
                      <StatBar
                        key={stat.name}
                        label={formatLabel(stat.name)}
                        value={base_stat}
                      />
                    ))}
                  </dl>
                </section>

                <section className="rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                    Field Notes
                  </p>
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Abilities
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-white">
                        {abilityNames.join(", ")}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Habitat
                      </dt>
                      <dd className="mt-2 text-base font-semibold text-white">
                        {species?.habitat
                          ? toDisplayName(species.habitat.name)
                          : "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Growth Rate
                      </dt>
                      <dd className="mt-2 text-base font-semibold text-white">
                        {species?.growth_rate
                          ? toDisplayName(species.growth_rate.name)
                          : "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Egg Groups
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-white">
                        {species?.egg_groups.length
                          ? species.egg_groups
                              .map(({ name }) => toDisplayName(name))
                              .join(", ")
                          : "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Capture Rate
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {species?.capture_rate ?? "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Base Happiness
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {species?.base_happiness ?? "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Hatch Counter
                      </dt>
                      <dd className="mt-2 text-3xl font-bold text-white">
                        {species?.hatch_counter ?? "Unknown"}
                      </dd>
                    </div>
                    <div className="rounded-3xl bg-white/6 p-4">
                      <dt className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Classification
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-white">
                        {[
                          species?.shape ? toDisplayName(species.shape.name) : null,
                          species?.color ? toDisplayName(species.color.name) : null,
                          species?.is_baby ? "Baby" : null,
                          species?.is_legendary ? "Legendary" : null,
                          species?.is_mythical ? "Mythical" : null,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Standard"}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                    Evolution Chain
                  </p>
                  {evolutionStages.length ? (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {evolutionStages.map((stage, index) => (
                        <div
                          key={`${stage}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <span className="rounded-full bg-white/8 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                            {toDisplayName(stage)}
                          </span>
                          {index < evolutionStages.length - 1 ? (
                            <span className="text-lg text-orange-300">→</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-base leading-7 text-slate-300">
                      Evolution data is not available for this Pokemon.
                    </p>
                  )}
                </section>

                <section className="rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                    Move Snapshot
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {moveNames.map((move) => (
                      <span
                        key={move}
                        className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 text-sm leading-6 text-slate-400">
                    Showing the first {moveNames.length} of {pokemon.moves.length}{" "}
                    recorded moves from the API response.
                  </p>
                </section>
              </div>
            </article>
          ) : (
            <div className="rounded-[2rem] border border-red-200/40 bg-red-950/75 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-200">
                Not Found
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                No Pokemon matched &quot;{pokemonName}&quot;.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-red-100/80">
                Check the spelling or try one of the sample names on the left.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
