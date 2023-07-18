import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { userFields, usersFields } from './components/user.js';
import { postFields, postsFields } from './components/post.js';
import { profileFields, profilesFields } from './components/profile.js';
import { memberTypeFields, memberTypesFields } from './components/memberType.js';

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
