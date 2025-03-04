import prismaClient from "@config/prismaClient";
import { User } from "./UserEntity";

class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prismaClient.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user, user.id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(user, user.id);
  }

  async create(data: User): Promise<User> {
    const user = await prismaClient.user.create({ data });
    return new User(user, user.id);
  }

  async delete(id: string): Promise<void> {
    await prismaClient.user.delete({ where: { id } });
  }
}

export { UserRepository };