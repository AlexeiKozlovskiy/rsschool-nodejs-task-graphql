import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { schema } from './schemas.js';
import depthLimit from 'graphql-depth-limit';
import {
  profileLoader,
  postLoader,
  memberTypeLoader,
  userSubscribedToLoader,
  subscribedToUserLoader,
} from './components/context.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { body } = req;
      const { query, variables } = body;
      const { prisma } = fastify;

      const documentNode = parse(query);
      const depthError = validate(schema, documentNode, [depthLimit(5)]);

      if (depthError.length) {
        return { result: '', errors: depthError };
      } else {
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: {
            prisma,
            profileLoader: profileLoader(prisma),
            postsLoader: postLoader(prisma),
            memberTypeLoader: memberTypeLoader(prisma),
            userSubscribedTo: userSubscribedToLoader(prisma),
            userSubscribers: subscribedToUserLoader(prisma),
          },
        });
        return result;
      }
    },
  });
};

export default plugin;
