import Head from "next/head";
import { useUser } from '@clerk/nextjs'
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast"

export default function SinglePostPage() {

  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="🐥" />
      </Head>
      <main className="h-screen flex justify-center">
        <div>Post view</div>
      </main>
    </>
  )
}