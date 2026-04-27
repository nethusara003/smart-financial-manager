import {
  RetirementInputError,
  calculateRetirementPlan,
  simulateRetirementPlan,
  adviseRetirementPlan,
  saveRetirementPlan,
  listRetirementPlans,
  refreshRetirementPlan,
} from "./retirement.service.js";

const getUserId = (req) => req?.user?._id || req?.user?.id || null;

const sendError = (res, error) => {
  const statusCode = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : error instanceof RetirementInputError
      ? 400
      : 500;

  return res.status(statusCode).json({
    success: false,
    message: error?.message || "Unexpected retirement planning error",
  });
};

export const calculateRetirementProjection = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const result = await calculateRetirementPlan({
      userId,
      payload: req.body || {},
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const simulateRetirementProjection = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const result = await simulateRetirementPlan({
      userId,
      payload: req.body || {},
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const adviseRetirementProjection = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const result = await adviseRetirementPlan({
      userId,
      payload: req.body || {},
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const listSavedRetirementPlans = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const plans = await listRetirementPlans({ userId });

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const saveRetirementProjection = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const result = await saveRetirementPlan({
      userId,
      payload: req.body || {},
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const refreshSavedRetirementProjection = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (req.user?.isGuest) {
      return res.status(403).json({
        success: false,
        message: "Retirement planner is only available for registered users",
      });
    }

    const result = await refreshRetirementPlan({
      userId,
      planId: req.params.planId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
