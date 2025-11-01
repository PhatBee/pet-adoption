import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pet, PetSchema, Product, ProductSchema } from '../product/schemas/product.schema';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pet.name, schema: PetSchema },
      { name: Product.name, schema: ProductSchema } 
    ]),
  ],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService]
})
export class PetModule {}