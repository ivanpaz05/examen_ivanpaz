export type Trainer = {
  _id: string;
  name: string;
  pokemons: string[];
};

export type OwnedPokemon = {
  _id: string;
  pokemon: string;
  nickname: string;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  level: number;
  trainerId: string;
};
