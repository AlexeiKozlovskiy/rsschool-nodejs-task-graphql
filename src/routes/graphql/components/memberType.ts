import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { FastifyInstance } from 'fastify';
import {
  ResolveArgs,
  typeArgsMemberTypeId,
  MemberTypeId,
  IProfile,
} from '../types/types.js';
import { profileGraphQLType, getProfileToMemberTypeResolve } from './profile.js';

export const memberTypeGraphQLType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(profileGraphQLType),
      resolve: getProfileToMemberTypeResolve,
    },
  }),
});

const memberTypesGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(memberTypeGraphQLType)),
);

const getMemberTypeResolve = async (
  parent,
  { id }: ResolveArgs,
  fastify: FastifyInstance,
) => {
  const memberType = await fastify.prisma.memberType.findUnique({
    where: { id },
  });
  return memberType;
};

const getMemberTypesResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.memberType.findMany();
};

export const getMemberTypeToProfileResolve = async (
  { memberTypeId }: IProfile,
  args,
  fastify: FastifyInstance,
) => {
  const memberType = await fastify.prisma.memberType.findUnique({
    where: { id: memberTypeId },
  });
  return memberType;
};

const memberType = {
  type: memberTypeGraphQLType,
  args: typeArgsMemberTypeId,
  resolve: getMemberTypeResolve,
};

const memberTypes = {
  type: memberTypesGraphQLType,
  resolve: getMemberTypesResolve,
};

export const memberTypeQuery = { memberType, memberTypes };
