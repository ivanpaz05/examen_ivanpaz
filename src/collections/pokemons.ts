import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { COLLECTION_POKEMONS, COLLECTION_TRAINERS } from "../utils";




export const getPokemons = async (page?: number, size?: number) => {
    const db = getDB();
    page = page || 1;
    size = size || 10;
    return await db.collection(COLLECTION_POKEMONS).find().skip((page - 1) * size).limit(size).toArray();
};

export const getPokemonById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_POKEMONS).findOne({_id: new ObjectId(id)});
};

export const createPokemon = async (name: string, description: string, height: number, weight: number, types: string[]) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_POKEMONS).insertOne({
        name,
        description,
        height,
        weight,
        types
    });
    const newPokemon = await getPokemonById(
        result.insertedId.toString()
    );
    return newPokemon;
};

export const catchPokemon = async (pokemonId: string, nickname: string | undefined, trainerId: string) => {
    const db = getDB();
    const localTrainerId = new ObjectId(trainerId);
    const localPokemonId = new ObjectId(pokemonId);

    const pokemonToAdd = await db.collection(COLLECTION_POKEMONS).findOne({_id: localPokemonId});
    if(!pokemonToAdd) throw new Error("Pokemon not found");

    const trainer = await db.collection(COLLECTION_TRAINERS).findOne({_id: localTrainerId});
    if(!trainer) throw new Error("Trainer not found");

    const team = trainer.pokemons || [];
    if(team.length >= 6) throw new Error(
        "You can onl have 6 pokemons"
    );

    const newOwned = await createOwnedPokemon(
        pokemonId, nickname, trainerId
    );
    if(!newOwned) throw new Error(
        "Error creating owned pokemon"
    );

    await db.collection(COLLECTION_TRAINERS).updateOne(
        { _id: localTrainerId },
        { $addToSet: { pokemons: newOwned._id.toString() } }
    );

    return newOwned;
}

export const freePokemon = async (ownedPokemonId: string, trainerId: string) => {
    const db = getDB();
    const localTrainerId = new ObjectId(trainerId);

    const trainer = await db.collection(COLLECTION_TRAINERS).findOne({_id: localTrainerId});
    if(!trainer) throw new Error("Trainer not found");

    const team = trainer.pokemons || [];
    if(!team.includes(ownedPokemonId)) throw new Error(
    "You can only free your own pokemons"
    );

    await deleteOwnedPokemon(ownedPokemonId);

    const newTeam = team.filter(
        (id: string) => id !== ownedPokemonId
    );

    await db.collection(COLLECTION_TRAINERS).updateOne(
        { _id: localTrainerId },
        { $set: { pokemons: newTeam } }
    );

    const updatedTrainer = await db.collection(COLLECTION_TRAINERS).findOne({_id: localTrainerId});
    return updatedTrainer;
}
