import Sidebar from "../components/sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      {/* FontAwesome CDN */}
      {/*<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />*/}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"></link>
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
