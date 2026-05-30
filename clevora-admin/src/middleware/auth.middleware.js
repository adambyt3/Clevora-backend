module.exports.requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.admin) {
    req.flash("error", "Silakan login terlebih dahulu untuk mengakses menu admin.");
    return res.redirect("/login");
  }
  
  // Expose the admin user object to views
  res.locals.admin = req.session.admin;
  next();
};
