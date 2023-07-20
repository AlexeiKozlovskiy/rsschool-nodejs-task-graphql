import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, Profile } from '../types/types.js';
import { typeArgsMemberTypeId, MemberTypeId } from '../types/constant.js';
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

export const getMemberTypeToProfileResolve = async (
  { memberTypeId }: Profile,
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
  resolve: async (parent, { id }: ResolveArgs, fastify: FastifyInstance) => {
    const memberType = await fastify.prisma.memberType.findUnique({
      where: { id },
    });
    return memberType;
  },
};

const memberTypes = {
  type: memberTypesGraphQLType,
  resolve: async (parent, args, fastify: FastifyInstance) => {
    const memberType = await fastify.prisma.memberType.findMany();
    return memberType;
  },
};

export const memberTypeQuery = { memberType, memberTypes };
