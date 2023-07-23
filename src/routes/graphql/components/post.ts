import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { ID, User, CreatePostArgs, UpdatePostArgs, Context } from '../types/types.js';
import { typeArgs } from '../types/constant.js';
import { userType, usersToPostResolve } from './user.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const postType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: userType,
      resolve: usersToPostResolve,
    },
  }),
});

const postsType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType)));

export const postToUserResolve = async ({ id }: User, args, { postsLoader }: Context) => {
  return await postsLoader.load(id);
};

const post = {
  type: postType,
  args: typeArgs,
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    return await prisma.post.findUnique({ where: { id } });
  },
};

const posts = {
  type: postsType,
  resolve: async (_, args, { prisma }: Context) => await prisma.post.findMany(),
};

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
  type: postType,
  args: {
    dto: { type: new GraphQLNonNull(createPostArgs) },
  },
  resolve: async (_, { dto }: CreatePostArgs, { prisma }: Context) => {
    return await prisma.post.create({ data: dto });
  },
};

const changePost = {
  type: postType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(updatePostArgs) },
  },
  resolve: async (_, { id, dto }: UpdatePostArgs, { prisma }: Context) => {
    return await prisma.post.update({ where: { id }, data: dto });
  },
};

const deletePost = {
  type: GraphQLBoolean,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (_, { id }: ID, { prisma }: Context) => {
    try {
      await prisma.post.delete({ where: { id } });
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
