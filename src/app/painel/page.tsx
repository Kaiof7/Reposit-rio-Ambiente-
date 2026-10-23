import type { Metadata } from "next";
import { getCatalog } from "@/catalog/load";
import { LoginForm } from "@/components/admin/login-form";
import { ModelEditor } from "@/components/admin/model-editor";
import { SizeEditor } from "@/components/admin/size-editor";
import { focusRing, secondaryButtonClass } from "@/components/styles";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminCredentials, hasDatabase } from "@/lib/env";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Painel | Sua Plaquinha NFC",
  robots: { index: false, follow: false },
};

const noticeClass = "rounded-xl bg-foreground/5 p-4 leading-relaxed";

export default async function PanelPage() {
  const configured = getAdminCredentials() !== null;
  const signedIn = configured && (await isAdmin());
  const catalog = signedIn ? await getCatalog() : null;
  const databaseReady = hasDatabase();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Painel da loja</h1>
        {signedIn && (
          <form action={logout}>
            <button type="submit" className={secondaryButtonClass}>Sair</button>
          </form>
        )}
      </div>

      {!configured && (
        <p className={noticeClass}>
          O painel está desativado. Na Vercel, crie as variáveis <code>ADMIN_EMAIL</code> (seu e-mail) e{" "}
          <code>ADMIN_PASSWORD</code> (senha de pelo menos 12 caracteres) e faça um novo deploy.
        </p>
      )}

      {configured && !signedIn && <LoginForm />}

      {catalog && (
        <>
          {!databaseReady && (
            <p className={noticeClass}>
              O banco de dados ainda não foi criado, então nada pode ser salvo. Na Vercel, abra Storage, crie um banco
              Neon (Postgres) ligado a este projeto e faça um novo deploy.
            </p>
          )}
          <section aria-labelledby="titulo-modelos-painel" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-modelos-painel" className="text-2xl font-semibold">Modelos</h2>
              <p className="leading-relaxed text-foreground/80">
                Toque em um modelo para marcar os tamanhos que ele oferece, o preço e o que está esgotado. Esgotado
                continua aparecendo na loja, mas não pode ser pedido.
              </p>
            </div>
            {catalog.models.map((model) => (
              <ModelEditor key={model.id} model={model} sizes={Object.values(catalog.sizes)} disabled={!databaseReady} />
            ))}
          </section>
          <section aria-labelledby="titulo-tamanhos-painel" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-tamanhos-painel" className="text-2xl font-semibold">Tamanhos</h2>
              <p className="leading-relaxed text-foreground/80">
                Crie um tamanho novo aqui e depois ative-o nos modelos acima com o preço.
              </p>
            </div>
            <SizeEditor disabled={!databaseReady} />
            {Object.values(catalog.sizes).map((size) => (
              <details key={size.id} className="rounded-2xl border border-foreground/15">
                <summary className={`flex min-h-11 cursor-pointer items-center p-4 font-semibold ${focusRing}`}>{size.label}</summary>
                <SizeEditor size={size} disabled={!databaseReady} />
              </details>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
