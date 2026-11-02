import { notFound } from "next/navigation";
import { ADHKAR_CATEGORIES } from "@/lib/adhkar";
import { CategoryView } from "@/components/adhkar-category-view";

// صفحات ثابتة لكل التصنيفات، والعرض التفاعلي في مكون العميل
export function generateStaticParams() {
  return ADHKAR_CATEGORIES.map((c) => ({ id: String(c.id) }));
}

export default async function AdhkarCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!ADHKAR_CATEGORIES.some((c) => c.id === categoryId)) notFound();
  return <CategoryView categoryId={categoryId} />;
}
