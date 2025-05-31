import { AppSidebar } from "@/components/app-sidebar";
import XpenzaUpload from "@/components/XpenzaUpload";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Iframe from "./iframe";

function renderContent(pathname: string) {
  switch (pathname) {
    case "dashboard":
      return <Dashboard />;
    case "xpenza-ai":
      return <Iframe />;
    default:
      return <XpenzaUpload />;
  }
}
export default function Home() {
  const location = useLocation()
  const pathname = location.pathname.split('/')[1]
  console.log(pathname)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Xpenza</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="">
          {renderContent(pathname)}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
