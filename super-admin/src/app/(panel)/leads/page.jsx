import Leads from "../../../../components/Leads";

export default async function SuperAdminLeadsPage({ searchParams }) {
  const params = await searchParams;
  return <Leads initialStatus={typeof params?.status === "string" ? params.status : ""} />;
}
