import React, { useEffect } from "react";

export default function Home() {
  const fetchTest = async () => {
    const response = await fetch("http://localhost:8000/");
    const resp = await response.json();
    console.log(resp);
  };

  useEffect(() => {
    fetchTest();
  }, []);

  return (
    <>
      <div>Home page</div>
    </>
  );
}
