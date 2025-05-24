// test api using sample code
let spotifyCode = "this_is_the_test_code";

export default async (req, res) => {
    if (req.method === 'GET') {
        // Retrieve code (called by Pico)
        res.status(200).json({ code: spotifyCode });
    }
};
