import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import companiesRouter from "./companies";
import mentorsRouter from "./mentors";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import sessionsRouter from "./sessions";
import coursesRouter from "./courses";
import aiRouter from "./ai";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(companiesRouter);
router.use(mentorsRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(sessionsRouter);
router.use(coursesRouter);
router.use(aiRouter);
router.use(dashboardRouter);

export default router;
