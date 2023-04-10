import { Meteor } from 'meteor/meteor';
import type { INpsVote } from '@rocket.chat/core-typings';
import { serverFetch as fetch } from '@rocket.chat/server-fetch';

import { settings } from '../../../app/settings/server';
import { getWorkspaceAccessToken } from '../../../app/cloud/server';
import { SystemLogger } from '../../lib/logger/system';

type NPSResultPayload = {
	total: number;
	votes: Pick<INpsVote, 'identifier' | 'roles' | 'score' | 'comment'>[];
};

export const sendNpsResults = Meteor.bindEnvironment(async function sendNpsResults(npsId: string, data: NPSResultPayload) {
	const token = await getWorkspaceAccessToken();
	if (!token) {
		return false;
	}

	const npsUrl = settings.get('Nps_Url');

	try {
		return (
			await fetch(`${npsUrl}/v1/surveys/${npsId}/results`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})
		).json();
	} catch (e) {
		SystemLogger.error(e);
		return false;
	}
});
