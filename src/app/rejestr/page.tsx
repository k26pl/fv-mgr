"use client";
import { setHash, useHash } from "@/utils/hash";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";

export default function Rejestr() {
  "use client";
  let tab;
  let hash = useHash();
  switch (hash) {
    case "bufor":
      tab = 1;
      break;
    case "rejestr":
    default:
      tab = 0;
  }
  function setTab(t: number) {
    switch (t) {
      case 0:
        setHash("rejestr");
        break;
      case 1:
        setHash("bufor");
        break;
    }
  }
  return (
    <>
      <Tabs value={tab} onChange={(_, t) => setTab(t)}>
        <Tab label='Rejestr' sx={{ width: "50%", maxWidth: "50%" }}></Tab>
        <Tab label='Bufor' sx={{ width: "50%", maxWidth: "50%" }}></Tab>
      </Tabs>
    </>
  );
}
