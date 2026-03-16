import ProductEditor from "../_components/ProductEditor";

export const metadata = { title: "Edit Product – Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductEditor productId={id} />;
}
