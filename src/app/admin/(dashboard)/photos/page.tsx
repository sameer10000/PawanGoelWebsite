import Image from "next/image";
import { PageHeader, AdminCard, EmptyState } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { UploadForm } from "./UploadForm";
import { prisma } from "@/lib/db";
import { deletePhoto, updatePhoto } from "./actions";

const CATEGORIES = [
  { value: "portrait", label: "Portrait of Dr. Goel" },
  { value: "clinic", label: "Clinic" },
  { value: "equipment", label: "Equipment" },
  { value: "team", label: "Team" },
];

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader
        title="Photos"
        description="Upload and remove images used across the website. A real portrait photograph is the single strongest trust signal on the home page — it is worth paying a photographer for."
      />

      <AdminCard title="Upload an image">
        <UploadForm />
      </AdminCard>

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">
        Uploaded images
      </h2>

      {photos.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Until a portrait is uploaded, the home page shows a placeholder."
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-ink-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-ink-100">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                {!photo.published && (
                  <span className="badge absolute top-2 left-2 bg-ink-900/80 text-white">
                    Hidden
                  </span>
                )}
              </div>

              <form action={updatePhoto} className="space-y-3 p-4">
                <input type="hidden" name="id" value={photo.id} />
                <div>
                  <label className="label" htmlFor={`alt-${photo.id}`}>
                    Description
                  </label>
                  <input
                    id={`alt-${photo.id}`}
                    name="alt"
                    required
                    defaultValue={photo.alt}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`caption-${photo.id}`}>
                    Caption
                  </label>
                  <input
                    id={`caption-${photo.id}`}
                    name="caption"
                    defaultValue={photo.caption ?? ""}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label" htmlFor={`category-${photo.id}`}>
                      Category
                    </label>
                    <select
                      id={`category-${photo.id}`}
                      name="category"
                      defaultValue={photo.category}
                      className="input"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor={`sortOrder-${photo.id}`}>
                      Order
                    </label>
                    <input
                      id={`sortOrder-${photo.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={photo.sortOrder}
                      className="input"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-ink-800">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={photo.published}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600"
                  />
                  Show on website
                </label>
                <SubmitButton className="btn-secondary w-full px-4 py-2 text-sm" />
              </form>

              <form
                action={deletePhoto}
                className="border-t border-ink-200 px-4 py-3"
              >
                <input type="hidden" name="id" value={photo.id} />
                <ConfirmButton message="Delete this image permanently?">
                  Delete image
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
