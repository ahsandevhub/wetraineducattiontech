import { TaskReportingClient } from "@/components/hrm/reporting/TaskReportingClient";
import { getHrmReportingPageData } from "../../_lib/task-reporting";

export default async function AdminReportingPage(
  props: PageProps<"/dashboard/hrm/admin/reporting">,
) {
  const data = await getHrmReportingPageData("ADMIN", props.searchParams);

  return (
    <TaskReportingClient
      scope="ADMIN"
      data={data}
      createPreviewTimestamp={new Date().toISOString()}
      pageTitle="Admin Task Reporting"
      pageDescription="Log your own tasks and review task reports from employees assigned to you."
    />
  );
}
