import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import {
  ID,
  User,
  Member,
  CreateProfileArgs,
  UpdateProfileArgs,
  Context,
} from '../types/types.js';
import { typeArgs, MemberId } from '../types/constant.js';
import { userType, usersToProfResolve } from './user.js';
import { memberGQL, memberToProfResolve } from './memberType.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberId },
    user: {
      type: userType,
      resolve: usersToProfResolve,
    },
    memberType: {
      type: memberGQL,
      resolve: memberToProfResolve,
    },
  }),
});

const profilesType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(profileType)));

export const profileToUserResolve = async (
  { id }: User,
  _,
  { profileLoader }: Context,
) => {
  return await profileLoader.load(id);
};

export const profToMemberResolve = async ({ id }: Member, _, { prisma }: Context) => {
  return await prisma.profile.findMany({ where: { memberTypeId: id } });
};

const profile = {
  type: profileType,
  args: typeArgs,
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    return await prisma.profile.findUnique({ where: { id } });
  },
};

const profiles = {
  type: profilesType,
  resolve: async (_, args, { prisma }: Context) => await prisma.profile.findMany(),
};

const argsProfileCreate: GraphQLInputObjectType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberId) },
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
  type: profileType,
  args: {
    dto: { type: new GraphQLNonNull(argsProfileCreate) },
  },
  resolve: async (_, { dto }: CreateProfileArgs, { prisma }: Context) => {
    return await prisma.profile.create({ data: dto });
  },
};

const changeProfile = {
  type: profileType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(argsProfileUpdate) },
  },
  resolve: async (_, { id, dto }: UpdateProfileArgs, { prisma }: Context) => {
    return await prisma.profile.update({ where: { id }, data: dto });
  },
};

const deleteProfile = {
  type: GraphQLBoolean,
  args: { id: { type: UUIDType } },
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    try {
      await prisma.profile.delete({ where: { id } });
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
