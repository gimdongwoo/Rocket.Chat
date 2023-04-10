import { serverFetch as fetch } from '@rocket.chat/server-fetch';

const defaultFetchOptions = {
	headers: {
		'Content-Type': 'application/json',
	},
};

export class SlackAPI {
	constructor(apiToken) {
		this.apiToken = apiToken;
	}

	async getChannels(cursor = null) {
		let channels = [];
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			types: 'public_channel',
			exclude_archived: true,
			limit: 1000,
			cursor,
		});
		const request = await fetch(`https://slack.com/api/conversations.list?${queryparams.toString()}`);
		const response = await request.json();

		if (response && response && Array.isArray(response.channels) && response.channels.length > 0) {
			channels = channels.concat(response.channels);
			if (response.response_metadata && response.response_metadata.next_cursor) {
				const nextChannels = await this.getChannels(response.response_metadata.next_cursor);
				channels = channels.concat(nextChannels);
			}
		}

		return channels;
	}

	async getGroups(cursor = null) {
		let groups = [];
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			types: 'private_channel',
			exclude_archived: true,
			limit: 1000,
			cursor,
		});
		const request = await fetch(`https://slack.com/api/conversations.list?${queryparams.toString()}`);
		const response = await request.json();

		if (response && response && Array.isArray(response.channels) && response.channels.length > 0) {
			groups = groups.concat(response.channels);
			if (response.response_metadata && response.response_metadata.next_cursor) {
				const nextGroups = await this.getGroups(response.response_metadata.next_cursor);
				groups = groups.concat(nextGroups);
			}
		}

		return groups;
	}

	async getRoomInfo(roomId) {
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			channel: roomId,
			include_num_members: true,
		});
		const request = await fetch(`https://slack.com/api/conversations.info?${queryparams.toString()}`);
		const response = await request.json();
		return response && response && request.status === 200 && request.ok && response.channel;
	}

	async getMembers(channelId) {
		const { num_members } = this.getRoomInfo(channelId);
		const MAX_MEMBERS_PER_CALL = 100;
		let members = [];
		let currentCursor = '';
		for (let index = 0; index < num_members; index += MAX_MEMBERS_PER_CALL) {
			const queryparams = new URLSearchParams({
				token: this.apiToken,
				channel: channelId,
				limit: MAX_MEMBERS_PER_CALL,
				cursor: currentCursor,
			});

			// eslint-disable-next-line no-await-in-loop
			const request = await fetch(`https://slack.com/api/conversations.members?${queryparams.toString()}`);
			// eslint-disable-next-line no-await-in-loop
			const response = await request.json();
			if (response && response && request.status === 200 && request.ok && Array.isArray(response.members)) {
				members = members.concat(response.members);
				const hasMoreItems = response.response_metadata && response.response_metadata.next_cursor;
				if (hasMoreItems) {
					currentCursor = response.response_metadata.next_cursor;
				}
			}
		}
		return members;
	}

	async react(data) {
		const request = await fetch('https://slack.com/api/reactions.add', {
			method: 'POST',
			body: JSON.stringify(data),
			...defaultFetchOptions,
		});
		const response = await request.json();
		return response && request.status === 200 && response && request.ok;
	}

	async removeReaction(data) {
		const request = await fetch('https://slack.com/api/reactions.remove', {
			method: 'POST',
			body: JSON.stringify(data),
			...defaultFetchOptions,
		});
		const response = await request.json();
		return response && request.status === 200 && response && request.ok;
	}

	async removeMessage(data) {
		const request = await fetch('https://slack.com/api/chat.delete', {
			method: 'POST',
			body: JSON.stringify(data),
			...defaultFetchOptions,
		});
		const response = await request.json();
		return response && request.status === 200 && response && request.ok;
	}

	async sendMessage(data) {
		const request = await fetch('https://slack.com/api/chat.postMessage', {
			method: 'POST',
			body: JSON.stringify(data),
			...defaultFetchOptions,
		});
		return request.json();
	}

	async updateMessage(data) {
		const request = await fetch('https://slack.com/api/chat.update', {
			method: 'POST',
			body: JSON.stringify(data),
			...defaultFetchOptions,
		});
		const response = await request.json();
		return response && request.status === 200 && response && request.ok;
	}

	async getHistory(family, options) {
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			...options,
		});
		const request = await fetch(`https://slack.com/api/${family}.history?${queryparams.toString()}`);
		const response = await request.json();
		return response;
	}

	async getPins(channelId) {
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			channel: channelId,
		});
		const request = await fetch(`https://slack.com/api/pins.list?${queryparams.toString()}`);
		const response = await request.json();
		return response && response && request.status === 200 && request.ok && response.items;
	}

	async getUser(userId) {
		const queryparams = new URLSearchParams({
			token: this.apiToken,
			user: userId,
		});
		const request = await fetch(`https://slack.com/api/users.info?${queryparams.toString()}`);
		const response = await request.json();
		return response && response && request.status === 200 && request.ok && response.user;
	}
}
