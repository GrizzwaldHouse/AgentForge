
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Agents from "./pages/Agents";

export default function App() {
  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white">
      <aside className="w-64 bg-black p-4">
        <h1 className="text-yellow-400 font-bold">AgentForge</h1>
      </aside>
      <main className="flex-1 p-4">
        <Dashboard />
      </main>
    </div>
  );
}
