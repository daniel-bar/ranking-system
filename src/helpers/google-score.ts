import path from 'path';

import fs from 'fs-extra';

import GlobalInstance from '../global-instance';
import type { IGoogleData } from '../interfaces/google';

export const googleScore = async () => {
	let score = 0;
	let averageScore = 0;

	// Get volume numbers from each object in the array
	const googleData = await GlobalInstance.getInstance().db.google.aggregateRaw({
		pipeline: [
			{
				$unwind: '$stats',
			},
			{
				$group: {
					_id: '$stats.timeStamp',
					volumes: { $push: '$stats.volume' },
				},
			},
			{
				$sort: { _id: 1 },
			},
		],
	});

	// Stringify Prisma.JsonObject
	const googleDataStringified = JSON.stringify(googleData);

	// Define path
	const googleDataPath = path.join(__dirname, '..', 'data', 'google_data.json');

	// Write google data into file
	await fs.outputFile(googleDataPath, googleDataStringified);

	// Parse string to array
	const googleDataArray: IGoogleData[] = JSON.parse(googleDataStringified);

	// Reduce google data array to total volumes
	const totalVolumes = googleDataArray.map((item) => {
		return {
			_id: item._id,
			volumes: item.volumes.reduce((prev, curr) => prev + curr, 0),
		};
	});

	// Ranking score logic
	const lastValue = totalVolumes[totalVolumes.length - 1]!.volumes;

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
	const average = totalVolumes.reduce((prev, curr) => prev + curr.volumes, 0) / totalVolumes.length;

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
