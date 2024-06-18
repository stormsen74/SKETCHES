import { create } from 'zustand'

export const useCameraStore = create()((set, get) => ({
  cameras: [],
  camerasReady: false,

  addCamera: camera =>
    set(state => ({
      cameras: [...state.cameras, camera],
    })),

  setCamerasReady: () => set({ camerasReady: true }),
}))
