import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Query } from '@nestjs/common';
import { ProductService, PaginatedResult } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductQueryDto } from './dto/product-query.dto';

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return callback(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
  }
  callback(null, true);
};

const multerStorage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Patch(':id/enable')
  enable(@Param('id', ParseMongoIdPipe) id: string): Promise<Product> {
    return this.productService.enable(id);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseMongoIdPipe) id: string): Promise<Product> {
    return this.productService.disable(id);
  }

  @Post('upload/single')
  @UseInterceptors(FileInterceptor('file', {
    storage: multerStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 //5 MB
    }
  }))
  uploadSingleImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filePath: `/uploads/products/${file.filename}`
    };
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: multerStorage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 //5MB
    }
  }))
  uploadMultipleImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    return files.map(file => ({
      filePath: `/uploads/products/${file.filename}`
    }));
  }
}