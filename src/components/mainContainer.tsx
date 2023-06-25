import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
    return (
        <main className="h-screen overflow-none flex justify-center">
            <div className="w-full md:max-w-2xl border-x border-slate-400 overflow-y-scroll">
                    {props.children}
            </div>
        </main>
    )
}