// Placeholder auth middleware. Will eventually verify the user's session/token
// (issued after the Microsoft OAuth flow) before allowing access to protected routes.

function requireAuth(req, res, next) {
  // TODO: validate session/token via AuthService
  next();
}

module.exports = { requireAuth };
