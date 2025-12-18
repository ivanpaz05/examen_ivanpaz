import { IResolvers } from "@graphql-tools/utils";
import { catchPokemon, createPokemon, freePokemon, getPokemonById, getPokemons } from "../collections/pokemons";
import { createTrainer, validateTrainer } from "../collections/trainers";
import { signToken } from "../auth";
import { Trainer } from "../types";
import { getDB } from "../db/mongo";
import { ObjectId } from "mongodb";
import { COLLECTION_OWNEDPOKEMONS } from "../utils";




export const resolvers: IResolvers = {
    Query: {
        pokemons: async (_, { page, size }) => {
            return await getPokemons(page, size);
        },
        pokemon: async (_, { id }) => {
            return await getPokemonById(id);
        },
        me: async (_, __, { user }) => {
            if(!user) return null;
            return {
                _id: user._id.toString(),
                ...user
            }
        }
    },
    Mutation: {
        startJourney: async (_, { name, password }) => {
            const userId = await createTrainer(name, password);
            return signToken(userId);
        },
        login: async (_, { name, password }) => {
            const user = await validateTrainer(name, password);
            if(!user) throw new Error("Invalid credentials");
            return signToken(user._id.toString());
        },
        createPokemon: async (_, { name, description, height, weight, types }, { user }) => {
            if(!user) throw new Error("You must be logged in to create pokemons");
            return await createPokemon(name, description, height, weight, types);
        },
        catchPokemon: async (_, { pokemonId, nickname }, { user }) => {
            if(!user) throw new Error("You must be logged in to catch pokemons");
            return await catchPokemon(pokemonId, nickname, user._id.toString());
        },
        freePokemon: async (_, { ownedPokemonId }, { user }) => {
            if(!user) throw new Error("You must be logged in to free pokemons");
            return await freePokemon(ownedPokemonId, user._id.toString());
        }
    },
    Trainer: {
        pokemons: async (parent: Trainer) => {
            const db = getDB();
            const listaDeIds = parent.pokemons;
            if(!listaDeIds) return [];
            const objectIds = listaDeIds.map((id) => new ObjectId(id));
            return db
                .collection(COLLECTION_OWNEDPOKEMONS)
                .find({ _id: { $in: objectIds } })
                .toArray();
        }
    },
    OwnedPokemon: {
        pokemon: async (parent) => {
            return await getPokemonById(parent.pokemon);
        }
    }
}
