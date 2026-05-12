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
    const finishTime = Math.random() * (2000) + 5000;
    const interval = setInterval(() => {
      setLoadingPerc((prev: number) => Math.min(prev + 1, 99));
    }, finishTime / 100);

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
