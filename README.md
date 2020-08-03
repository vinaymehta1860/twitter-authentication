# twitter-authentication
This is the authentication service for Twitter project. It's a NodeJS server tied with MongoDB database.

This repository can basically be forked and used as an authentication server that would handle user sing-up, sign-in and sign-out functionality.

### User model:
- id: `String` **default MongoDB id allocation**
- email: `String`
- firstName: `String`
- lastName: `String`
- salt: `String`
- passwordHash: `String`
- dateCreated: `Date`
- loginHistory: `[Date]`

### Sign up flow:
- Register the new user in database
- Then proceed with sign in flow (if the user with provided emaail already exits, it returns an error)
- Make an external call to another API service to register the new user. (**This is specific for twitter authentication system, if you're forking this to reuse this
  authentication architecture but don't want to add this step, you can safely remove this and everything else will still run fine.**)

### Sign in flow:
- Check the credentials provided
- If credentails are correct, create JWT access and refresh tokens for the user using `userId` for signature
  - `access_token` expires in 15 mins
  - `refresh_token` expires in 15 days
- Add an entry to the `loginHistory` array in database
- Store the `access_token` on cookie
- DONE!

### Sign out flow:
- Clear `access_token` and `refresh_token`
- Clear the cookie
- DONE!
