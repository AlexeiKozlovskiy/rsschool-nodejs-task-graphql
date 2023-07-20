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
import { FastifyInstance } from 'fastify';
import {
  ResolveArgs,
  Post,
  Profile,
  CreateUserArgs,
  ChangeUserArgs,
  SubscribeUserArgs,
} from '../types/types.js';
import { typeArgs } from '../types/constant.js';
import { profileGraphQLType, getProfileToUserResolve } from './profile.js';
import { postGraphQLType, getPostToUserResolve } from './post.js';

export const userGraphQLType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: profileGraphQLType,
      resolve: getProfileToUserResolve,
    },
    posts: {
      type: new GraphQLList(postGraphQLType),
      resolve: getPostToUserResolve,
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(userGraphQLType)),
      resolve: getSubscToUserResolve,
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(userGraphQLType)),
      resolve: getUserSubscToResolve,
    },
  }),
});

const usersGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(userGraphQLType)),
);

async function getSubscToUserResolve(
  { id }: ResolveArgs,
  args,
  fastify: FastifyInstance,
) {
  const user = await fastify.prisma.user.findMany({
    where: {
      userSubscribedTo: { some: { authorId: id } },
    },
  });
  return user;
}

async function getUserSubscToResolve(
  { id }: ResolveArgs,
  args,
  fastify: FastifyInstance,
) {
  const user = await fastify.prisma.user.findMany({
    where: {
      subscribedToUser: { some: { subscriberId: id } },
    },
  });
  return user;
}

export async function getUsersToPostResolve(
  { authorId }: Post,
  args,
  fastify: FastifyInstance,
) {
  const user = await fastify.prisma.user.findUnique({
    where: { id: authorId },
  });
  return user;
}

export async function getUsersToProfileResolve(
  { userId }: Profile,
  args,
  fastify: FastifyInstance,
) {
  const user = await fastify.prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
}

const user = {
  type: userGraphQLType,
  args: typeArgs,
  resolve: async (parent, { id }: ResolveArgs, fastify: FastifyInstance) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id },
    });
    return user;
  },
};

const users = {
  type: usersGraphQLType,
  resolve: async (parent, args, fastify: FastifyInstance) => {
    const user = fastify.prisma.user.findMany();
    return user;
  },
};

// mutations
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

const createUser = {
  type: userGraphQLType,
  args: {
    dto: { type: new GraphQLNonNull(createUserArgs) },
  },
  resolve: async (parent, { dto }: CreateUserArgs, fastify: FastifyInstance) => {
    const user = await fastify.prisma.user.create({ data: dto });
    return user;
  },
};

const changeUser = {
  type: userGraphQLType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(changeUserArgs) },
  },
  resolve: async (parent, { id, dto }: ChangeUserArgs, fastify: FastifyInstance) => {
    const user = await fastify.prisma.user.update({
      where: { id },
      data: dto,
    });
    return user;
  },
};

const deleteUser = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (parent, { id }: { id: string }, fastify: FastifyInstance) => {
    try {
      await fastify.prisma.user.delete({ where: { id } });
    } catch (error) {
      return error;
    }
  },
};

const subscribeTo = {
  type: userGraphQLType,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    parent,
    { userId, authorId }: SubscribeUserArgs,
    fastify: FastifyInstance,
  ) => {
    const user = await fastify.prisma.user.update({
      where: { id: userId },
      data: { userSubscribedTo: { create: { authorId } } },
    });
    return user;
  },
};

const unsubscribeFrom = {
  type: GraphQLBoolean,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    parent,
    { userId, authorId }: SubscribeUserArgs,
    fastify: FastifyInstance,
  ) => {
    await fastify.prisma.subscribersOnAuthors.deleteMany({
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
