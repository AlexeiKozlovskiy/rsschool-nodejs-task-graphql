import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { FastifyInstance } from 'fastify';
import { ResolveArgs, User, CreatePostArgs, UpdatePostArgs } from '../types/types.js';
import { typeArgs } from '../types/constant.js';
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

export const getPostToUserResolve = async (
  { id }: User,
  args,
  fastify: FastifyInstance,
) => {
  const post = await fastify.prisma.post.findMany({ where: { authorId: id } });
  return post;
};

const post = {
  type: postGraphQLType,
  args: typeArgs,
  resolve: async (parent, args: ResolveArgs, fastify: FastifyInstance) => {
    const { id } = args;
    const post = await fastify.prisma.post.findUnique({ where: { id } });
    return post;
  },
};

const posts = {
  type: postsGraphQLType,
  resolve: async (parent, args, fastify: FastifyInstance) => {
    const post = fastify.prisma.post.findMany();
    return post;
  },
};

// mutations
const createPostArgs = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const updatePostArgs = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const createPost = {
  type: postGraphQLType,
  args: {
    dto: { type: new GraphQLNonNull(createPostArgs) },
  },
  resolve: async (parent, { dto }: CreatePostArgs, fastify: FastifyInstance) => {
    const post = await fastify.prisma.post.create({ data: dto });
    return post;
  },
};

const changePost = {
  type: postGraphQLType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(updatePostArgs) },
  },
  resolve: async (parent, { id, dto }: UpdatePostArgs, fastify: FastifyInstance) => {
    const post = await fastify.prisma.post.update({
      where: { id },
      data: dto,
    });
    return post;
  },
};

const deletePost = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (parent, { id }: { id: string }, fastify: FastifyInstance) => {
    try {
      await fastify.prisma.post.delete({ where: { id } });
    } catch (error) {
      return error;
    }
  },
};

export const postQuery = { post, posts };

export const postMutations = {
  createPost,
  changePost,
  deletePost,
};
