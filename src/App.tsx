import { Suspense, useEffect } from "react";
import "./App.css";
import { useLoading } from "./components/LoadingProvider";
import MainContainer from "./components/MainContainer";

{
  /**
TDOD:
  - change the cursor into the star if possible
  - split the loading video into and reduce the loading time
  
*/
}

function App() {
  const { setLoadingPerc } = useLoading();
  useEffect(() => {
    const finishTime = Math.random() * (4000 - 4000) + 6000;
    const interval = setInterval(() => {
      // setLoadingPerc((prev: number) => prev + 1)
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setLoadingPerc(100);
    }, finishTime);

    return () => clearInterval(interval);
  }, [setLoadingPerc]);
  return (
    <>
      <></>
      <Suspense>
        <MainContainer>
          <Suspense>{/* <CharacterModel /> */}</Suspense>
        </MainContainer>
      </Suspense>
    </>
  );
}

export default App;
