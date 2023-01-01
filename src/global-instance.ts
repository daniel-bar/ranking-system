import path from 'path';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';

class GlobalInstance {
	private readonly _logger: winston.Logger;
	private readonly _db: PrismaClient;

	private static _instance: GlobalInstance;

	private constructor() {
		this._logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
			transports: [
				new winston.transports.Console(),
				new winston.transports.File({
					filename: path.join(__dirname, '../logs.log'),
					level: 'info',
				}),
			],
		});

		this._db = new PrismaClient();
	}

	/**
	 * Getter for singelton instance
	 * @returns GlobalInstance singelton instance
	 */
	public static getInstance() {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new GlobalInstance();
		return this._instance;
	}

	/**
	 * Getter for the logger
	 * @returns logger instance
	 */
	public get logger() {
		return this._logger;
	}

	/**
	 * Getter for the db
	 * @returns db instance
	 */
	public get db() {
		return this._db;
	}
}

export default GlobalInstance;
