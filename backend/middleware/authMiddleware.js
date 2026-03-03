const { requireAuth } = require('@clerk/express')

// Export the Clerk authentication middleware.
// This will verify the JWT and add the `auth` object to `req`.
// e.g. const { userId } = req.auth();
module.exports = requireAuth()
