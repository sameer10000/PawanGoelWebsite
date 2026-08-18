import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { PasswordForm } from "./PasswordForm";
import { requireAdmin } from "@/lib/auth";
import { updateAccount } from "./actions";

export default async function AccountPage() {
  const user = await requireAdmin();

  return (
    <>
      <PageHeader
        title="Account"
        description="Your login for this admin panel."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Login details">
          <form action={updateAccount} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={user.name}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={user.email}
                className="input"
              />
              <p className="hint">This is the address you sign in with.</p>
            </div>
            <SubmitButton />
          </form>
        </AdminCard>

        <AdminCard
          title="Change password"
          description="If you are still using the password from setup, change it now."
        >
          <PasswordForm />
        </AdminCard>
      </div>
    </>
  );
}
