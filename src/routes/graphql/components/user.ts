import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs, IPost, IProfile, IUser } from '../types/types.js';
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

async function getUserResolve(parent, { id }: ResolveArgs, fastify: FastifyInstance) {
  const user = await fastify.prisma.user.findUnique({
    where: { id },
  });
  return user;
}

async function getUsersResolve(parent, args, fastify: FastifyInstance) {
  return fastify.prisma.user.findMany();
}

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
  { authorId }: IPost,
  args,
  fastify: FastifyInstance,
) {
  const user = await fastify.prisma.user.findUnique({
    where: { id: authorId },
  });
  return user;
}

export async function getUsersToProfileResolve(
  { userId }: IProfile,
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
  resolve: getUserResolve,
};

const users = {
  type: usersGraphQLType,
  resolve: getUsersResolve,
};

export const userQuery = { user, users };
