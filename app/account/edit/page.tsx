import { EditProfileClient } from "./EditProfileClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireMe } from "@/lib/dal";

export default async function EditAccountPage() {
  const me = await requireMe();

  return (
    <>
    <PageHeader
        title="Edit Account"
        subtitle="Manage your profile & security"
        back="/account"
      />

      <EditProfileClient user={me} />
  </>
  );
}
