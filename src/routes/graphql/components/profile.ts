import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs } from '../types/types.js';

const profileGraphQLType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: {
      type: UUIDType,
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    userId: {
      type: UUIDType,
    },
    memberTypeId: {
      type: GraphQLString,
    },
  },
});

const profilesGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(profileGraphQLType)),
);

const getProfileResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const profile = await fastify.prisma.profile.findUnique({
    where: { id },
  });

  return profile;
};

const getProfilesResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.profile.findMany();
};

export const profileFields = {
  type: profileGraphQLType,
  args: typeArgs,
  resolve: getProfileResolve,
};

export const profilesFields = {
  type: profilesGraphQLType,
  resolve: getProfilesResolve,
};
