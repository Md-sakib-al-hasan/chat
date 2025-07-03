
import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/emailService';
import { CloudinaryService } from './services/cloudinary.service';


@Global()
@Module({
  providers: [EmailService,CloudinaryService],
  exports: [EmailService,CloudinaryService], 
})
export class UtilsModule {}
