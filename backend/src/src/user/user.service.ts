import { CreateUserDto } from '@/user/dto/createUser.dto';
import { UserEntity } from '@/user/user.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserResponse } from './types/userResponse.interface';
import { sign, verify } from 'jsonwebtoken';
import { LoginDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
    const newUser = new UserEntity();
    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    Object.assign(newUser, createUserDto);
    const savedUser = await this.userRepository.save(newUser);
    return this.generateUserResponse(savedUser);
  }

  async loginUser(loginUserDto: LoginDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });

    console.log(user, loginUserDto);
    if (!user) {
      throw new HttpException(
        'Wrong email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const matchPassword = await compare(loginUserDto.password, user.password);
    console.log(matchPassword);
    if (!matchPassword) {
      throw new HttpException(
        'Wrong email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    delete user.password;

    return user;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(
        `User with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
  generateToken(user: UserEntity): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Only include safe properties in the token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return sign(payload, jwtSecret, { expiresIn: '24h' });
  }

  generateUserResponse(user: UserEntity): IUserResponse {
    return {
      user: {
        ...user,
        token: this.generateToken(user),
      },
    };
  }
}
