import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        firstName: user.firstName,
        profileImageUrl: user.profileImageUrl
    }
}

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new rateLimiter that allows 3 requests per minute
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [
                { createdAt: "desc" }
            ]
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
                author: {
                    ...author,
                    firstName: author.firstName
                }
            }
        })
    }),
    create: privateProcedure.input(z.object({
        content: z.string().emoji().min(1).max(280)
    })).mutation(async ({ ctx, input }) => {

        const authorId = ctx.userId

        const { success } = await ratelimit.limit(authorId)
        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })

        const post = await ctx.prisma.post.create({
            data: {
                authorId,
                content: input.content
            }
        })
        return post
    })
});
