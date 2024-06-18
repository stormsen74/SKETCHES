import { create } from 'zustand'

export const useScrollCam = create()((set, get) => ({
  progress: 0,
  setProgress: progress => {
    set({ progress: progress })
  },
  scrollSpeed: 0,
  setScrollSpeed: value => {
    set({ scrollSpeed: value })
  },
}))
