import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole, UserStatus } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/modules/utils/services/cloudinary.service';
import { uploadImageAndDto } from '../dto/updatefile.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UploadApiResponse } from 'cloudinary';
import { buildDynamicPrismaFilter } from 'src/modules/utils/queryBuilder/prisma-filter-builder';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cloudinary: CloudinaryService
  ) {}

async create(createUserDto: CreateUserDto) {
  const existingUser = await this.prisma.user.findUnique({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    throw new ConflictException('User with this email already exists');
  }
  const saltRounds = Number(this.configService.get<string | number>('bcrypt_salt_rounds') ?? 10);
  const hashedPassword = await bcrypt.hash(createUserDto.password,saltRounds); 

  const user = await this.prisma.user.create({
    data: {
      ...createUserDto,
      password: hashedPassword, 
      role: createUserDto.role || UserRole.USER,
      
    },
  });
  user.password = ""
  return user;
}

   async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

   async uploadVideo(file: Express.Multer.File) {
  try {
    const result = await this.cloudinary.uploadFile(file, 'video');
    return {
      message: 'Video uploaded successfully',
      file: result,
    };
  } catch (error) {
    console.error('Video upload failed:', error);
    throw error;
  }
}

async uploadMultipleImages(files: Express.Multer.File[]) {
  const results: UploadApiResponse[] = [];

  for (const file of files) {
    try {
      const res: UploadApiResponse = await this.cloudinary.uploadFile(file);
      results.push(res);
    } catch (error) {
      console.error(`Failed to upload image ${file.originalname}:`, error);
    }
  }

  return {
    message: 'Multiple images uploaded',
    files: results,
  };
}

async uploadSingleImage(file: Express.Multer.File) {
  try {
    const result = await this.cloudinary.uploadFile(file);
    return {
      message: 'Single image uploaded',
      file: result,
    };
  } catch (error) {
    console.error('Upload single image failed:', error);
    throw error;
  }
}

 async findAllWithFilters(dto: Record<string, any>) {
    const where = buildDynamicPrismaFilter(dto);
    return this.prisma.user.findMany({ where });
  }

}






