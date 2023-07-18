import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';
import { UUIDType } from './types/uuid.js';

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

const usersGraphQLType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(userGraphQLType)),
);

const getUserResolve = async (parent, args) => {
  // smth
};

const getUsersResolve = async (parent, args) => {
  // smth
};

const userFields = {
  type: userGraphQLType,
  args: { id: { type: GraphQLString } },
  resolve: getUserResolve,
};

const usersField = {
  type: usersGraphQLType,
  resolve: getUsersResolve,
};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      user: userFields,
      users: usersField,
    },
  }),
});

export default schema;
