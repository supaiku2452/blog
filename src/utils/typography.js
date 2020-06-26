import Typography from "typography"
import Moraga from "typography-theme-moraga"

const typography = new Typography(Moraga)

if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
