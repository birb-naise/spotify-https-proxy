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
let stored = {
	code: null,
	state: null,
	error: null,
}


// clear stored values
function clearStored() {
	stored.code = null;
	stored.state = null;
	stored.error = null;
}


// API endpoint to store and retrieve Spotify OAuth code
export default async (req, res) => {
	console.log(`Incoming ${req.method} request:`, {
		query: req.query,
		body: req.body,
		stored: stored // Log current stored values
	});

	// save code from Spotify OAuth flow
	if (req.method === 'POST') {
		// get code and state from query params or body
		const CODE = req.query.code || null;
		const STATE = req.query.state || null;
		const ERROR = req.query.error || null;

		// save code and state to in-memory storage
		stored.code = CODE;
		stored.state = STATE;
		stored.error = ERROR;

		console.log("Stored after POST:", stored);
		res.status(200).send('Code stored!');
	}

	// get saved code to return to Pico
	else if (req.method === 'GET') {
		// get state from GET body
		const STATE = req.query.state || null;

		// function to return error response
		const returnError = (message) => res.status(400).json({ error: message });

		// return error if no state provided
		if (!STATE) {
			console.log("GET failed: No state provided");
			returnError('PROXY: No state provided. Please provide a state parameter and try again.');
			return;
		}

		// return error if no code stored or state mismatch
		if (!stored.code || stored.state !== STATE) {
			console.log("GET failed: No code or state mismatch", {
				storedState: stored.state,
				requestedState: STATE
			});
			returnError('PROXY: No auth code stored in proxy. Please complete the Spotify OAuth flow and try again.');
			return;
		}

		// return stored code
		console.log("GET success: Returning code");
		res.status(200).json({ code: stored.code });
	}
};
