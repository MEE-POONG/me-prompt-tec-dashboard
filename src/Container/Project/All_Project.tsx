import { SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function All_Project() {
    
  return (
    <section className="bg-white min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-10 flex justify-between gap-6 px-20">
          <h2 className="text-xl font-extrabold text-black">Projects</h2>
          <Link
            href="/partnerships"
            className="inline-block rounded-2xl py-2 px-3 bg-yellow-400 font-semibold text-white hover:bg-yellow-700 transition-all hover:scale-105 duration-200"
          >
            Add
          </Link>
        </div>

        <div className="flex flex-col gap-6 mx-20">
          <div className="text-center py-3 flex justify-between gap-6 px-20 rounded-4xl shadow-md hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-extrabold text-black">
                Project Name
              </h2>

              <div className="text-gray-600 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                Description
              </div>

              <div className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:text-blue-300">
                Tag
              </div>
            </div>

            <div className="flex">
              <Link
                href="/partnerships"
                className="inline-block rounded-3xl py-2 px-3 font-semibold text-yellow-500 transition-all hover:scale-115 duration-200"
              >
                <SquarePen />
              </Link>

              <Link
                href="/partnerships"
                className="inline-block rounded-3xl py-2 px-3 font-semibold text-red-500 transition-all hover:scale-115 duration-200"
              >
                <Trash />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
