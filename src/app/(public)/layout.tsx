import TrackingScripts from "@/components/public/TrackingScripts";

export const dynamic = "force-dynamic";

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
