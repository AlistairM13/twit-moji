import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast"
import { PageLayout } from "~/components/mainContainer";
import { PostView } from "~/components/postView";


const CreatePostWizard = () => {
  const { user } = useUser()
  const [input, setInput] = useState("")

  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("")
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to post, please try again later.")
      }
    }
  })

  if (!user) return null

  return <div className="w-full flex gap-3">
    <Image
      src={user.profileImageUrl}
      alt="Profile Image"
      className="w-14 h-14 rounded-full"
      width={56}
      height={56}
    />
    <input
      placeholder="Type some emojis..."
      className="bg-transparent grow outline-none"
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      disabled={isPosting}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          if (input != "") {
            mutate({ content: input })
          }
        }
      }}
    />
    {input !== "" && !isPosting &&
      <button onClick={() => mutate({ content: input })} disabled={isPosting}>
        Post
      </button>
    }
    {isPosting && <div className="flex justify-center items-center">
      <LoadingSpinner size={20} />
    </div>}
  </div>
}



const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery()

  if (postsLoading) return (<div className="flex grow">
    <LoadingPage />
  </div>)

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) =>
        <PostView {...fullPost} key={fullPost.post.id} />
      )}
    </div>
  )


}

export default function Home() {

  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  // Fetch posts asap
  console.log(user);

  api.posts.getAll.useQuery()
  if (!userLoaded) return <div /> // return empty div if user isnt loaded

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  )
}