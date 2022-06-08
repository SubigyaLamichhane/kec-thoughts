import argon2 from 'argon2';
import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { v4 } from 'uuid';
import validator from 'validator';
import { COOKIE_NAME, FORGET_PASSWORD_INDEX } from '../constants';
import { User } from '../entities/User';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { UsernamePasswordInput } from './UsernamePasswordInput';

@InputType()
export class LoginInput {
  @Field()
  usernameOrEmail: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class ForgotResponse {
  @Field(() => Boolean)
  searched: Boolean;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      // this is the current user
      return user.email;
    }
    // the current user is trying to see someone elses email
    return '';
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newpassword',
            message: 'password length must be greater than 3',
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_INDEX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'The token has expired',
          },
        ],
      };
    }

    const user = await User.findOne({ where: { id: parseInt(userId) } });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exists.',
          },
        ],
      };
    }

    await User.update(
      { id: parseInt(userId) },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    //login after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => ForgotResponse)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ): Promise<ForgotResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      //The email is not in the db
      return {
        searched: true,
      };
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_INDEX + token,
      user.id,
      'EX',
      1000 * 60 * 60 * 24
    );

    const html = `<a href="http://localhost:3000/change-password/${token}">resetpassword</a>`;
    await sendEmail(email, html);

    return {
      searched: true,
    };
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne({ where: { id: req.session.userId } });
    if (user?.isAdmin === null) {
      user.isAdmin = false;
    }

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(options.password);

    const response = validateRegister(options);
    if (response) {
      return response;
    }

    /*
      query builder 
      let user;
      try{
        const result = await (em as EntityManager)
          .createQueryBuilder(User)
          .getKnexQuery()
          .insert({
            username: options.username,
            email: options.email,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning('*');
          user = result[0];
      } catch (err) {

      }
    */
    let user;
    try {
      user = await User.create({
        username: options.username.toLowerCase(),
        password: hashedPassword,
        email: options.email,
      }).save();
    } catch (err) {
      if (err.detail.includes('already exists')) {
        if (err.detail.includes('(email)=')) {
          return {
            errors: [
              {
                field: 'email',
                message: 'Email already exists.',
              },
            ],
          };
        }
        if (err.detail.includes('(username)=')) {
          //Username already exists
          return {
            errors: [
              {
                field: 'username',
                message: 'Username already exists.',
              },
            ],
          };
        }
      }
    }

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Internal Server Error.',
          },
        ],
      };
    }
    if (user.isAdmin === null) {
      user.isAdmin = false;
    }
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: validator.isEmail(options.usernameOrEmail)
        ? {
            email: options.usernameOrEmail,
          }
        : {
            username: options.usernameOrEmail,
          },
    });
    if (!user) {
      if (validator.isEmail(options.usernameOrEmail)) {
        return {
          errors: [{ field: 'usernameOrEmail', message: 'Wrong Email' }],
        };
      } else {
        return {
          errors: [{ field: 'usernameOrEmail', message: 'Wrong Username' }],
        };
      }
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'incorrect password' }],
      };
    }
    // set the userId is the session
    req.session.userId = user.id;
    if (user.isAdmin === null) {
      user.isAdmin = false;
    }
    return {
      user,
    };
  }
}
