// Gets authorization code from Spotify OAuth flow and stores it in memory,
// Then returns the code (or error) to Pico when requested
// ---------
// Flow:
// 1. Pico requests Spotify OAuth flow
// 2. User goes to Spotify authorization page and authorizes app
// 3. Spotify redirects to this endpoint with code and state as query parameters
// 4. This endpoint stores the code and state in memory
// 5. Pico requests the stored code with a GET request, providing the state as a query parameter
// 6. This endpoint checks the state and returns the stored code
// 7. Pico uses the code to get an access token from Spotify API

// Temporary in-memory storage (reset on serverless cold start)
const stored = {
	code: null,
	state: null,
	error: null,
}


// API endpoint to store and retrieve Spotify OAuth code
export default async (req, res) => {
	console.log(`Incoming ${req.method} request:`, {
		query: req.query,
		body: req.body,
		stored: stored // Log current stored values
	});

	// save auth code from OAuth redirect
	if (req.method === 'GET') {
		// get and store redirect url params
		stored.code = req.query.code || null;
		stored.state = req.query.state || null;
		stored.error = req.query.error || null;

		// return error if no code or state provided
		if (!stored.code || !stored.state) {
			console.log("GET failed: No code or state provided");
			res.status(400).json({ error: 'PROXY: No code or state provided. Please ensure you are using the correct redirect URL.' });
			return;
		}

		console.log("Stored after GET:", stored);
		res.status(200).send('Code stored!');
	}

	// get saved code to return to Pico
	else if (req.method === 'POST') {
		// get state from GET body
		let state = req.body.state || null;

		// function to return error response
		const returnError = (message) => res.status(400).json({ error: message });

		// return error if no state provided
		if (!state) {
			console.log("POST failed: No state provided");
			returnError('PROXY: No state provided. Please provide a state parameter.');
			return;
		}

		if (!stored.code) {
			console.log("POST failed: No code stored");
			returnError('PROXY: No auth code stored in proxy.');
			return;
		}

		// return error if no code stored or state mismatch
		if (stored.state !== state) {
			console.log("POST failed: No code or state mismatch", {
				storedState: stored.state,
				requestedState: state
			});
			returnError('PROXY: State mismatch. Please ensure you are using the correct state parameter.');
			return;
		}

		// return stored code
		console.log("POST success: Returning code");
		res.status(200).json({ code: stored.code });
	}
};
