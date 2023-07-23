import { PrismaClient } from '@prisma/client';
import {
  User,
  Post,
  Profile,
  Member,
  UserSubscribed,
  SubscribedToUser,
} from '../types/types.js';
import DataLoader from 'dataloader';

export function userSubscribedToLoader(prisma: PrismaClient) {
  return new DataLoader(async (keys: Readonly<string[]>) => {
    const subscribers = (await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: keys as string[] } },
      select: { subscriberId: true, author: true },
    })) as UserSubscribed[];

    const subscribersMap = new Map<string, User[]>();
    subscribers.forEach((el) => {
      const subscribedArr = subscribersMap.get(el.subscriberId) || [];
      subscribedArr.push(el.author);
      subscribersMap.set(el.subscriberId, subscribedArr);
    });
    return keys.map((el) => subscribersMap.get(el)!);
  });
}

export function subscribedToUserLoader(prisma: PrismaClient) {
  return new DataLoader(async (keys: Readonly<string[]>) => {
    const subscribers = (await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: keys as string[] } },
      select: { authorId: true, subscriber: true },
    })) as SubscribedToUser[];

    const subscribersMap = new Map<string, User[]>();
    subscribers.forEach((el) => {
      const subscribedArr = subscribersMap.get(el.authorId) || [];
      subscribedArr.push(el.subscriber);
      subscribersMap.set(el.authorId, subscribedArr);
    });
    return keys.map((el) => subscribersMap.get(el)!);
  });
}

export function postLoader(prisma: PrismaClient) {
  return new DataLoader(async (keys: Readonly<string[]>): Promise<Array<Post[]>> => {
    const posts = (await prisma.post.findMany({
      where: { authorId: { in: keys as string[] } },
    })) as Post[];

    const postMap = new Map<string, Post[]>();
    posts.forEach((el) => {
      const postArr = postMap.get(el.authorId) || [];
      postArr.push(el);
      postMap.set(el.authorId, postArr);
    });
    return keys.map((el) => postMap.get(el)!);
  });
}

export function profileLoader(prisma: PrismaClient) {
  return new DataLoader<string, Profile>(async (keys: Readonly<string[]>) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: keys as string[] } },
    });
    const profileMap = new Map<string, Profile>();
    profiles.forEach((el) => profileMap.set(el.userId, el));
    return keys.map((key) => profileMap.get(key)!);
  });
}

export function memberTypeLoader(prisma: PrismaClient) {
  return new DataLoader<string, Member>(async (keys: Readonly<string[]>) => {
    const memberType = await prisma.memberType.findMany({
      where: { id: { in: keys as string[] } },
    });
    const memberTypeMap = new Map<string, Member>();
    memberType.forEach((el) => memberTypeMap.set(el.id, el));
    return keys.map((key) => memberTypeMap.get(key)!);
  });
}
