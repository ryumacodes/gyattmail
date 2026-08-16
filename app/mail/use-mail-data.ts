import { atom, useAtom } from "jotai"
import { Mail, mails as initialMails } from "@/app/mail/data"

// Mutable mail data atom - holds the current state of all mails
const mailDataAtom = atom<Mail[]>(initialMails)

// Hook to access and update mail data
export function useMailData() {
  return useAtom(mailDataAtom)
}
