import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { COLLECTION_OWNEDPOKEMONS } from "../utils";





const rnd = () => Math.floor(Math.random() * 100) + 1;

export const getOwnedPokemonById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_OWNEDPOKEMONS)
        .findOne({_id: new ObjectId(id)});
};

export const createOwnedPokemon = async (pokemonId: string, nickname: string | undefined, trainerId: string) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_OWNEDPOKEMONS).insertOne({
        pokemon: pokemonId,
        nickname,
        attack: rnd(),
        defense: rnd(),
        speed: rnd(),
        special: rnd(),
        level: rnd(),
        trainerId
    });
    const newOwned = await getOwnedPokemonById(
        result.insertedId.toString()
    );
    return newOwned;
};

export const deleteOwnedPokemon = async (ownedPokemonId: string) => {
    const db = getDB();
    await db.collection(COLLECTION_OWNEDPOKEMONS).deleteOne({
        _id: new ObjectId(ownedPokemonId)
    });
};
