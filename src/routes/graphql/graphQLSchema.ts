import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { FastifyInstance } from 'fastify';

interface ResolveArgs {
  id: string;
}

const typeArgs = {
  id: { type: GraphQLString },
};

const userGraphQLType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: UUIDType,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  },
});

const postGraphQLType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: {
      type: UUIDType,
    },
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
    authorId: {
      type: GraphQLID,
    },
  },
});

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

const usersGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(userGraphQLType)),
);

const postsGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(postGraphQLType)),
);

const profilesGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(profileGraphQLType)),
);

const memberTypesGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(memberTypeGraphQLType)),
);

const getUserResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const user = await fastify.prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw fastify.httpErrors.notFound();
  }
  return user;
};

const getUsersResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.user.findMany();
};

const getPostResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const post = await fastify.prisma.post.findUnique({
    where: { id },
  });
  if (!post) {
    throw fastify.httpErrors.notFound();
  }
  return post;
};

const getPostsResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.post.findMany();
};

const getProfileResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const profile = await fastify.prisma.profile.findUnique({
    where: { id },
  });
  if (!profile) {
    throw fastify.httpErrors.notFound();
  }
  return profile;
};

const getProfilesResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.profile.findMany();
};

const getMemberTypeResolve = async (
  parent,
  args: ResolveArgs,
  fastify: FastifyInstance,
) => {
  const { id } = args;
  const memberType = await fastify.prisma.memberType.findUnique({
    where: { id },
  });
  if (!memberType) {
    throw fastify.httpErrors.notFound();
  }
  return memberType;
};

const getMemberTypesResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.memberType.findMany();
};

const userFields = {
  type: userGraphQLType,
  args: typeArgs,
  resolve: getUserResolve,
};

const usersFields = {
  type: usersGraphQLType,
  resolve: getUsersResolve,
};

const postFields = {
  type: postGraphQLType,
  args: typeArgs,
  resolve: getPostResolve,
};

const postsFields = {
  type: postsGraphQLType,
  resolve: getPostsResolve,
};

const profileFields = {
  type: profileGraphQLType,
  args: typeArgs,
  resolve: getProfileResolve,
};

const profilesFields = {
  type: profilesGraphQLType,
  resolve: getProfilesResolve,
};

const memberTypeFields = {
  type: memberTypeGraphQLType,
  args: typeArgs,
  resolve: getMemberTypeResolve,
};

const memberTypesFields = {
  type: memberTypesGraphQLType,
  resolve: getMemberTypesResolve,
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      user: userFields,
      users: usersFields,
      post: postFields,
      posts: postsFields,
      profile: profileFields,
      profiles: profilesFields,
      memberType: memberTypeFields,
      memberTypes: memberTypesFields,
    },
  }),
});
