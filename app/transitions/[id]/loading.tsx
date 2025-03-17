export default function Loading() {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold mb-4">Loading transition...</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2.5"></div>
        </div>
      </div>
    )
  }
  
  