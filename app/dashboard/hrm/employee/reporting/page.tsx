import { TaskReportingClient } from "@/components/hrm/reporting/TaskReportingClient";
import { getHrmReportingPageData } from "../../_lib/task-reporting";

export default async function EmployeeReportingPage(
  props: PageProps<"/dashboard/hrm/employee/reporting">,
) {
  const data = await getHrmReportingPageData("EMPLOYEE", props.searchParams);

  return (
    <TaskReportingClient
      scope="EMPLOYEE"
      data={data}
      createPreviewTimestamp={new Date().toISOString()}
      pageTitle="My Task Reporting"
      pageDescription="Log your regular tasks and review your previous entries."
    />
  );
}
