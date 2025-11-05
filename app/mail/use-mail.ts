import { atom, useAtom } from "jotai"

import { Mail, mails } from "@/app/mail/data"

type Config = {
  selected: Mail["id"] | null
  fontSize: number
  showAvatarStacks: boolean
  showAttachments: boolean
  selectedIds: Set<string>
  lastSelectedIndex: number | null
  theme: "auto" | "light" | "dark"
  blockRemoteImages: boolean
}

const configAtom = atom<Config>({
  selected: mails[0]?.id || null,
  fontSize: 16, // Default font size in px
  showAvatarStacks: true, // Show participant avatars by default
  showAttachments: true, // Show attachment indicators by default
  selectedIds: new Set<string>(), // Multi-select state
  lastSelectedIndex: null, // For shift-click range selection
  theme: "auto", // Default to system preference
  blockRemoteImages: true, // Block remote images by default for privacy
})

export function useMail() {
  return useAtom(configAtom)
}
