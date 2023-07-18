import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { FastifyInstance } from 'fastify';

interface ResolveArgs {
  id: string;
}

const userGraphQLType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: UUIDType,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
  }),
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

const usersGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(userGraphQLType)),
);

const postsGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(postGraphQLType)),
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

const userFields = {
  type: userGraphQLType,
  args: { id: { type: GraphQLString } },
  resolve: getUserResolve,
};

const usersFields = {
  type: usersGraphQLType,
  resolve: getUsersResolve,
};

const postFields = {
  type: postGraphQLType,
  args: { id: { type: GraphQLString } },
  resolve: getPostResolve,
};

const postsFields = {
  type: postsGraphQLType,
  resolve: getPostsResolve,
};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      user: userFields,
      users: usersFields,
      post: postFields,
      posts: postsFields,
    },
  }),
});

export default schema;
