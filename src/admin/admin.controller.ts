import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get('users')
  async getUsers() {
    return this.usersService.findAll();
  }
}
