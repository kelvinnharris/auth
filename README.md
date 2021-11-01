# Authentication and Authorization

## Running locally

- Install necessary dependencies
- Run the two servers `authServer.js` and `server.js` separately
- Test the APIs can be done with `requests.rest` file or Postman


## Steps to reproduce

### 1. Run both servers

```
npm run devStart
npm run authStart
```

### 2. Access `requests.rest` for demo

**Unsuccessful GET request to API endpoint when a user is not authenticated, returns HTTP 401 response. Successful GET request to API endpoint after user is authenticated, returns HTTP 200**

1. Unsuccessful (not authenticated)
    - Send request #1 (without 'Authorization' header) and receive 401 response

2. Successful (authenticated)
    - Register and login as User
    - Upon logging in, retrieve accessToken and paste it into request #1 header
    - Send request #1 and receive 200 response

**Unsuccessful GET request to API endpoint when a user is not authorized, returns HTTP
403 response. Successful GET request to API endpoint if user is authorized, returns HTTP 200**

1. Unsuccessful (not authorized) for User role
    - Send request #1 and receive 200 response
    - Send request #2 and receive 403 response
2. Successful (authorized) for Admin role
    - Send request #1 and receive 200 response
    - Send request #2 and receive 200 response

**Other details**

- Implementation of JWT (access token and refresh token) is more secure.
- Authentication and authorization check is done using middleware.
- Role features can be easily used by specifying the roles in the middleware, and extended by adding new roles in `role.js`.

```
// Sample code from server.js
app.get('/posts', authenticateToken, authorize([Role.Admin, Role.User]), (req, res) => {
  res.json(posts.filter(post => post.username === req.user.username))
})

app.get('/all-posts', authenticateToken, authorize([Role.Admin]), (req, res) => {
  res.json(posts)
})
```

## References
### 401 Unauthorized
401 Unauthorized client error status response code indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource.

This error status is similar to the 403 Forbidden error status, except that in situations resulting in this error status, user authentication can allow access to the resource.

Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401

### 403 Forbidden

403 Forbidden client error status response code indicates that the server understands the request but refuses to authorize it.

This status is similar to 401, but in this case, re-authenticating will make no difference. The access is permanently forbidden and tied to the application logic, such as insufficient rights to a resource.

Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403