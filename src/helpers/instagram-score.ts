import path from 'path';

import fs from 'fs-extra';

import GlobalInstance from '../global-instance';
import type { IInstagramData } from '../interfaces/instagram';
import type { IScore } from '../interfaces/score';

export const instagramScore = async (): Promise<IScore> => {
	let score = 0;
	let averageScore = 0;

	// Get hashtag count numbers from each object in the array
	const instagramData = await GlobalInstance.getInstance().db.instagram.aggregateRaw({
		pipeline: [
			{
				$unwind: '$stats',
			},
			{
				$group: {
					_id: '$stats.timeStamp',
					hashtagsCount: { $push: '$stats.count' },
				},
			},
			{
				$sort: { _id: 1 },
			},
		],
	});

	// Stringify Prisma.JsonObject
	const instagramDataStringified = JSON.stringify(instagramData);

	// Define path
	const instagramDataPath = path.join(__dirname, '..', 'data', 'instagram_data.json');

	// Write instagram data into file
	await fs.outputFile(instagramDataPath, instagramDataStringified);

	// Parse string to array
	const instagramDataArray: IInstagramData[] = JSON.parse(instagramDataStringified);

	// Reduce instagram data array to total hashtags count
	const totalhashtagsCount = instagramDataArray.map((item) => {
		return {
			_id: item._id,
			hashtagsCount: item.hashtagsCount.reduce((perv, curr) => perv + curr, 0),
		};
	});

	// Ranking score logic
	const lastValue = totalhashtagsCount[totalhashtagsCount.length - 1]!.hashtagsCount;

	if (lastValue >= 0 && lastValue <= 100000) {
		score = 1;
	}

	if (lastValue >= 100001 && lastValue <= 500000) {
		score = 2;
	}

	if (lastValue >= 500001) {
		score = 3;
	}

	// Ranking average score logic
	const average =
		totalhashtagsCount.reduce((prev, curr) => prev + Number(curr.hashtagsCount), 0) /
		totalhashtagsCount.length;

	if (average >= 0 && average <= 100000) {
		averageScore = 1;
	}

	if (average >= 100001 && average <= 500000) {
		averageScore = 2;
	}

	if (average >= 500001) {
		averageScore = 3;
	}

	return {
		score,
		averageScore,
	};
};
