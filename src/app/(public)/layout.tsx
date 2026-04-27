import TrackingScripts from "@/components/public/TrackingScripts";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <TrackingScripts />
    </>
  );
}
