import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs } from '../types/types.js';

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

const postsGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(postGraphQLType)),
);

const getPostResolve = async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
  const { id } = args;
  const post = await fastify.prisma.post.findUnique({
    where: { id },
  });
  return post;
};

const getPostsResolve = async (parent, args, fastify: FastifyInstance) => {
  return fastify.prisma.post.findMany();
};

export const postFields = {
  type: postGraphQLType,
  args: typeArgs,
  resolve: getPostResolve,
};

export const postsFields = {
  type: postsGraphQLType,
  resolve: getPostsResolve,
};
