import GlobalInstance from './global-instance';

import { googleScore } from './helpers/google-score';
import { redditScore } from './helpers/reddit-score';
import { instagramScore } from './helpers/instagram-score';

GlobalInstance.getInstance()
	.db.$connect()
	.then(async () => {
		GlobalInstance.getInstance().logger.info('Successfully initiated connection for mongodb database');

		const googleResult = await googleScore();
		const redditResult = await redditScore();
		const instagramResult = await instagramScore();

		const googleFinalScore = googleResult.score + googleResult.averageScore;
		const redditFinalScore = redditResult.score + redditResult.averageScore;
		const instagramFinalScore = instagramResult.score + instagramResult.averageScore;

		console.log(`googleFinalScore: ${googleFinalScore}`);
		console.log(`redditFinalScore: ${redditFinalScore}`);
		console.log(`instagramFinalScore: ${instagramFinalScore}`);

		process.on('exit', () => {
			GlobalInstance.getInstance().db.$disconnect();
		});
	})
	.catch((error: unknown) => {
		GlobalInstance.getInstance().db.$disconnect();
		GlobalInstance.getInstance().logger.error(`Connection failed with error: ${error}`);
	});
