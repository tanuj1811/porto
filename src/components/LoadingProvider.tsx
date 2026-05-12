/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Loader from "./Loader";
// import Loader2 from "./Loader2";

// const random = Math.floor(Math.random() * 10);

interface LoadingType {
  isLoading: boolean;
  loadingPerc: number;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setLoadingPerc: Dispatch<SetStateAction<number>>;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPerc, setLoadingPerc] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    loadingPerc,
    setLoadingPerc,
  };


  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <>
        {/* {random % 2 === 1 ? <Loader /> : <Loader2 />} */}
        <Loader />
      </>}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
