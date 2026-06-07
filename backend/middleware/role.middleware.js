const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.json({ success: false, message: 'Access denied', data: null });
    }
    next();
  };
};

module.exports = { allowRoles };