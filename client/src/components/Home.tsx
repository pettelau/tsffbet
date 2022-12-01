import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LoginUtils } from "../utils";

async function testFetch() {
  console.log("Hello");
  const response = await fetch(`http://localhost:8000/api/testfetch`, {});
  const resp = await response.json();
  console.log(resp);
}

async function testPost(input: string) {
  const response = await fetch(`http://localhost:8000/api/testpost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: input }),
  });

  const resp = await response.json();
}
export default function Home() {
  const [input, setInput] = useState("");

  useEffect(() => {
    testFetch();
  }, []);
  return (
    <>
      <div>
        Home helllo page
        <TextField value={input} onChange={(e) => setInput(e.target.value)} />
        <Button
          onClick={() => {
            testPost(input);
          }}
        >
          {" "}
          Send{" "}
        </Button>
      </div>
    </>
  );
}
