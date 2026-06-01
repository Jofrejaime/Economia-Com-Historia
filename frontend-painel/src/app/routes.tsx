import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { DashboardPage } from "./pages/DashboardPage";
import { RequestsPage } from "./pages/RequestsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: DashboardPage },
      { path: "requests", Component: RequestsPage },
      { path: "*", Component: NotFound },
    ],
  },
]);

function NotFound() {
  return (
    <div className="px-10 py-10 max-w-[1100px]">
      <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg p-16 text-center">
        <h1
          className="text-[#121c2a] tracking-[-0.72px]"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "36px" }}
        >
          404
        </h1>
        <p
          className="text-[#64748b] mt-2"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
        >
          Página não encontrada
        </p>
      </div>
    </div>
  );
}
