import { cookies } from "next/headers"

import { Mail } from "@/app/mail/components/mail"
import { accounts } from "@/app/mail/data"

export default async function MailPage() {
  const cookieStore = await cookies()
  const layout = cookieStore.get("react-resizable-panels:layout:mail")
  const collapsed = cookieStore.get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <div className="flex-col flex h-screen">
      <Mail
        accounts={accounts}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
