import { gsap } from "gsap"

// Register GSAP eases
gsap.registerEase("customExpo", gsap.parseEase("power3.out"))
gsap.registerEase("customBack", gsap.parseEase("back.out(1.7)"))

export const motionConfig = {
  camera: {
    duration: 1.0, // 0.9-1.1s as specified
    ease: "power3.out",
    focusOffset: { x: 0, y: 1.2, z: 2.6 },
  },
  panel: {
    duration: 0.32, // 280-360ms as specified
    ease: "power2.out",
    stagger: 0.075, // 60-90ms stagger
    slideDistance: 100, // px
  },
  content: {
    stagger: 0.075, // 60-90ms
    duration: 0.2,
    ease: "power2.out",
  },
  wheel: {
    cooldown: 675, // 650-700ms
    threshold: 50,
  },
  orbit: {
    speed: 0.1, // Rotation speed
    wobble: 0.15,
    pauseDuration: 0.5,
  },
  node: {
    hover: {
      scale: 1.1,
      duration: 0.2,
      ease: "back.out(1.7)",
    },
    focus: {
      scale: 1.2,
      duration: 0.3,
      ease: "back.out(1.7)",
    },
  },
  gestures: {
    swipeThreshold: 50,
    swipeCooldown: 500,
  },
} as const

export const createTimeline = () => gsap.timeline()

export const animateCamera = (
  camera: any,
  target: { x: number; y: number; z: number },
  lookAt: { x: number; y: number; z: number },
  onComplete?: () => void,
) => {
  const tl = createTimeline()

  tl.to(camera.position, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: motionConfig.camera.duration,
    ease: motionConfig.camera.ease,
  }).to(
    camera,
    {
      duration: motionConfig.camera.duration,
      ease: motionConfig.camera.ease,
      onUpdate: () => {
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
      },
      onComplete,
    },
    0,
  )

  return tl
}

export const animatePanel = (element: HTMLElement, isOpen: boolean, onComplete?: () => void) => {
  const tl = createTimeline()

  if (isOpen) {
    tl.set(element, { x: motionConfig.panel.slideDistance, opacity: 0 })
      .to(element, {
        x: 0,
        opacity: 1,
        duration: motionConfig.panel.duration,
        ease: motionConfig.panel.ease,
      })
      .to(
        element.querySelectorAll("[data-animate]"),
        {
          y: 0,
          opacity: 1,
          duration: motionConfig.content.duration,
          ease: motionConfig.content.ease,
          stagger: motionConfig.content.stagger,
          onComplete,
        },
        0.1,
      )
  } else {
    tl.to(element, {
      x: motionConfig.panel.slideDistance,
      opacity: 0,
      duration: motionConfig.panel.duration,
      ease: motionConfig.panel.ease,
      onComplete,
    })
  }

  return tl
}
