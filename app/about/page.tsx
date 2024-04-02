import StandardLayout from "@/components/layouts/standard/standard-layout";

export default async function Home() {
  return (
    <StandardLayout>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        Đây là trang giới thiệu về dự án.
      </main>
    </StandardLayout>
  );
}
