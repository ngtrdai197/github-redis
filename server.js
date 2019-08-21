const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const client = redis.createClient();

const app = express();
const baseUrl = 'https://api.github.com/users';

const fetchRepos = async (req, res, next) => {
	try {
		const { username } = req.params;
		const result = await fetch(`${baseUrl}/${username}/repos`);
		const data = await result.json();
		await client.setex(`${username}`, 3600, JSON.stringify(data));
		return res.send(data);
	} catch (error) {
		throw error;
	}
}

const cache = (req, res, next) => {
	const { username } = req.params;
	client.get(username, (error, data) => {
		if (error) {
			throw error;
		}
		if (data !== null) {
			return res.send(JSON.parse(data));
		} else {
			next();
		}
	});
}

app.get('/api/github/:username', cache, fetchRepos);

app.listen(3000, () => {
	console.log(`Server listening at port: 3000`);
})
