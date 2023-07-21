import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

export interface ID {
  id: string;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  profile: Profile;
  posts: Post[];
  subscribedToUser: User[];
  userSubscribedTo: User[];
}

export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
  user: User;
  memberType: Member;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
}

export interface Member {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
  profiles: Profile[];
}

export interface CreateUserArgs {
  dto: {
    name: string;
    balance: number;
  };
}

export interface SubscribeUserArgs {
  userId: string;
  authorId: string;
}

export interface CreatePostArgs {
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

export interface CreateProfileArgs {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  };
}
export interface ChangeUserArgs extends ID, CreateUserArgs {}
export interface UpdatePostArgs extends ID, CreatePostArgs {}
export interface UpdateProfileArgs extends ID, CreateProfileArgs {}
