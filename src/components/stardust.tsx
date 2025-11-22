"use client";

import React from "react";
import { motion } from "motion/react";

const randomStars = (count: number) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    arr.push(`${x}px ${y}px #ffffff`);
  }
  return arr.join(", ");
};

export default function StardustBackground() {
  const [stars1] = React.useState(randomStars(800));
  const [stars2] = React.useState(randomStars(400));
  const [stars3] = React.useState(randomStars(200));

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-full h-[2000px]"
        animate={{ y: [0, -2000] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        style={{
          boxShadow: stars1,
          width: "2px",
          height: "2px",
          background: "transparent",
        }}
      />
      <motion.div
        className="absolute w-full h-[2000px]"
        animate={{ y: [0, -2000] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        style={{
          boxShadow: stars2,
          width: "3px",
          height: "3px",
          background: "transparent",
        }}
      />
      <motion.div
        className="absolute w-full h-[2000px]"
        animate={{ y: [0, -2000] }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
        style={{
          boxShadow: stars3,
          width: "4px",
          height: "4px",
          background: "transparent",
        }}
      />
    </div>
  );
}
