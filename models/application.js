"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for applications */

class Application {
	/** Create an application from data, update database, return new application
	 *
	 * data should contain { role, jobpostlink, users_id, company_id, status }
	 */

	static async create({
		role,
		companyName,
		jobpostlink,
		location,
		dateofapplication,
		userId,
		status,
	}) {
		const result = await db.query(
			`INSERT INTO applications
             (role, company_name, jobpostlink, location, dateofapplication, user_id, status)
             VALUES($1, $2, $3, $4, $5, $6, $7)
             RETURNING role, company_name, jobpostlink, location, dateofapplication, status`,
			[
				role,
				companyName,
				jobpostlink,
				location,
				dateofapplication,
				userId,
				status,
			]
		);
		const application = result.rows[0];
		return application;
	}

	/** Given a user id, return all user's applications
	 *
	 * Returns { role, companyName, jobpostlink, location, dateofappication }
	 */

	static async getAll(id) {
		const applicationsRes = await db.query(
			`SELECT role,
                    company_name AS "companyName",
                    jobpostlink,
                    location,
                    dateofapplication
                    FROM applications
                    WHERE user_id = $1`,
			[id]
		);

		const applications = applicationsRes.rows;
		return applications;
	}

	/** Given a job link, return data about the role
	 *
	 * Returns { role, companyName, jobpostlink, location, dateofappication }
	 */

	static async get(jobpostlink) {
		const applicationRes = await db.query(
			`SELECT role,
                    company_name AS "companyName",
                    jobpostlink,
                    location,
                    dateofapplication
                    FROM applications
                    WHERE jobpostlink = $1`,
			[jobpostlink]
		);

		if (!applicationRes) {
			throw new NotFoundError(`No job: ${jobpostlink}`);
		}

		const application = applicationRes.rows[0];
		return application;
	}

	/** Update role data with `data`
	 *
	 * This is a partial update - it's fine if it does not contain
	 * all the fields; this only changes provided ones.
	 *
	 * Data can include { role, companyName, jobpostlink, location, dataofapplication }
	 *
	 * Returns { role, companyName, jobpostlink, location, dateofappication }
	 *
	 * Throws NotFoundError if not found
	 */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {
			companyName: "company_name",
		});
		const idVarIdx = "$" + (values.length + 1);
		const querySql = `UPDATE applications
                            SET ${setCols}
                            WHERE id = ${idVarIdx}
                            RETURNING role,
                                    company_name AS "companyName",
                                    jobpostlink,
                                    location
                                    dateofapplication`;
		const result = await db.query(querySql, [...values, id]);
		const application = result.rows[0];

		if (!application) throw new NotFoundError(`No application: ${id}`);
		return application;
	}

	/** Delete given application from database; returns undefined
	 *
	 * Throws NotFoundError if appliaction is not found
	 */
	static async delete(id) {
		const result = await db.query(
			`DELETE FROM 
                applications
                WHERE id = $1
                RETURNING id`,
			[id]
		);

		const application = result.rows[0];

		if (!application) {
			throw new NotFoundError(`No application: ${id}`);
		}
	}
}

module.exports = Application;
