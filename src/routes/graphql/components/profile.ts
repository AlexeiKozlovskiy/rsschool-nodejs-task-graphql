import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs, MemberTypeId, IUser, IMember } from '../types/types.js';
import { userGraphQLType, getUsersToProfileResolve } from './user.js';
import { memberTypeGraphQLType, getMemberTypeToProfileResolve } from './memberType.js';

export const profileGraphQLType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    user: {
      type: userGraphQLType,
      resolve: getUsersToProfileResolve,
    },
    memberType: {
      type: memberTypeGraphQLType,
      resolve: getMemberTypeToProfileResolve,
    },
  }),
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

export const getProfileToUserResolve = async (
  { id }: IUser,
  args,
  fastify: FastifyInstance,
) => {
  const profile = await fastify.prisma.profile.findUnique({
    where: { userId: id },
  });
  return profile;
};

export const getProfileToMemberTypeResolve = async (
  { id }: IMember,
  args,
  fastify: FastifyInstance,
) => {
  const profile = await fastify.prisma.profile.findMany({
    where: { memberTypeId: id },
  });
  return profile;
};

const profile = {
  type: profileGraphQLType,
  args: typeArgs,
  resolve: getProfileResolve,
};

const profiles = {
  type: profilesGraphQLType,
  resolve: getProfilesResolve,
};

export const profileQuery = { profile, profiles };
