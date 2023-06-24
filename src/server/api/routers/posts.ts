import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        firstName: user.firstName,
        profileImageUrl: user.profileImageUrl
    }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
        });

        const users = (await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100
        })).map(filterUserForClient)


        return posts.map(post => {
            const author = users.find(user => user.id == post.authorId)
            if (!author || !author.firstName) {
                console.error("AUTHOR NOT FOUND", post);
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
                });
              }
              
            return {
                post,
                author:{
                    ...author,
                    firstName:author.firstName
                }
            }
        })

    }),
});