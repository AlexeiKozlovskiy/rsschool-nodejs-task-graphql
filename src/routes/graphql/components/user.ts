import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import {
  ID,
  Post,
  Profile,
  CreateUserArgs,
  ChangeUserArgs,
  SubscribeUserArgs,
  Context,
} from '../types/types.js';
import { typeArgs } from '../types/constant.js';
import { profileType, profileToUserResolve } from './profile.js';
import { postType, postToUserResolve } from './post.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profileType,
      resolve: profileToUserResolve,
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: postToUserResolve,
    },
    subscribedToUser: {
      type: new GraphQLList(userType),
      resolve: subsToUserResolve,
    },
    userSubscribedTo: {
      type: new GraphQLList(userType),
      resolve: userSubsToResolve,
    },
  }),
});

const usersType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType)));

async function subsToUserResolve({ id }: ID, _, { userSubscribers }: Context) {
  return await userSubscribers.load(id);
}

async function userSubsToResolve({ id }: ID, _, { userSubscribedTo }: Context) {
  return await userSubscribedTo.load(id);
}

export async function usersToPostResolve({ authorId }: Post, _, { prisma }: Context) {
  return await prisma.user.findUnique({ where: { id: authorId } });
}

export async function usersToProfResolve({ userId }: Profile, _, { prisma }: Context) {
  return await prisma.user.findUnique({ where: { id: userId } });
}

const createUserArgs: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const changeUserArgs: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
const user = {
  type: userType,
  args: typeArgs,
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    return await prisma.user.findUnique({ where: { id } });
  },
};

const users = {
  type: usersType,
  resolve: async (_, args, { prisma }: Context) => prisma.user.findMany(),
};

const createUser = {
  type: userType,
  args: {
    dto: { type: new GraphQLNonNull(createUserArgs) },
  },
  resolve: async (_, { dto }: CreateUserArgs, { prisma }: Context) => {
    return await prisma.user.create({ data: dto });
  },
};

const changeUser = {
  type: userType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(changeUserArgs) },
  },
  resolve: async (_, { id, dto }: ChangeUserArgs, { prisma }: Context) => {
    return await prisma.user.update({ where: { id }, data: dto });
  },
};

const deleteUser = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      return error;
    }
  },
};

const subscribeTo = {
  type: userType,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_, { userId, authorId }: SubscribeUserArgs, { prisma }: Context) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { userSubscribedTo: { create: { authorId } } },
    });
  },
};

const unsubscribeFrom = {
  type: GraphQLBoolean,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_, { userId, authorId }: SubscribeUserArgs, { prisma }: Context) => {
    await prisma.subscribersOnAuthors.deleteMany({
      where: { subscriberId: userId, authorId },
    });
    return true;
  },
};

export const userQuery = { user, users };
export const userMutations = {
  createUser,
  changeUser,
  deleteUser,
  subscribeTo,
  unsubscribeFrom,
};
