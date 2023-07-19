import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { userQuery } from './components/user.js';
import { postQuery } from './components/post.js';
import { profileQuery } from './components/profile.js';
import { memberTypeQuery } from './components/memberType.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const queries = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    ...userQuery,
    ...postQuery,
    ...profileQuery,
    ...memberTypeQuery,
  }),
});

export const gqlSchema = new GraphQLSchema({
  query: queries,
});
