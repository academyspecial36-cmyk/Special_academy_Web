export default function StudentGuideLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-36 bg-primary/10 rounded-md" />
        <div className="h-4 w-64 bg-primary/10 rounded-md mt-2" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-primary/5 rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}
