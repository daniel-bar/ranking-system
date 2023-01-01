import path from 'path';

import fs from 'fs-extra';

import GlobalInstance from '../global-instance';
import type { IRedditData } from '../interfaces/reddit';
import type { IScore } from '../interfaces/score';

export const redditScore = async (): Promise<IScore> => {
	let score = 0;
	let averageScore = 0;

	// Get subscriber count numbers from each object in the array
	const redditData = await GlobalInstance.getInstance().db.reddit.aggregateRaw({
		pipeline: [
			{
				$unwind: '$stats',
			},
			{
				$group: {
					_id: '$stats.timeStamp',
					subscribersCount: { $push: '$stats.subscriberCount' },
				},
			},
			{
				$sort: { _id: 1 },
			},
		],
	});

	// Stringify Prisma.JsonObject
	const redditDataStringified = JSON.stringify(redditData);

	// Define path
	const redditDataPath = path.join(__dirname, '..', 'data', 'reddit_data.json');

	// Write reddit data into file
	await fs.outputFile(redditDataPath, redditDataStringified);

	// Parse string to array
	const redditDataArray: IRedditData[] = JSON.parse(redditDataStringified);

	// Reduce reddit data array to total volumes
	const totalsubscribersCount = redditDataArray.map((item) => {
		return {
			_id: item._id,
			subscribersCount: item.subscribersCount.reduce((prev, curr) => prev + curr, 0),
		};
	});

	// Ranking score logic
	const lastValue = totalsubscribersCount[totalsubscribersCount.length - 1]!.subscribersCount;

	if (lastValue >= 0 && lastValue <= 10000) {
		score = 2;
	}

	if (lastValue >= 10001 && lastValue <= 50000) {
		score = 4;
	}

	if (lastValue >= 50001) {
		score = 6;
	}

	// Ranking average score logic
	const average =
		totalsubscribersCount.reduce((prev, curr) => prev + Number(curr.subscribersCount), 0) /
		totalsubscribersCount.length;

	if (average >= 0 && average <= 10000) {
		averageScore = 2;
	}

	if (average >= 10001 && average <= 50000) {
		averageScore = 4;
	}

	if (average >= 50001) {
		averageScore = 6;
	}

	return {
		score,
		averageScore,
	};
};
