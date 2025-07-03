import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, UseGuards, Req, UseInterceptors, UploadedFile, Res, UploadedFiles, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/common/jwt/jwt.guard';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { RolesGuard } from 'src/common/jwt/roles.guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { UserRole } from 'generated/prisma';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { uploadImageAndDto } from '../dto/updatefile.dto';
import { UserFilterDto } from '../dto/create-user.dto';

@ApiTags('Users Management')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

 
@Post('/upload-video')
@UseInterceptors(FileInterceptor('video'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      video: { type: 'string', format: 'binary' },
    },
  },
})
async uploadVideo(
  @UploadedFile() video: Express.Multer.File,
) {
  const result = await this.userService.uploadVideo(video);
  return {
    message: 'Video uploaded successfully',
    data: result,
  };
}


@Post('/upload-image')
@UseInterceptors(FileInterceptor('image'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      image: { type: 'string', format: 'binary' },
    },
  },
})
async uploadSingleImage(
  @UploadedFile() image: Express.Multer.File,
) {
  const result = await this.userService.uploadSingleImage(image);
  return {
    message: 'Image uploaded successfully',
    data: result,
  };
}


@Post('/upload-multiple-images')
@UseInterceptors(FilesInterceptor('images', 10)) // limit to 10 images
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      images: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
async uploadMultipleImages(
  @UploadedFiles() images: Express.Multer.File[],
) {
  const result = await this.userService.uploadMultipleImages(images);
  return {
    message: 'Images uploaded successfully',
    data: result,
  };
}


  @Get('findAll')
  async findUsers(@Query() filterDto: UserFilterDto) {
    return this.userService.findAllWithFilters(filterDto);
  }


 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles(UserRole.USER)
  @Get('getSingleUser')
  async findUser(@Req() req: RequestWithUser,) {
    const id = req.user.userId
    return this.userService.findUserById(id);
  }
}
