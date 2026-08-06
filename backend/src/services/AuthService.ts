import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';

export class AuthService {
  public async register(data: any) {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
      organizationName: z.string(),
    });

    const parsed = schema.parse(data);

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const organization = await prisma.organization.create({
      data: { name: parsed.organizationName },
    });

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        name: parsed.name,
        organizationId: organization.id,
      },
    });

    const token = this.generateToken(user);

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  public async login(data: any) {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsed = schema.parse(data);

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(parsed.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  private generateToken(user: any) {
    return jwt.sign(
      { id: user.id, email: user.email, organizationId: user.organizationId },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
  }
}
