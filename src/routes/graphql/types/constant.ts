import { GraphQLEnumType, GraphQLNonNull } from 'graphql';
import { UUIDType } from '../types/uuid.js';

export const typeArgs = {
  id: { type: new GraphQLNonNull(UUIDType) },
};

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const typeArgsMemberTypeId = {
  id: { type: new GraphQLNonNull(MemberTypeId) },
};
