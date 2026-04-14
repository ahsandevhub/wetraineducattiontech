import { TaskReportingClient } from "@/components/hrm/reporting/TaskReportingClient";
import { getHrmReportingPageData } from "../../_lib/task-reporting";

export default async function SuperReportingPage(
  props: PageProps<"/dashboard/hrm/super/reporting">,
) {
  const data = await getHrmReportingPageData("SUPER_ADMIN", props.searchParams);

  return (
    <TaskReportingClient
      scope="SUPER_ADMIN"
      data={data}
      createPreviewTimestamp={new Date().toISOString()}
      pageTitle="HRM Task Reporting"
      pageDescription="Review and manage task reports across the entire HRM team."
    />
  );
}
