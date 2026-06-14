import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import type { HoLinkUser } from '@/models'

export function useProfileHead(user: () => HoLinkUser | null | undefined, username: () => string) {
  useHead({
    title: computed(() => {
      const u = user()
      const uname = username()
      return u ? `${u.displayName} (@${uname}) — HoLink` : 'Profile Not Found'
    }),
    meta: [
      {
        name: 'description',
        content: computed(() => user()?.bio || ''),
      },
      {
        property: 'og:title',
        content: computed(() => {
          const u = user()
          return u ? `${u.displayName} (@${username()})` : 'Profile Not Found'
        }),
      },
      {
        property: 'og:description',
        content: computed(() => user()?.bio || ''),
      },
      {
        property: 'og:image',
        content: computed(() => user()?.avatarUrl || ''),
      },
      {
        property: 'og:type',
        content: 'profile',
      },
      {
        property: 'og:site_name',
        content: 'HoLink',
      },
    ],
  })
}
