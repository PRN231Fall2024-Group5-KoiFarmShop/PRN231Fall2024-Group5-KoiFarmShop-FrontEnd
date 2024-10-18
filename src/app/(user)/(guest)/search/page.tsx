import { Suspense } from "react";
import SearchPage from "./SearchPage";

const SearchPageWrapper = () => {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
};

export default SearchPageWrapper;
