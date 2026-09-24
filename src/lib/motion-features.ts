// Loaded asynchronously by <LazyMotion /> so the animation engine is not part of
// the initial bundle. domAnimation covers animate/exit/variants, hover/tap/focus
// gestures and whileInView — everything this site uses (no drag/layout).
import { domAnimation } from "motion/react";

export default domAnimation;
