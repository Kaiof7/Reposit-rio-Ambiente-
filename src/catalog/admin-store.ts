import "server-only";
import { and, eq, inArray, max, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { modelSettings, modelSizes, sizes } from "@/db/schema";
import { slugify, uniqueId, type ModelForm, type SizeForm } from "./admin-input";
import { defaultRows } from "./rows";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

// First panel save copies the code defaults, so editing one model keeps the
// others as they were on the store.
async function ensureSeeded(tx: Tx) {
  // Serialize concurrent first saves.
  await tx.execute(sql`lock table ${sizes} in share row exclusive mode`);
  const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(sizes);
  if (count > 0) return;
  const rows = defaultRows();
  await tx.insert(sizes).values(rows.sizes);
  await tx.insert(modelSettings).values(rows.settings);
  await tx.insert(modelSizes).values(rows.offers);
}

export async function saveModel(form: ModelForm) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await ensureSeeded(tx);
    await tx
      .insert(modelSettings)
      .values({ modelId: form.modelId, available: form.available })
      .onConflictDoUpdate({ target: modelSettings.modelId, set: { available: form.available } });
    // Replace only the sizes this form showed, so a stale form (e.g. another
    // tab opened before a size was created) cannot drop offers it did not list.
    if (form.sizeIds.length > 0) {
      await tx
        .delete(modelSizes)
        .where(and(eq(modelSizes.modelId, form.modelId), inArray(modelSizes.sizeId, form.sizeIds)));
    }
    if (form.offers.length > 0) {
      await tx.insert(modelSizes).values(form.offers.map((offer) => ({ modelId: form.modelId, ...offer })));
    }
  });
}

// Updates a size, or creates one (empty id) with an id derived from its name.
export async function saveSize(form: SizeForm) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await ensureSeeded(tx);
    const values = { label: form.label, description: form.description, shape: form.shape };
    if (form.id) {
      await tx.update(sizes).set(values).where(eq(sizes.id, form.id));
      return;
    }
    const existing = await tx.select({ id: sizes.id }).from(sizes);
    const [{ last }] = await tx.select({ last: max(sizes.position) }).from(sizes);
    const id = uniqueId(slugify(form.label), existing.map((row) => row.id));
    await tx.insert(sizes).values({ id, ...values, position: (last ?? -1) + 1 });
  });
}
