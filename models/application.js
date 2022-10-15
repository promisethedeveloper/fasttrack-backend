"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for applications */

class Applications {
	/** Create an application from data, update database, return new application
	 *
	 * data should contain { role, jobpostlink, users_id, company_id, status }
	 */

	static async create({ role, jobpostlink, user_id, company_id, status }) {
		const result = await db.query(
			`INSERT INTO applications
             (role, jobpostlink, user_id, company_id, status)
        `
		);
	}
}
