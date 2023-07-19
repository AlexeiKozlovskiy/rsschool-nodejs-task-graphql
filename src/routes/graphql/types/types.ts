import { GraphQLEnumType, GraphQLNonNull } from 'graphql';
import { UUIDType } from '../types/uuid.js';

export interface ResolveArgs {
  id: string;
}

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

export interface IUser {
  id: string;
  name: string;
  balance: number;
  profile: IProfile;
  posts: IPost[];
  userSubscribedTo: IUser[];
  subscribedToUser: IUser[];
}

export interface IProfile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
  user: IUser;
  memberType: IMember;
}

export interface IPost {
  id: string;
  title: string;
  content: string;
  author: IUser;
  authorId: string;
}

export interface IMember {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
  profiles: IProfile[];
}
