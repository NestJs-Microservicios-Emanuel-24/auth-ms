import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { compare } from 'nats/lib/nats-base-client/semver';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload.interface';
import { envs } from 'src/common/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  private readonly logger = new Logger('AuthService');

  onModuleInit() {
    this.$connect();
    this.logger.log('MONGODB connected');
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      await this.validateUserUnique(email);
      // Crear nuevo usuario
      const newUser = await this.user.create({
        data: {
          email,
          name,
          password: bcrypt.hashSync(password, 12),
        },
      });
      const { password: __dirname, ...parcialUser } = newUser;
      return {
        user: parcialUser,
        token: await this.signJWT(parcialUser),
      };
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'Email/Password not valid',
        });
      }
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Email/Password not valid',
        });
      }

      const { password: __dirname, ...parcialUser } = user;
      return {
        user: parcialUser,
        token: await this.signJWT(parcialUser),
      };
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message });
    }
  }

  private async validateUserUnique(email) {
    // Verificar si el usuario ya existe
    const user = await this.user.findUnique({
      where: { email: email },
    });
    if (user) {
      throw new RpcException({ status: 400, message: 'Usuario ya existe' });
    }
  }

  // Función para verificar la conexión con la base de datos
  private async checkDatabaseConnection() {
    try {
      await this.user.findMany({ take: 1 }); // Simple consulta para verificar conexión
    } catch (error) {
      this.logger.error('No se pudo conectar a la base de datos', error);
      throw new RpcException({
        status: 500,
        message: 'Error en la conexión con la base de datos',
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      return { user, token: await this.signJWT(user) };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'invalid token',
      });
    }
  }
}
