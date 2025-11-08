Redis Key Manager (frontend)

How to run

1. Start the server from the `server` folder (it uses Bun in this project):

   cd server
   bun start

2. Open the frontend in your browser:

   http://localhost:3355/app/

What it does

- Lists all keys (GET /getall)
- Get value for a key (POST /getVal)
- Set key/value (POST /setVal)
- Delete key (DELETE /deleteV)

Notes

- The frontend is served at `/app` so API endpoints remain at their current paths and won’t conflict.
- If you want the frontend served at `/`, we can update the server routes accordingly (this will change the API root).