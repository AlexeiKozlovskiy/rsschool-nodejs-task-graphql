import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, typeArgs, IUser } from '../types/types.js';
import { userGraphQLType, getUsersToPostResolve } from './user.js';

export const postGraphQLType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: userGraphQLType,
      resolve: getUsersToPostResolve,
    },
  }),
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

export const getPostToUserResolve = async (
  { id }: IUser,
  args,
  fastify: FastifyInstance,
) => {
  const post = await fastify.prisma.post.findMany({
    where: { authorId: id },
  });
  return post;
};

const post = {
  type: postGraphQLType,
  args: typeArgs,
  resolve: getPostResolve,
};

const posts = {
  type: postsGraphQLType,
  resolve: getPostsResolve,
};

export const postQuery = { post, posts };
