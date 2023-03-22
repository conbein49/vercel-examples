import { Text, Page } from '@vercel/examples-ui'
import { useRouter } from 'next/router'
import Lectures from "../components/Lectures";
import AddLectureForm from "../components/AddLectureForm";
import {Chat} from "../components/Chat"
import React, { useEffect, useState } from "react";
import { useCookies } from 'react-cookie'
import type { ReactElement } from 'react'
import Layout from '../components/Layout'

export const COOKIE_NAMES = ["id", "ownerEmail", "packageCoordinates"]

export type PackageCoordinates = {
  userHandle: string
  workspaceHandle: string
  instanceHandle: string
}


function Home() {
  const [baseUrl, setBaseUrl] = useState<string|undefined>(undefined)
  const [ownerEmail, setOwnerEmail] = useState<string|undefined>(undefined)
  const [packageCoordinates, setPackageCoordinates] = useState<PackageCoordinates|undefined>(undefined)
  const [cookie, setCookie] = useCookies(COOKIE_NAMES)
  const {query, isReady} = useRouter()


  const makeBaseUrl = (packageCoordinates?: PackageCoordinates) => {
    if (packageCoordinates){
      setBaseUrl(`https://enias.steamship.run/${packageCoordinates.workspaceHandle}/${packageCoordinates.instanceHandle}`)
    } else if (process.env.NEXT_PUBLIC_BASE_URL) {
      setBaseUrl(process.env.NEXT_PUBLIC_BASE_URL as string)
    } 
  }

  let {userHandle, instanceHandle, workspaceHandle} = query
  if (userHandle && packageCoordinates?.userHandle != userHandle) {
    console.log("overriding ", userHandle, workspaceHandle, instanceHandle)
    const newPackageCoordinates = {
      userHandle: userHandle as string,
      workspaceHandle: workspaceHandle as string,
      instanceHandle: instanceHandle as string
    }
    setPackageCoordinates(newPackageCoordinates)
    makeBaseUrl(newPackageCoordinates)
  }
  if (!userHandle && !packageCoordinates && baseUrl){
    setBaseUrl(undefined)
  }

  useEffect(() => {
    if (!cookie["id"]) {
      setCookie("id", Math.random().toString(36).substring(7) )
    }
    if (cookie["ownerEmail"]) {
      setOwnerEmail(cookie["ownerEmail"])
    }
    if (cookie["packageCoordinates"]) {
      setPackageCoordinates(cookie["packageCoordinates"])
      makeBaseUrl(cookie["packageCoordinates"])
    }
  }, [cookie, setCookie])

  const isAdmin = () => {
    return !ownerEmail || (ownerEmail && (!userHandle || (userHandle && ownerEmail == userHandle)))
  };




  const errorMessage = (
        <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p>Front-end not connected.</p>
                <br/>
                <p>If this issue persists, please ping us on <a href="https://steamship.com/discord" className="font-semibold text-gray-900 underline dark:text-white decoration-sky-500">Discord</a>. We&apos;re happy to help. </p>
              </div>
            </div>
          </div>
          )

  return (
    <Page className=" max-w-7xl  flex flex-col gap-12 ">

      {userHandle && <div>Instance owned by {userHandle}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className='grid gap-10'> 
        {isAdmin() && 
        <div>
          <Text className="mb-5" variant="h2">⚙️ Add Lectures</Text>
          <AddLectureForm ownerEmail={ownerEmail} 
                setOwnerEmail={setOwnerEmail} packageCoordinates={packageCoordinates} setBaseUrl={setBaseUrl} setPackageCoordinates={setPackageCoordinates} />
        </div>}
        
        <div>
        <section className="flex flex-col gap-6 " >
        <Text className="mb-5" variant="h2">📚 Lectures </Text>

        { baseUrl && isReady && <Lectures baseUrl={baseUrl as string}/>}
      </section>

        </div>

        </div>
        <div>
              
        <Text className="mb-5" variant="h2">💬 Your chatbot</Text>

      <section className="flex flex-col gap-3 ">
            {/* { typeof baseUrl == "undefined" && errorMessage} */}
             <Chat className="h-[42rem] rounded-2xl border-zinc-100 lg:border lg:p-6" baseUrl={baseUrl as string}/>
      </section>
      </div>
      </div>
    </Page>
  )
}

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout path="">
      {page}
    </Layout>
  )
}

export default Home
