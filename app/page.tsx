import Image from "next/image";

type PokemonResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  sprites: {
    other?: {
      "official-artwork"?: {
        front_default?: string | null;
      };
    };
    front_default?: string | null;
  };
};

type SearchParams = Promise<{
  pokemon?: string | string[];
}>;

async function getPokemon(name: string) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch Pokemon data");
  }

  return (await response.json()) as PokemonResponse;
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function toDisplayName(value: string) {
  return formatLabel(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const artwork =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6_0%,#ffd86b_28%,#f5663f_58%,#2b1745_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-start">
        <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/78 p-8 shadow-[0_24px_90px_rgba(43,23,69,0.24)] backdrop-blur md:p-10 lg:w-[26rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">
            Poke Search
          </p>
          <h1 className="mt-4 max-w-sm text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Search the PokeAPI by Pokemon name
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
                and render a simple result card.
              </p>
            </div>
          ) : pokemon ? (
            <article className="grid gap-6 rounded-[2rem] border border-white/20 bg-slate-950/82 p-8 text-white shadow-[0_24px_90px_rgba(43,23,69,0.3)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
                  #{pokemon.id.toString().padStart(4, "0")}
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                  {toDisplayName(pokemon.name)}
                </h2>

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

                <dl className="mt-8 grid gap-4 sm:grid-cols-3">
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
                      Abilities
                    </dt>
                    <dd className="mt-2 text-lg font-bold text-white">
                      {pokemon.abilities
                        .slice(0, 2)
                        .map(({ ability }) => toDisplayName(ability.name))
                        .join(", ")}
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
                    className="relative z-10 h-auto max-h-72 w-full max-w-xs object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
                  />
                ) : (
                  <p className="relative z-10 text-center text-sm font-medium uppercase tracking-[0.3em] text-slate-950">
                    No artwork available
                  </p>
                )}
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
