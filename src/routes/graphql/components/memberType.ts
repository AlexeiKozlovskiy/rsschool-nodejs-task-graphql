import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs } from '../types/types.js';

const memberTypeGraphQLType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: GraphQLString,
    },
    discount: {
      type: GraphQLFloat,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
  },
});

const memberTypesGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(memberTypeGraphQLType)),
);

const getMemberTypeResolve = async (
  parent,
  args: ResolveArgs,
  fastify: FastifyInstance,
) => {
  const { id } = args;
  const memberType = await fastify.prisma.memberType.findUnique({
    where: { id },
  });
  return memberType;
};

const getMemberTypesResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.memberType.findMany();
};

export const memberTypeFields = {
  type: memberTypeGraphQLType,
  args: typeArgs,
  resolve: getMemberTypeResolve,
};

export const memberTypesFields = {
  type: memberTypesGraphQLType,
  resolve: getMemberTypesResolve,
};
