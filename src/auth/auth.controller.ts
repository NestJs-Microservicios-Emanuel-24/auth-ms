import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthActions } from 'src/common/enums/auth-actions.enum';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthActions.REGISTER)
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern(AuthActions.LOGIN)
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @MessagePattern(AuthActions.VERIFY)
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token)
  }
}
