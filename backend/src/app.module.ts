import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { HotelModule } from './modules/hotel/hotel.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mongoUrl = config.get<string>('MONGO_URL');
        return {
          uri: mongoUrl && mongoUrl.trim().length > 0
            ? mongoUrl
            : 'mongodb://localhost:27017/Travel',
        };
      },
    }),
    UserModule,
    HotelModule,
    // остальные модули
  ],
})
export class AppModule {}