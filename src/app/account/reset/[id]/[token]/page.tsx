import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    token: string;
  }>;
}

export default async function AccountResetRedirect({ params }: PageProps) {
  const { id, token } = await params;
  redirect(`/activate?id=${id}&token=${token}&mode=reset`);
}
