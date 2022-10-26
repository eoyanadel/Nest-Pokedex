import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService) 
    { 
      //define el valor de defaultLimit desde las varaibles de entorno del archivo env.config.ts
      this.defaultLimit = configService.get<number>('dafaultLimit');
    }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);  
      return pokemon;

    } catch (error) {
      this.handleExceptions(error);
    }
  }


  findAll(paginationDto: PaginationDto) {
    
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    
    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__V');  //omitimos el campo __v
  }


  async findOne(terminoBusqueda: string) {
    
    let pokemon: Pokemon;

    // si es un numero, correspondeo al campo "no" del pokemon (numero del pokemon)
    if (!isNaN(+terminoBusqueda)) {
      pokemon = await this.pokemonModel.findOne({ no: terminoBusqueda });
    }

    // Mongo Id
    if (!pokemon && isValidObjectId(terminoBusqueda)) {
      pokemon = await this.pokemonModel.findById(terminoBusqueda);
    }

    // Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: terminoBusqueda.toLocaleLowerCase().trim() });
    }    

    if (!pokemon)
      throw new NotFoundException(`Pokemon with id, name or n° "${ terminoBusqueda }" not found`);

    return pokemon;
  }


  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name) 
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {        
      await pokemon.updateOne(updatePokemonDto);
  
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions(error);
    }
  }


  async remove(id: string) {
    // DOBLE CONSULTA A LA BD
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    
    // SI EL ID NO EXISTE TIRA UN HTTPCODE 200 DE OK Y NO AVISA QUE NO EXISTE EL ID
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) 
      throw new BadRequestException(`Pokemon with Id ${ id } not found`);
    
    return;
  }


  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue) }`);
    }
    console.log(error);

    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
