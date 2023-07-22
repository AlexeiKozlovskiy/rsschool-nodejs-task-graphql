import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { ID, Profile, Context } from '../types/types.js';
import { typeArgsMemberTypeId, MemberId } from '../types/constant.js';
import { profileType, profToMemberResolve } from './profile.js';

export const memberGQL = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(profileType),
      resolve: profToMemberResolve,
    },
  }),
});

const memberTypesGQL = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(memberGQL)));

export const memberToProfResolve = async (
  { memberTypeId }: Profile,
  _,
  { memberTypeLoader }: Context,
) => {
  return await memberTypeLoader.load(memberTypeId);
};

const memberType = {
  type: memberGQL,
  args: typeArgsMemberTypeId,
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    return await prisma.memberType.findUnique({ where: { id } });
  },
};

const memberTypes = {
  type: memberTypesGQL,
  resolve: async (_, args, { prisma }: Context) => {
    return await prisma.memberType.findMany();
  },
};

export const memberTypeQuery = { memberType, memberTypes };
