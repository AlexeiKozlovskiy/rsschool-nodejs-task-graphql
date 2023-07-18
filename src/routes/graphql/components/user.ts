import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs } from '../types/types.js';

const userGraphQLType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: UUIDType,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  },
});

const usersGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(userGraphQLType)),
);

const getUserResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const user = await fastify.prisma.user.findUnique({
    where: { id },
  });
  return user;
};

const getUsersResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.user.findMany();
};

export const userFields = {
  type: userGraphQLType,
  args: typeArgs,
  resolve: getUserResolve,
};

export const usersFields = {
  type: usersGraphQLType,
  resolve: getUsersResolve,
};
