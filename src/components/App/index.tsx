import { Suspense, lazy } from "react";

import Loader from "@/components/Loader";

const ProductList = lazy(() => import("@/components/ProductList"));

import "@/components/App/style.css";

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ProductList />
    </Suspense>
  );
};

export default App;
