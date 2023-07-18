import { GraphQLString } from 'graphql';

export interface ResolveArgs {
  id: string;
}

export const typeArgs = {
  id: { type: GraphQLString },
};
