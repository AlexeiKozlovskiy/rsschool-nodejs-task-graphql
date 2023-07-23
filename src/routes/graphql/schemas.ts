import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { userQuery, userMutations } from './components/user.js';
import { postQuery, postMutations } from './components/post.js';
import { profileQuery, profileMutations } from './components/profile.js';
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

const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    ...userQuery,
    ...postQuery,
    ...profileQuery,
    ...memberTypeQuery,
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...userMutations,
    ...postMutations,
    ...profileMutations,
  },
});

export const schema = new GraphQLSchema({ query, mutation });
