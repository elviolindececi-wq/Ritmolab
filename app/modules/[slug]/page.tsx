import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonWizard } from "@/components/lesson-wizard";
import { modules } from "@/lib/content";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = modules.find((m) => m.slug === slug);
  if (!module) notFound();

  return (
    <div className="container-page py-6 md:py-10">
      <Link href="/learn" className="font-black text-brand-700 text-sm">← Volver al camino</Link>
      <div className="mt-4 md:mt-6">
        <LessonWizard module={module} />
      </div>
    </div>
  );
}
