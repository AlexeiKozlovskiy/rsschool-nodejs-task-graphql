import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import {
  ResolveArgs,
  User,
  Member,
  CreateProfileArgs,
  UpdateProfileArgs,
} from '../types/types.js';
import { typeArgs, MemberTypeId } from '../types/constant.js';
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

export const getProfileToUserResolve = async (
  { id }: User,
  args,
  fastify: FastifyInstance,
) => {
  const profile = await fastify.prisma.profile.findUnique({
    where: { userId: id },
  });
  return profile;
};

export const getProfileToMemberTypeResolve = async (
  { id }: Member,
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
  resolve: async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
    const { id } = args;
    const profile = await fastify.prisma.profile.findUnique({ where: { id } });
    return profile;
  },
};

const profiles = {
  type: profilesGraphQLType,
  resolve: async (parent, args, fastify: FastifyInstance) => {
    const profile = await fastify.prisma.profile.findMany();
    return profile;
  },
};

// mutations
const argsProfileCreate: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  },
});

const argsProfileUpdate: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  },
});

const createProfile = {
  type: profileGraphQLType,
  args: {
    dto: { type: new GraphQLNonNull(argsProfileCreate) },
  },
  resolve: async (parent, { dto }: CreateProfileArgs, fastify: FastifyInstance) => {
    const profile = await fastify.prisma.profile.create({ data: dto });
    return profile;
  },
};

const changeProfile = {
  type: profileGraphQLType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(argsProfileUpdate) },
  },
  resolve: async (parent, { id, dto }: UpdateProfileArgs, fastify: FastifyInstance) => {
    const profile = await fastify.prisma.profile.update({
      where: { id },
      data: dto,
    });
    return profile;
  },
};

const deleteProfile = {
  type: GraphQLBoolean,
  args: { id: { type: UUIDType } },
  resolve: async (parent, { id }: { id: string }, fastify: FastifyInstance) => {
    try {
      await fastify.prisma.profile.delete({ where: { id } });
    } catch (error) {
      return error;
    }
  },
};

export const profileQuery = { profile, profiles };

export const profileMutations = {
  createProfile,
  changeProfile,
  deleteProfile,
};
