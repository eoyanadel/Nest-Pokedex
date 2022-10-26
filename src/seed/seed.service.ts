import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) { }


  async executeSeed() {
  
    // Elimina todo lo que haya antes de ejecutar el seed
    await this.pokemonModel.deleteMany({})  //delete * from pokemons


    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    //Multiplies inserciones, es menos eficiente
    //const insertPromiseArray = [];

    const pokemonToInsert: { name: string, no: number }[] = [];
    
    data.results.forEach(async({ name, url }) => {
      
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      //const pokemon = await this.pokemonModel.create({ no, name });  
      
      //insertPromiseArray.push(this.pokemonModel.create({ no, name }));

      pokemonToInsert.push({ name, no });
    })        

    //Multiplies inserciones, es menos eficiente
    //await Promise.all(insertPromiseArray);

    //Una sola inserción con multiples entradas, más eficiente
    await this.pokemonModel.insertMany(pokemonToInsert);
    
    return 'Seed Executed';
  }
}
