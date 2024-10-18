import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  onModuleInit() {
    this.$connect();
    this.logger.log('MONGODB connected');
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;
    
  
    try {
      // Verificar conexión a la base de datos
      await this.checkDatabaseConnection();
  
      // Verificar si el usuario ya existe
      const user = await this.user.findUnique({
        where: { email: email },
      });
  
      if (user) {
        throw new RpcException({ status: 400, message: 'User exists' });
      }
  
      // Crear nuevo usuario
      const newUser = await this.user.create({
        data: {
          email,
          name,
          password,
        },
      });
  
      this.logger.log('FIN');
      return {
        user: newUser,
        token: 'abc',
      };
  
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message });
    }
  }
  
  // Función para verificar la conexión con la base de datos
  private async checkDatabaseConnection() {
    try {
      await this.user.findMany({ take: 1 }); // Simple consulta para verificar conexión
      this.logger.log('Conexión con la base de datos exitosa');
    } catch (error) {
      this.logger.error('No se pudo conectar a la base de datos', error);
      throw new RpcException({ status: 500, message: 'Error en la conexión con la base de datos' });
    }
  }
  
}
