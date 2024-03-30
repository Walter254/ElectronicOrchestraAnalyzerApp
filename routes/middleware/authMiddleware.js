const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log("User is authenticated, proceeding to next middleware/route handler.");
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error("User is not authenticated.");
    // Distinguish between API and web requests
    if (req.headers.accept.indexOf('application/json') !== -1) {
      // Handle API requests
      console.error("User is not authenticated, sending a 401 status with a JSON response.");
      return res.status(401).json({ error: 'You are not authenticated' });
    } else {
      // Handle web requests
      console.error("Redirecting to login page.");
      return res.redirect('/auth/login'); // Redirect unauthenticated users to the login page
    }
  }
};

module.exports = {
  isAuthenticated
};